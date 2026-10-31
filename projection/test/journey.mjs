import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {launchBrowser} from './browser-helper.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const STORAGE_KEY = 'agile-sprint-lab-projection-v2';
const slides = JSON.parse(await readFile(path.join(root, 'projection/src/slides.json'), 'utf8'));
const originalLogo = await readFile(path.join(root, 'projection/assets/agility-logo.jpg'));
const expectedLogo = `data:image/jpeg;base64,${originalLogo.toString('base64')}`;
const browser = await launchBrowser(), cases = [], errors = [];
const reports = path.join(root, 'projection/reports'), shots = path.join(root, 'projection/screenshots');
await mkdir(reports, {recursive: true});
await mkdir(shots, {recursive: true});
const snapshot = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);

async function newPage(options = {}) {
  const context = await browser.newContext({viewport: {width: 1920, height: 1080}, ...options});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install({time: new Date('2026-11-01T00:30:00Z')});
  await page.clock.pauseAt(new Date('2026-11-01T00:30:01Z'));
  return {page, context};
}
async function record(name, fn) {
  const start = Date.now();
  try {
    await fn();
    cases.push({name, status: 'passed', durationMs: Date.now() - start});
    console.log(`PASS ${name}`);
  } catch (e) {
    cases.push({name, status: 'failed', durationMs: Date.now() - start, error: e.stack});
    console.error(`FAIL ${name}: ${e.message}`);
    throw e;
  }
}

try {
  await record('完整 26 页导引、HOW 逐条点出与页码：P00 → P25、全域计时器独立于换页', async () => {
    const {page, context} = await newPage();
    await page.goto(base);
    assert.equal(await page.locator('#page-number').isVisible(), false);
    await page.locator('.cover-start button').click();
    // Start a 10-minute global timer and verify changing slides or revealing HOW items does not interrupt it.
    await page.keyboard.press('t');
    await page.locator('[data-preset="600"]').click();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Space');
    for (let i = 1; i < slides.length; i++) {
      assert.equal((await snapshot(page)).page, i);
      assert.equal((await page.locator('#page-number').innerText()).replace(/\s+/g, ' ').trim(), `${String(i).padStart(2, '0')} / 25`);
      const steps = slides[i].actions ? slides[i].actions.length : 0;
      assert.equal((await snapshot(page)).reveal, 0, `Page ${slides[i].id} starts with 0 HOW steps revealed`);
      for (let s = 1; s <= steps; s++) {
        await page.locator('#slide .how-head').click();
        assert.equal((await snapshot(page)).reveal, s, `Page ${slides[i].id} click ${s} reveals step ${s}`);
      }
      if (['P04', 'P08', 'P10', 'P12'].includes(slides[i].id)) {
        await page.locator('#slide .card-viewer').click();
        assert.equal(await page.locator('#card-modal').isVisible(), true, `Card modal opens on ${slides[i].id}`);
        if (slides[i].id === 'P08') {
          await page.locator('#card-modal [data-card="ac"]').click();
          assert.match(await page.locator('#card-modal-img').getAttribute('alt'), /Acceptance Criteria/);
        }
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#card-modal').isVisible(), false, `Card modal closes on ${slides[i].id}`);
      }
      await page.clock.fastForward(10000);
      if (i === 17) await page.screenshot({path: path.join(shots, 'journey-P17-bilingual-reminder.png')});
      if (i < 25) await page.keyboard.press('ArrowRight');
    }
    assert.equal(await page.locator('#timer-compact').textContent(), '05:50');
    assert.equal(await page.locator('.contact-card .qr-row img').count(), 2);
    assert.match(await page.locator('.contact-role').innerText(), /Enterprise Agile Coach & Facilitator/);
    await page.screenshot({path: path.join(shots, 'journey-completed.png')});
    await context.close();
  });

  await record('全域浮动计时器：收合、展开、设定、调整、停止、重来与快捷键', async () => {
    const {page, context} = await newPage();
    await page.goto(base);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('t');
    assert.equal(await page.locator('#timer-panel').isVisible(), true);
    await page.locator('#timer-input').fill('7');
    await page.locator('#timer-input').press('ArrowRight');
    assert.equal((await snapshot(page)).page, 1, 'ArrowRight inside input does not change slide');
    await page.locator('#timer-form button').click();
    assert.equal(await page.locator('#timer-compact').textContent(), '07:00');
    await page.keyboard.press('Space');
    await page.clock.fastForward(30000);
    assert.equal(await page.locator('#timer-compact').textContent(), '06:30');
    await page.keyboard.press('-');
    assert.equal(await page.locator('#timer-compact').textContent(), '05:30');
    await page.keyboard.press('s');
    assert.equal(await page.locator('#timer-compact').textContent(), '07:00');
    assert.match(await page.locator('#timer-state').innerText(), /Ready/);
    await page.keyboard.press('r');
    assert.match(await page.locator('#timer-state').innerText(), /Running/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#timer-panel').isVisible(), false);
    await page.clock.fastForward(60000);
    assert.equal(await page.locator('#timer-compact').textContent(), '06:00');
    await context.close();
  });

  await record('进行中重新整理与离线单档：使用截止时间恢复倒数且内嵌原图', async () => {
    const {page, context} = await newPage();
    await page.goto(base);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.clock.fastForward(25000);
    const before = await snapshot(page);
    await page.reload();
    await page.waitForSelector('#timer-compact');
    assert.equal((await snapshot(page)).timer.endsAt, before.timer.endsAt);
    await page.clock.fastForward(35000);
    assert.equal(await page.locator('#timer-compact').textContent(), '04:00');
    await context.close();

    const offline = await newPage({offline: true});
    await offline.page.goto(pathToFileURL(path.join(root, 'projection/Agile-Sprint-Lab-Projection.html')).href);
    const image = offline.page.locator('.cover-mark img');
    await image.waitFor();
    assert.equal(await image.getAttribute('src'), expectedLogo);
    assert.deepEqual(await image.evaluate(async img => {
      await img.decode();
      return [img.naturalWidth, img.naturalHeight, getComputedStyle(img).objectFit];
    }), [1231, 1277, 'contain']);
    await offline.context.close();
  });

  assert.deepEqual(errors, [], 'No browser errors across all end-to-end journeys');
} finally {
  await writeFile(path.join(reports, 'journey.json'), JSON.stringify({browser: browser.version(), cases, errors}, null, 2));
  await browser.close();
}
