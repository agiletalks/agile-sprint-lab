import assert from 'node:assert/strict';
import {launchBrowser} from './browser-helper.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const KEY = 'agile-sprint-lab-projection-v2';
const browser = await launchBrowser();
const context = await browser.newContext({viewport: {width: 1920, height: 1080}});
const page = await context.newPage();
const errors = [], requests = [], layout = [];
page.on('pageerror', e => errors.push(e.message));
page.on('request', r => requests.push(r.url()));
const shots = path.join(root, 'projection/screenshots');
await mkdir(shots, {recursive: true});

try {
  await page.goto(base);
  await page.waitForSelector('.cover h1');
  assert.equal(await page.locator('#console').count(), 0);
  assert.equal(await page.locator('#console-entry').count(), 0);
  assert.match(await page.locator('.cover-role').innerText(), /Enterprise Agile Coach & Facilitator/);
  assert.match(await page.locator('.cover-role').innerText(), /企业敏捷教练与引导师/);
  await page.screenshot({path: path.join(shots, 'P00-cover.png')});

  // Visit every page across 2 resolutions × 3 languages and verify layout with all HOW items revealed.
  for (const size of [{width: 1920, height: 1080}, {width: 1280, height: 720}]) {
    await page.setViewportSize(size);
    for (const lang of ['both', 'en', 'zh']) {
      await page.evaluate(({KEY, lang}) => {
        localStorage.setItem(KEY, JSON.stringify({
          page: 0,
          reveal: 0,
          lang,
          timerOpen: false,
          timer: {durationSec: 300, remainingSec: 300, running: false, endsAt: null}
        }));
      }, {KEY, lang});
      await page.reload();
      await page.waitForSelector('.cover');
      for (let i = 0; i < 26; i++) {
        if (i) await page.keyboard.press('Shift+ArrowRight');
        const dotCount = await page.locator('#slide .how-dot').count();
        if (dotCount > 0) await page.locator('#slide .how-dot').last().click();
        const issues = await page.evaluate(() => {
          const stage = document.querySelector('#slide'), bounds = stage.getBoundingClientRect();
          const visible = el => {
            const cs = getComputedStyle(el);
            return el.getClientRects().length && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden]');
          };
          const result = [];
          for (const el of stage.querySelectorAll('.activity-heading h1,.activity-overview,.content-area,.actions,.diagram,.support-band,.cover-main,.cover-bottom,.contact-card')) {
            if (!visible(el)) continue;
            if (el.scrollHeight > el.clientHeight + 3 || el.scrollWidth > el.clientWidth + 3) {
              result.push({type: 'overflow', tag: el.className, scroll: [el.scrollWidth, el.scrollHeight], client: [el.clientWidth, el.clientHeight]});
            }
            const r = el.getBoundingClientRect();
            if (r.bottom > bounds.bottom + 2 || r.right > bounds.right + 2) {
              result.push({type: 'outside', tag: el.className});
            }
          }
          const title = stage.querySelector('.activity-heading h1');
          const overview = stage.querySelector('.activity-overview');
          if (title && overview && title.getBoundingClientRect().bottom > overview.getBoundingClientRect().top + 1) {
            result.push({type: 'title-overlap'});
          }
          const pill = document.querySelector('.timer-pill');
          if (title && pill && visible(pill)) {
            const tr = title.getBoundingClientRect(), pr = pill.getBoundingClientRect();
            const ox = Math.min(tr.right, pr.right) - Math.max(tr.left, pr.left);
            const oy = Math.min(tr.bottom, pr.bottom) - Math.max(tr.top, pr.top);
            if (ox > 2 && oy > 2) result.push({type: 'title-pill-overlap', ox, oy});
          }
          return result;
        });
        if (issues.length) layout.push({size, language: lang, page: `P${String(i).padStart(2, '0')}`, issues});
        if (size.width === 1920 && lang === 'both') {
          await page.waitForTimeout(100);
          await page.screenshot({path: path.join(shots, `P${String(i).padStart(2, '0')}.png`)});
        }
      }
    }
  }

  // Exercise progressive HOW reveal and global floating timer controls.
  const uiContext = await browser.newContext({viewport: {width: 1920, height: 1080}});
  const ui = await uiContext.newPage();
  ui.on('pageerror', e => errors.push(e.message));
  await ui.clock.install({time: new Date('2026-11-01T00:30:00Z')});
  await ui.goto(base);
  await ui.waitForSelector('.cover');
  assert.equal(await ui.locator('#page-number').isVisible(), false, 'Page number hidden on P00 cover');
  await ui.keyboard.press('ArrowRight');
  assert.equal(await ui.locator('#page-number').isVisible(), true, 'Page number visible on P01');
  assert.equal((await ui.locator('#page-number').innerText()).replace(/\s+/g, ' ').trim(), '01 / 25');

  // Verify P01 has 2 HOW items (including "放松心情玩") and reveals them one by one on click
  assert.equal(await ui.locator('#slide .actions li').count(), 2);
  assert.match(await ui.locator('#slide .actions li').nth(1).innerText(), /放松心情玩/);
  assert.equal(await ui.locator('#slide .actions li.is-hidden').count(), 2, 'Both HOW items start hidden on P01');
  await ui.screenshot({path: path.join(shots, 'P01-step0.png')});
  await ui.locator('#slide .main-grid').click();
  assert.equal(await ui.locator('#slide .actions li.is-hidden').count(), 1, 'First click reveals item 01');
  await ui.screenshot({path: path.join(shots, 'P01-step1.png')});
  await ui.locator('#slide .main-grid').click();
  assert.equal(await ui.locator('#slide .actions li.is-hidden').count(), 0, 'Second click reveals item 02');
  await ui.screenshot({path: path.join(shots, 'P01-step2.png')});

  // Open floating timer panel via T shortcut
  await ui.keyboard.press('t');
  assert.equal(await ui.locator('#timer-panel').isVisible(), true);
  await ui.locator('.preset-page').click();
  assert.equal(await ui.locator('#timer-compact').textContent(), '02:00');
  assert.equal(await ui.locator('#timer-number').textContent(), '02:00');

  // Start timer and fast-forward to expiry
  await ui.keyboard.press('Space');
  assert.match(await ui.locator('#timer-state').innerText(), /Running/);
  await ui.screenshot({path: path.join(shots, 'state-running.png')});
  await ui.clock.fastForward(120000);
  assert.equal(await ui.locator('#timer-number').textContent(), '00:00');
  assert.match(await ui.locator('#timer-state').innerText(), /Time's up/);
  await ui.screenshot({path: path.join(shots, 'state-expired.png')});

  // Restart timer (resets to 02:00 and starts immediately)
  await ui.locator('[data-cmd="restart"]').click();
  assert.equal(await ui.locator('#timer-number').textContent(), '02:00');
  assert.match(await ui.locator('#timer-state').innerText(), /Running/);
  await ui.clock.fastForward(15000);
  await ui.keyboard.press('Space');
  assert.equal(await ui.locator('#timer-number').textContent(), '01:45');
  assert.match(await ui.locator('#timer-state').innerText(), /Paused/);
  await ui.screenshot({path: path.join(shots, 'state-paused.png')});

  // Stop timer (resets to 02:00 and stays Ready)
  await ui.locator('[data-cmd="stop"]').click();
  assert.equal(await ui.locator('#timer-number').textContent(), '02:00');
  assert.match(await ui.locator('#timer-state').innerText(), /Ready/);

  // Adjust buttons (-60, 10)
  await ui.locator('[data-adjust="-60"]').click();
  assert.equal(await ui.locator('#timer-number').textContent(), '01:00');
  await ui.locator('[data-adjust="10"]').click();
  assert.equal(await ui.locator('#timer-number').textContent(), '01:10');

  // Set custom time via form
  await ui.locator('#timer-input').fill('03:30');
  await ui.locator('#timer-form button').click();
  assert.equal(await ui.locator('#timer-number').textContent(), '03:30');

  // Switch language inside floating panel
  await ui.locator('[data-lang="en"]').click();
  assert.ok(await ui.locator('#frame').evaluate(el => el.classList.contains('lang-en')));
  await ui.keyboard.press('Escape');
  assert.equal(await ui.locator('#timer-panel').isVisible(), false);
  await uiContext.close();

  // Verify standalone offline file over file://
  const offline = await browser.newContext({viewport: {width: 1280, height: 720}, offline: true});
  const filePage = await offline.newPage();
  filePage.on('pageerror', e => errors.push(e.message));
  await filePage.goto(pathToFileURL(path.join(root, 'projection/dist/Agile-Sprint-Lab-Projection.html')).href);
  await filePage.waitForSelector('#timer-compact');
  await filePage.keyboard.press('ArrowRight');
  await filePage.keyboard.press('+');
  const before = await filePage.locator('#timer-compact').textContent();
  await filePage.reload();
  assert.equal(await filePage.locator('#timer-compact').textContent(), before);
  assert.equal((await filePage.locator('#page-number').innerText()).replace(/\s+/g, ' ').trim(), '01 / 25');
  await offline.close();

  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  assert.equal(requests.filter(u => !u.startsWith(base)).length, 0, 'No runtime external requests');
  await writeFile(path.join(shots, 'layout-report.json'), JSON.stringify({errors, layout, requestCount: requests.length}, null, 2));
  console.log(JSON.stringify({browser: browser.version(), errors, layoutIssues: layout.length, offline: 'file:// passed', pages: 26, sizes: 2, languages: 3}, null, 2));
  assert.equal(layout.length, 0, 'Layout overflow detected; see projection/screenshots/layout-report.json');
} finally {
  await browser.close();
}
