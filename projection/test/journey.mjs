import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {launchBrowser} from './browser-helper.mjs';
import {STORAGE_KEY,validateState,clockText} from '../src/engine.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const slides=JSON.parse(await readFile(path.join(root,'projection/src/slides.json'),'utf8'));
const browser=await launchBrowser(),cases=[],errors=[];
const reports=path.join(root,'projection/reports'),shots=path.join(root,'projection/screenshots');
await mkdir(reports,{recursive:true});await mkdir(shots,{recursive:true});
const snapshot=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),STORAGE_KEY);
async function newPage(options={}) {
 const context=await browser.newContext({viewport:{width:1920,height:1080},...options});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-11-01T00:30:00Z')});
 await page.clock.pauseAt(new Date('2026-11-01T00:30:01Z'));
 return {page,context};
}
async function record(name,fn){const start=Date.now();try{await fn();cases.push({name,status:'passed',durationMs:Date.now()-start});console.log(`PASS ${name}`);}catch(e){cases.push({name,status:'failed',durationMs:Date.now()-start,error:e.stack});console.error(`FAIL ${name}: ${e.message}`);throw e;}}
async function open(page){if(!await page.locator('#console').evaluate(d=>d.open))await page.locator('#console-entry').click({force:true});}
async function close(page){if(await page.locator('#console').evaluate(d=>d.open))await page.locator('[data-command="panel-close"]').click();}
async function details(page,id){if(!await page.locator(`#${id}`).evaluate(d=>d.open))await page.locator(`#${id}>summary`).click();}
async function download(page,command){await details(page,'management-details');const pending=page.waitForEvent('download');await page.locator(`[data-command="${command}"]`).click();return readFile(await (await pending).path());}
try {
 await record('完整 120 分鐘：P00 → P25、13 步驟、全程無自動換頁',async()=>{
  const {page,context}=await newPage();await page.goto(base);await page.locator('.cover-start button').click();
  for(let i=1;i<slides.length;i++) {
   assert.match(await page.locator('.page-code').innerText(),new RegExp(slides[i].id));
   assert.equal(await page.locator('#timer-number').innerText(),clockText(slides[i].durationSec));
   if(i===17){
    await page.clock.fastForward((1620-600)*1000);assert.match(await page.locator('#support-band').innerText(),/Check your AC/);
    await page.clock.fastForward(420000);assert.match(await page.locator('#support-band').innerText(),/Finish and capture/);
    await page.screenshot({path:path.join(shots,'journey-P17-bilingual-reminder.png')});
    await page.clock.fastForward(180000);
   }else await page.clock.fastForward(slides[i].durationSec*1000);
   assert.equal(await page.locator('#timer-number').innerText(),'00:00');
   assert.match(await page.locator('#timer-state').innerText(),/Time is up/);
   assert.equal((await snapshot(page)).activePage,i);
   if(i<25)await page.keyboard.press('Shift+PageDown');
  }
  await page.keyboard.press('PageDown');assert.equal((await snapshot(page)).activePage,25);
  await open(page);assert.equal(await page.locator('#metric-elapsed').innerText(),'120:00');
  assert.equal(await page.locator('#metric-deferred').innerText(),'00:00');
  assert.equal(await page.locator('#metric-eta').innerText(),'已排入活動結束');
  const final=JSON.parse((await download(page,'backup')).toString());assert.ok(validateState(final,slides));
  assert.ok(final.pages.slice(1).every(p=>p.planState==='completed'&&p.remainingSec===0));
  assert.equal(final.pages.reduce((n,p)=>n+p.activeElapsedSec,0),7200);
  await page.locator('[data-command="timer"]').click();await close(page);
  assert.equal(await page.locator('#timer-number').evaluate(e=>getComputedStyle(e).visibility),'hidden');
  assert.ok(await page.locator('.profile-contact .email').isVisible());
  await page.screenshot({path:path.join(shots,'journey-completed.png')});await context.close();
 });
 await record('焦點與快捷鍵：按鈕焦點、輸入欄位、Esc、控制台不影響倒數',async()=>{
  const {page,context}=await newPage();await page.goto(base);await page.locator('#console-entry').click({force:true});
  await page.locator('[data-command="panel-close"]').click();await page.keyboard.press('ArrowRight');
  assert.equal((await snapshot(page)).activePage,1);
  await page.keyboard.press('Space');await page.clock.fastForward(10000);await open(page);await page.clock.fastForward(10000);
  assert.equal(await page.locator('#timer-number').innerText(),'01:40');
  await page.locator('[data-command="toggle"]').click();
  await page.locator('#remaining-input').fill('00:30');await page.locator('#remaining-input').press('ArrowRight');
  assert.equal((await snapshot(page)).activePage,1);assert.equal(await page.locator('#timer-number').innerText(),'01:40');
  await page.locator('#remaining-form button').click();assert.equal(await page.locator('#timer-number').innerText(),'00:30');
  await page.keyboard.press('Escape');await page.keyboard.press('ArrowRight');assert.equal((await snapshot(page)).activePage,2);
  await context.close();
 });
 await record('跳頁、回看、重新排入、捨棄、轉移：UI 與實際配額一致',async()=>{
  const {page,context}=await newPage();await page.goto(base);await open(page);await page.locator('[data-page="4"]').click();
  await page.locator('[data-command="toggle"]').click();await close(page);await page.clock.fastForward(120000);await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#step-left strong').innerText(),'09:00');
  let state=await snapshot(page);assert.equal(state.pages[4].remainingSec,60);assert.equal(state.pages[4].planState,'deferred');
  await open(page);await details(page,'deferred-details');
  const total=state.pages.reduce((n,p)=>n+p.remainingSec,0);
  await page.locator('#transfer-4').selectOption('5');await page.locator('[data-transfer="4"]').click();
  state=await snapshot(page);assert.equal(state.pages[5].remainingSec,360);assert.equal(state.pages[4].remainingSec,0);
  assert.equal(state.pages.reduce((n,p)=>n+p.remainingSec,0),total);
  assert.ok(await page.locator('#deferred-details').evaluate(d=>d.open),'Details remain open after changing allocations');
  await page.locator('[data-requeue="1"]').click();state=await snapshot(page);assert.equal(state.pages[1].planState,'scheduled');
  await page.locator('[data-discard="2"]').click();assert.equal((await snapshot(page)).pages[2].planState,'completed');
  await page.locator('[data-page="3"]').click();assert.match(await page.locator('#preview-label').innerText(),/Preview/);
  const before=(await snapshot(page)).pages[3].remainingSec;await page.locator('[data-command="toggle"]').click();
  assert.equal((await snapshot(page)).pages[3].planState,'scheduled');assert.equal((await snapshot(page)).pages[3].remainingSec,before);
  await context.close();
 });
 await record('進行中重新整理與背景時間：使用原始截止時間恢復',async()=>{
  const {page,context}=await newPage();await page.goto(base);await page.keyboard.press('Space');await page.clock.fastForward(10000);
  const before=await snapshot(page);await page.reload();await page.waitForSelector('#timer-number');
  assert.equal((await snapshot(page)).pages[1].deadlineAtMs,before.pages[1].deadlineAtMs);
  await page.clock.fastForward(20000);assert.equal(await page.locator('#timer-number').innerText(),'01:30');
  // A delayed tick mimics throttled background rendering without decrementing interval counts.
  await page.clock.fastForward(200000);assert.equal(await page.locator('#timer-number').innerText(),'00:00');
  assert.equal((await snapshot(page)).activePage,1);assert.equal((await snapshot(page)).pages[1].activeElapsedSec,120);
  await context.close();
 });
 await record('實際備份下載、清除、取消還原、同檔重試、確認還原',async()=>{
  const {page,context}=await newPage();await page.goto(base);await page.keyboard.press('Space');await page.clock.fastForward(20000);await page.keyboard.press('Space');await open(page);
  const bytes=await download(page,'backup'),backup=JSON.parse(bytes.toString());assert.ok(validateState(backup,slides));
  await page.locator('[data-command="clear"]').click();await page.locator('#do-clear').click();
  const payload={name:'rehearsal.json',mimeType:'application/json',buffer:bytes};
  page.once('dialog',d=>d.dismiss());await page.locator('#restore-file').setInputFiles(payload);
  await page.waitForFunction(()=>document.querySelector('#announcement').textContent==='已取消還原，原進度保留');assert.equal((await snapshot(page)).activePage,0);
  page.once('dialog',d=>d.accept());await page.locator('#restore-file').setInputFiles(payload);
  await page.waitForFunction(()=>document.querySelector('#announcement').textContent==='進度已還原');
  assert.equal((await snapshot(page)).activePage,1);assert.equal(await page.locator('#timer-number').innerText(),'01:40');
  assert.equal((await snapshot(page)).workshopStartedAt,backup.workshopStartedAt);
  const restored=await snapshot(page);
  await page.locator('#restore-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"bad":true}')});
  await page.locator('#panel-error').filter({hasText:'格式不相容或無效'}).waitFor();assert.deepEqual(await snapshot(page),restored);
  await context.close();
 });
 await record('Logo 原始 bytes、設定、語言與匯出單檔：離線新環境可完整使用',async()=>{
  const {page,context}=await newPage();await page.goto(base);await open(page);await details(page,'settings-details');
  await page.locator('[name="title"]').fill('Local rehearsal');await page.locator('[name="teamSizeMin"]').fill('3');await page.locator('[name="teamSizeMax"]').fill('6');
  await page.locator('[name="languageMode"]').selectOption('zh');await page.locator('[name="uploadUrl"]').fill('https://example.com/成果');
  await page.locator('#settings-form button').click();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6H0sAAAAASUVORK5CYII=','base64');
  await page.locator('#logo-file').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:png});await page.locator('img.top-logo').waitFor();
  const config=(await snapshot(page)).config;assert.equal(config.logoDataUri,`data:image/png;base64,${png.toString('base64')}`);
  const html=await download(page,'export-html'),exportPath=path.join(reports,'rehearsal-export.html');await writeFile(exportPath,html);
  const offline=await newPage({offline:true});
  const requests=[];offline.page.on('request',r=>requests.push(r.url()));
  await offline.page.goto(pathToFileURL(exportPath).href);assert.equal(await offline.page.locator('.wordmark span:last-child').textContent(),'Local rehearsal');
  assert.equal(await offline.page.locator('img.top-logo').getAttribute('src'),config.logoDataUri);
  await offline.page.locator('.cover-start button').click();await open(offline.page);await offline.page.locator('[data-page="6"]').click();await close(offline.page);
  assert.match(await offline.page.locator('.actions').innerText(),/3–6/);
  await open(offline.page);await offline.page.locator('[data-page="18"]').click();await close(offline.page);assert.equal(await offline.page.locator('.upload-box svg').count(),1);
  assert.ok(requests.every(u=>u.startsWith('file:')||u.startsWith('data:')),'Export never fetches remote assets');
  await offline.context.close();await context.close();
 });
 assert.deepEqual(errors,[],'No browser errors across all end-to-end journeys');
}finally{
 await writeFile(path.join(reports,'journey.json'),JSON.stringify({browser:browser.version(),cases,errors},null,2));
 await browser.close();
}
