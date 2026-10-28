import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const playwright=require('playwright');
const root=fileURLToPath(new URL('../../',import.meta.url));
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const browser=await playwright.chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||playwright.chromium.executablePath()});
const context=await browser.newContext({viewport:{width:1920,height:1080}});
const page=await context.newPage();
const errors=[],requests=[],layout=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>requests.push(r.url()));
const shots=path.join(root,'projection/screenshots');await mkdir(shots,{recursive:true});
try {
 await page.addInitScript(()=>{
  const language=sessionStorage.getItem('test-language');if(!language)return;
  const key='agile-sprint-lab-projection-v1',s=JSON.parse(localStorage.getItem(key));if(!s)return;
  s.config.languageMode=language;s.activePage=0;
  s.pages.forEach(p=>{if(p.timerState==='running'){p.timerState='paused';p.deadlineAtMs=null;p.lastAccountedAtMs=null;}});
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.goto(base);await page.waitForSelector('.cover h1');
 await page.screenshot({path:path.join(shots,'P00-cover.png')});
 await page.keyboard.press('Space');await page.waitForSelector('#timer-number');
 assert.equal(await page.locator('#timer-state').innerText(),'In progress\n進行中');
 await page.keyboard.press('Space');
 await page.keyboard.press('p');await page.waitForSelector('#console[open]');
 assert.ok(await page.locator('#metric-elapsed').innerText());
 await page.keyboard.press('Escape');
 // Visit every page using presentation controls; measure at each display/language.
 for(const size of [{width:1920,height:1080},{width:1280,height:720}]) {
  await page.setViewportSize(size);
  for(const language of ['both','en','zh']) {
   await page.evaluate(language=>sessionStorage.setItem('test-language',language),language);
   await page.reload();await page.waitForSelector('.cover');
   for(let i=0;i<26;i++) {
    if(i)await page.keyboard.press('ArrowRight');
    const issues=await page.evaluate(()=>{
     const stage=document.querySelector('#slide'),bounds=stage.getBoundingClientRect();
     const visible=el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden';
     const result=[];
     for(const el of stage.querySelectorAll('.title-block h1,.content-area,.timer-card,.footer-info,.bottom-bar,.actions,.diagram,.support-band,.cover-main,.cover-bottom')) {
      if(!visible(el))continue;
      if(el.scrollHeight>el.clientHeight+3||el.scrollWidth>el.clientWidth+3)result.push({type:'overflow',tag:el.className,scroll:[el.scrollWidth,el.scrollHeight],client:[el.clientWidth,el.clientHeight]});
      const r=el.getBoundingClientRect();if(r.bottom>bounds.bottom+2||r.right>bounds.right+2)result.push({type:'outside',tag:el.className});
     }
     const main=stage.querySelector('.main-grid'),footer=stage.querySelector('.footer-info');
     const title=stage.querySelector('.title-block h1');
     if(title&&main&&title.getBoundingClientRect().bottom>main.getBoundingClientRect().top)result.push({type:'title-overlap'});
     if(main&&footer){const bottom=Math.max(...[...main.querySelectorAll('.actions,.diagram,.support-band,.matrix-layout,.upload-box,.profile-contact,.closing-thanks')].filter(visible).map(e=>e.getBoundingClientRect().bottom));if(bottom>footer.getBoundingClientRect().top+1)result.push({type:'footer-overlap',bottom,top:footer.getBoundingClientRect().top});}
     return result;
    });
    if(issues.length)layout.push({size,language,page:`P${String(i).padStart(2,'0')}`,issues});
    if(size.width===1920&&language==='both'&&[1,2,4,5,8,13,14,17,24,25].includes(i))await page.screenshot({path:path.join(shots,`P${String(i).padStart(2,'0')}.png`)});
   }
  }
 }
 // Exercise controls, rather than only loading static pages.
 const uiContext=await browser.newContext({viewport:{width:1920,height:1080}});
 const ui=await uiContext.newPage();ui.on('pageerror',e=>errors.push(e.message));
 await ui.clock.install({time:new Date('2026-11-01T00:30:00Z')});
 await ui.goto(base);await ui.waitForSelector('.cover');
 await ui.keyboard.press('Space');await ui.clock.fastForward(120000);
 assert.equal(await ui.locator('#timer-number').innerText(),'00:00');
 assert.match(await ui.locator('#timer-state').innerText(),/Time is up/);
 await ui.screenshot({path:path.join(shots,'state-expired.png')});
 await ui.keyboard.press('ArrowRight');assert.match(await ui.locator('#timer-state').innerText(),/Ready/);
 await ui.keyboard.press('Shift+ArrowRight');assert.match(await ui.locator('#timer-state').innerText(),/In progress/);
 await ui.screenshot({path:path.join(shots,'state-running.png')});
 await ui.clock.fastForward(10000);await ui.keyboard.press('Space');
 const paused=await ui.locator('#timer-number').innerText();
 await ui.screenshot({path:path.join(shots,'state-paused.png')});
 await ui.reload();assert.equal(await ui.locator('#timer-number').innerText(),paused);
 await ui.keyboard.press('p');await ui.locator('#remaining-input').fill('00:30');await ui.locator('#remaining-form button').click();
 assert.equal(await ui.locator('#timer-number').innerText(),'00:30');
 await ui.locator('[data-command="minus"]').click();assert.equal(await ui.locator('#timer-number').innerText(),'00:00');
 await ui.locator('[data-command="plus"]').click();assert.match(await ui.locator('#timer-state').innerText(),/Paused/);
 await ui.locator('#settings-details summary').click();
 await ui.locator('[name="languageMode"]').selectOption('en');
 await ui.locator('[name="uploadUrl"]').fill('https://example.com/upload');
 await ui.locator('#settings-form button').click();assert.equal(await ui.locator('#timer-number').innerText(),'01:00');
 assert.ok(await ui.locator('#slide').evaluate(el=>el.classList.contains('lang-en')));
 await ui.locator('[data-page="18"]').click();await ui.keyboard.press('Escape');
 assert.equal(await ui.locator('.upload-box svg').count(),1);
 assert.equal(await ui.locator('.upload-box a').getAttribute('href'),'https://example.com/upload');
 const uploadIssues=await ui.locator('.content-area').evaluate(e=>e.scrollHeight>e.clientHeight+3);
 assert.equal(uploadIssues,false,'Upload QR fits in activity content');
 await ui.keyboard.press('p');await ui.locator('[data-page="17"]').click();
 await ui.locator('#remaining-input').fill('03:01');await ui.locator('#remaining-form button').click();
 await ui.locator('[data-command="toggle"]').click();await ui.keyboard.press('Escape');await ui.clock.fastForward(2000);
 assert.match(await ui.locator('#support-band').innerText(),/Finish and capture/);
 await ui.screenshot({path:path.join(shots,'P17-three-minute-reminder.png')});
 const reminderFits=await ui.locator('.content-area').evaluate(e=>e.scrollHeight<=e.clientHeight+3);assert.ok(reminderFits);
 await ui.keyboard.press('Space');await ui.keyboard.press('p');
 await ui.locator('summary').filter({hasText:'匯出與進度管理'}).click();
 const downloadPromise=ui.waitForEvent('download');await ui.locator('[data-command="export-html"]').click();
 const download=await downloadPromise;const exported=await readFile(await download.path(),'utf8');
 assert.ok(exported.includes('https://example.com/upload'));assert.ok(exported.includes('config-data'));assert.ok(!exported.includes('<dialog id="console" open'));
 await ui.locator('[data-command="clear"]').click();await ui.locator('#cancel-clear').click();
 assert.equal(await ui.locator('#timer-number').innerText(),'02:59');
 await ui.locator('[data-command="clear"]').click();await ui.locator('#do-clear').click();
 assert.equal(await ui.locator('.cover').count(),1);
 await ui.keyboard.press('p'); // closes the console even when its button has focus
 assert.equal(await ui.locator('#console[open]').count(),0);
 await uiContext.close();
 // Corrupt storage is preserved until an explicit clear, never silently replaced.
 const corruptContext=await browser.newContext();const corrupt=await corruptContext.newPage();
 await corrupt.addInitScript(()=>localStorage.setItem('agile-sprint-lab-projection-v1','broken-json'));
 await corrupt.goto(base);await corrupt.keyboard.press('p');
 assert.match(await corrupt.locator('.storage-warning').innerText(),/尚未覆寫/);
 assert.equal(await corrupt.evaluate(()=>localStorage.getItem('agile-sprint-lab-projection-v1')),'broken-json');
 await corruptContext.close();
 // A denied write must not prevent starting or using the timer.
 const deniedContext=await browser.newContext();const denied=await deniedContext.newPage();
 await denied.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Denied','QuotaExceededError');};});
 await denied.goto(base);await denied.keyboard.press('Space');await denied.keyboard.press('p');
 assert.match(await denied.locator('.storage-warning').innerText(),/記憶體/);
 assert.match(await denied.locator('#timer-state').innerText(),/In progress/);
 await deniedContext.close();

 // Verify the standalone file with offline networking and file:// storage.
 const offline=await browser.newContext({viewport:{width:1280,height:720},offline:true});
 const filePage=await offline.newPage();filePage.on('pageerror',e=>errors.push(e.message));
 await filePage.goto(pathToFileURL(path.join(root,'projection/dist/Agile-Sprint-Lab-Projection.html')).href);
 await filePage.keyboard.press('Space');await filePage.waitForSelector('#timer-number');
 await filePage.keyboard.press('Space');const before=await filePage.locator('#timer-number').innerText();
 await filePage.reload();assert.equal(await filePage.locator('#timer-number').innerText(),before);
 await offline.close();
 assert.deepEqual(errors,[],'Browser JavaScript errors');
 assert.equal(requests.filter(u=>!u.startsWith(base)).length,0,'No runtime external requests');
 await writeFile(path.join(shots,'layout-report.json'),JSON.stringify({errors,layout,requestCount:requests.length},null,2));
 console.log(JSON.stringify({browser:browser.version(),errors,layoutIssues:layout.length,layout:layout.slice(0,12),offline:'file:// passed',pages:26,sizes:2,languages:3},null,2));
 assert.equal(layout.length,0,'Layout overflow detected; see projection/screenshots/layout-report.json');
} finally {await browser.close();}
