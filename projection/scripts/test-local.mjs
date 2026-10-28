import {spawn} from 'node:child_process';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const reportDir=path.join(root,'projection/reports');await mkdir(reportDir,{recursive:true});
const startedAt=new Date(),results=[];
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let server,base,log='';
function run(name,args,env={}){
 return new Promise(resolve=>{
  const start=Date.now(),child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});let output='';
  for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{output+=b;process.stdout.write(b);});
  child.on('error',e=>{output+=e.stack;});
  child.on('close',code=>{results.push({name,status:code===0?'passed':'failed',durationMs:Date.now()-start,output});resolve(code===0);});
 });
}
try{
 const tests=(await readdir(path.join(root,'projection/test'))).filter(f=>f.endsWith('.test.mjs')).map(f=>`projection/test/${f}`);
 await run('狀態核心測試',['--test',...tests]);
 // Own an ephemeral-port server; do not change or reuse the user's rehearsal state.
 await new Promise((resolve,reject)=>{
  server=spawn(process.execPath,['projection/scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'0',HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
  const timer=setTimeout(()=>reject(Error('本機測試服務啟動逾時')),20000);
  server.stdout.on('data',b=>{log+=b;process.stdout.write(b);const match=log.match(/projection: (http:\/\/127\.0\.0\.1:\d+)/);if(match){base=match[1];clearTimeout(timer);resolve();}});
  server.stderr.on('data',b=>{log+=b;process.stderr.write(b);});
  server.once('error',e=>{clearTimeout(timer);reject(e);});
  server.once('exit',code=>{if(!base){clearTimeout(timer);reject(Error(`服務啟動失敗 (${code}): ${log}`));}});
 });
 await run('26 頁 × 2 解析度 × 3 語言、基本操作與離線開檔',['projection/test/browser.mjs'],{TEST_URL:base});
 await run('完整工作坊與備份還原端到端流程',['projection/test/journey.mjs'],{TEST_URL:base});
}catch(e){results.push({name:'本機測試服務',status:'failed',output:e.stack});console.error(e.message);}
finally{
 if(server&&server.exitCode===null)server.kill('SIGTERM');
 let journey={cases:[]};try{journey=JSON.parse(await readFile(path.join(reportDir,'journey.json'),'utf8'));}catch{}
 const data={startedAt:startedAt.toISOString(),completedAt:new Date().toISOString(),status:results.length===3&&results.every(r=>r.status==='passed')?'passed':'failed',results,journey};
 await writeFile(path.join(reportDir,'latest.json'),JSON.stringify(data,null,2));
 const rows=[...results,...journey.cases].map(r=>`<tr><td>${html(r.name)}</td><td class="${r.status}">${r.status==='passed'?'通過':'失敗'}</td><td>${r.durationMs?(r.durationMs/1000).toFixed(2)+' 秒':''}</td></tr>`).join('');
 const document=`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Agile Sprint Lab｜本機端到端測試</title><style>body{font:16px/1.6 Arial,'PingFang TC',sans-serif;max-width:1100px;margin:40px auto;padding:0 24px;color:#151515;background:#f5f5f3}a{color:#a63900}h1{font-size:36px}table{border-collapse:collapse;width:100%;background:white}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}.passed{color:#237a3b;font-weight:bold}.failed{color:#b42318;font-weight:bold}.links{display:flex;gap:20px;flex-wrap:wrap}pre{white-space:pre-wrap;font-size:12px;background:white;padding:15px}summary{cursor:pointer}small{color:#525252}</style><h1>本機端到端測試：<span class="${data.status}">${data.status==='passed'?'通過':'需修正'}</span></h1><p>${html(new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',dateStyle:'medium',timeStyle:'medium'}).format(startedAt))} · ${html(journey.browser||'Chrome')}</p><p>完整 120 分鐘流程以瀏覽器虛擬時鐘執行；沒有等待真實兩小時。測試使用隔離瀏覽器，不改動你的場次進度。</p><p class="links"><a href="/">開啟工作坊投影</a><a href="/Agile-Sprint-Lab-Projection.html" download>下載離線單檔</a></p><table><thead><tr><th>檢查</th><th>結果</th><th>執行時間</th></tr></thead><tbody>${rows}</tbody></table><h2>代表畫面</h2><p class="links">${[['P00-cover.png','待機'],['P08.png','雙卡說明'],['P14.png','矩陣'],['journey-P17-bilingual-reminder.png','三分鐘提醒'],['journey-completed.png','完整流程結束']].map(([f,label])=>`<a href="/qa/${f}">${label}</a>`).join('')}</p><h2>驗證範圍</h2><p>本次為本機 Chrome 與直接離線開檔。實際 Safari／Edge、會場投影與音訊輸出仍需現場確認；Logo 原圖已內嵌。沒有部署雲端。</p>${results.map(r=>`<details><summary>${html(r.name)}：執行紀錄</summary><pre>${html(r.output)}</pre></details>`).join('')}</html>`;
 await writeFile(path.join(reportDir,'latest.html'),document);
 console.log(`\nEnd-to-end suite: ${data.status.toUpperCase()}\nReport: projection/reports/latest.html\nLive report: http://127.0.0.1:4173/test-results`);
 if(data.status!=='passed')process.exitCode=1;
}
