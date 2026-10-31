// Layout audit: every page × language × floating timer state (with all HOW steps revealed).
import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const out = process.env.SHOTS || 'C:/Users/agile/.gemini/antigravity/brain/ba551035-227f-4c30-b85d-1f02c063503b/scratch/audit';
const shotFilter = process.env.SHOT || 'both-collapsed';
fs.mkdirSync(out, {recursive: true});
const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({headless: true, executablePath: exe});
const errors = [];
const KEY = 'agile-sprint-lab-projection-v2';
const report = [];
for (const lang of ['both', 'en', 'zh']) {
  for (const expanded of [false, true]) {
    const ctx = await browser.newContext({viewport: {width: 1920, height: 1080}});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    await page.evaluate(({KEY, lang, expanded}) => {
      localStorage.setItem(KEY, JSON.stringify({
        page: 0,
        reveal: 0,
        lang,
        timerOpen: expanded,
        timer: {durationSec: 300, remainingSec: 300, running: false, endsAt: null}
      }));
    }, {KEY, lang, expanded});
    await page.reload();
    await page.waitForSelector('.cover');
    for (let i = 0; i < 26; i++) {
      if (i) await page.keyboard.press('Shift+ArrowRight');
      // Reveal all HOW items on this page so layout audit checks full content
      const dotCount = await page.locator('#slide .how-dot').count();
      if (dotCount > 0) await page.locator('#slide .how-dot').last().click();
      await page.waitForTimeout(100);
      const issues = await page.evaluate((expanded) => {
        const stage = document.querySelector('#slide');
        const sb = stage.getBoundingClientRect();
        const scale = sb.width / 1920;
        const safe = {l: sb.left + 96 * scale - 2, r: sb.right - 96 * scale + 2, t: sb.top + 40 * scale, b: sb.bottom - 48 * scale};
        const vis = el => { const cs = getComputedStyle(el); return el.getClientRects().length && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('.sr-only') && !el.closest('[hidden]'); };
        const res = [];
        const leaves = [];
        const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement; if (!vis(el)) continue;
          const range = document.createRange(); range.selectNodeContents(n);
          const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0);
          if (!rects.length) continue;
          const r = rects.reduce((a, b) => ({left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom)}));
          const fs = parseFloat(getComputedStyle(el).fontSize);
          const txt = n.textContent.trim().slice(0, 40);
          if (fs < 18) res.push({type: 'small-font', fs, txt});
          if (r.right > safe.r || r.bottom > safe.b || r.left < safe.l - 1) res.push({type: 'outside-safe', txt, r: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]});
          leaves.push({el, r, txt, rects});
        }
        for (const t of stage.querySelectorAll('svg text')) {
          if (!vis(t)) continue; const r = t.getBoundingClientRect(); leaves.push({el: t, r, txt: t.textContent.slice(0, 30), rects: [r]});
          if (r.right > safe.r || r.bottom > safe.b) res.push({type: 'outside-safe-svg', txt: t.textContent});
        }
        for (let a = 0; a < leaves.length; a++) for (let b = a + 1; b < leaves.length; b++) {
          const A = leaves[a], B = leaves[b];
          if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
          for (const ra of A.rects) for (const rb of B.rects) {
            const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
            const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
            if (ox > 3 && oy > 3) { res.push({type: 'overlap', a: A.txt, b: B.txt, ox: Math.round(ox), oy: Math.round(oy)}); }
          }
        }
        if (!expanded) {
          const pill = document.querySelector('.timer-pill');
          const pr = pill && vis(pill) ? pill.getBoundingClientRect() : null;
          const pager = document.querySelector('#page-number');
          const pgr = pager && vis(pager) ? pager.getBoundingClientRect() : null;
          for (const L of leaves) {
            for (const ra of L.rects) {
              if (pr) {
                const ox = Math.min(ra.right, pr.right) - Math.max(ra.left, pr.left);
                const oy = Math.min(ra.bottom, pr.bottom) - Math.max(ra.top, pr.top);
                if (ox > 2 && oy > 2) res.push({type: 'pill-overlap', txt: L.txt, ox: Math.round(ox), oy: Math.round(oy)});
              }
              if (pgr) {
                const ox = Math.min(ra.right, pgr.right) - Math.max(ra.left, pgr.left);
                const oy = Math.min(ra.bottom, pgr.bottom) - Math.max(ra.top, pgr.top);
                if (ox > 2 && oy > 2) res.push({type: 'pager-overlap', txt: L.txt, ox: Math.round(ox), oy: Math.round(oy)});
              }
            }
          }
        }
        for (const el of document.querySelectorAll('.content-area,.how-body,.how-main,.diagram,.activity-overview,.cover-main,.contact-card,.cycle-wrap,.actions,.timer-panel')) {
          if (!vis(el)) continue;
          if (el.scrollHeight > el.clientHeight + 3 || el.scrollWidth > el.clientWidth + 3) res.push({type: 'clipped', cls: el.className, scroll: [el.scrollWidth, el.scrollHeight], client: [el.clientWidth, el.clientHeight]});
          const r = el.getBoundingClientRect();
          if (r.bottom > sb.bottom - 48 * scale + 1) res.push({type: 'block-below-safe', cls: el.className, bottom: Math.round(r.bottom)});
        }
        const main = stage.querySelector('.content-area');
        let contentBottom = 0;
        if (main) for (const l of leaves) contentBottom = Math.max(contentBottom, l.r.bottom);
        return {res, contentBottom: Math.round(contentBottom)};
      }, expanded);
      const id = `P${String(i).padStart(2, '0')}`;
      const tag = `${lang}-${expanded ? 'expanded' : 'collapsed'}`;
      if (issues.res.length) report.push({id, tag, issues: issues.res});
      if (shotFilter === 'all' || shotFilter === tag || (shotFilter === 'sample' && (tag === 'both-collapsed' || (tag === 'both-expanded' && i === 5)))) {
        await page.screenshot({path: path.join(out, `${tag}-${id}.png`)});
      }
      if (tag === 'both-collapsed') console.log(id, 'content bottom', issues.contentBottom);
    }
    await ctx.close();
  }
}
fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify({errors, report}, null, 2));
console.log('errors', errors);
console.log('pages with issues:', report.length);
for (const r of report.slice(0, 40)) console.log(r.tag, r.id, JSON.stringify(r.issues.slice(0, 4)));
await browser.close();
