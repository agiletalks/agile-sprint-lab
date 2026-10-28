import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Workshop,freshState,validateState,clockText,validUploadUrl,targetTimestamp} from '../src/engine.js';
const slides=JSON.parse(readFileSync(new URL('../src/slides.json',import.meta.url),'utf8'));
function setup(state){let now=1_000_000;const w=new Workshop(slides,state,()=>now);return {w,advance:sec=>{now+=sec*1000;w.settle();}};}
test('26 stable pages, 13 steps, exactly 7200 seconds',()=>{
 assert.deepEqual(slides.map(s=>s.id),Array.from({length:26},(_,i)=>`P${String(i).padStart(2,'0')}`));
 assert.equal(slides.reduce((n,s)=>n+s.durationSec,0),7200);assert.equal(new Set(slides.slice(1).map(s=>s.stepId)).size,13);
});
test('P00 starts both clocks once; returning through cover preserves progress',()=>{
 const {w,advance}=setup();w.start();assert.equal(w.state.activePage,1);assert.equal(w.page.timerState,'running');
 const started=w.state.workshopStartedAt;advance(30);w.navigate(0);advance(60);w.start();
 assert.equal(w.state.activePage,1);assert.equal(w.page.remainingSec,90);assert.equal(w.page.timerState,'paused');assert.equal(w.state.workshopStartedAt,started);
});
test('direct first start at P04 defers P01–P03',()=>{
 const {w}=setup();w.navigate(4);assert.equal(w.state.workshopStartedAt,null);w.start();
 assert.ok(w.state.pages.slice(1,4).every(p=>p.planState==='deferred'));assert.equal(w.page.timerState,'running');
});
test('early next preserves 60 seconds, step excludes deferred; preview does not requeue',()=>{
 const {w,advance}=setup();w.navigate(4);w.start();advance(120);w.navigate(5);
 assert.equal(w.state.pages[4].remainingSec,60);assert.equal(w.state.pages[4].planState,'deferred');
 assert.equal(w.page.timerState,'idle');assert.equal(w.stepRemaining(),540);
 w.navigate(4);assert.equal(w.state.pages[4].planState,'deferred');w.start();assert.equal(w.stepRemaining(),600);
});
test('forward jump skips intermediate pages while backwards preserves planned pages',()=>{
 const {w}=setup();w.navigate(4);w.start();w.navigate(5);w.navigate(7);
 assert.equal(w.state.pages[5].planState,'deferred');assert.equal(w.state.pages[6].planState,'deferred');
 w.navigate(4);assert.equal(w.state.pages[7].planState,'scheduled');
});
test('transfer to running target conserves all unspent time and deadline',()=>{
 const {w,advance}=setup();w.navigate(4);w.start();advance(120);w.navigate(7,true);advance(10);
 const total=()=>w.state.pages.reduce((n,p)=>n+p.remainingSec,0);const before=total(),deadline=w.page.deadlineAtMs;
 w.transfer(4,7);assert.equal(total(),before);assert.equal(w.state.pages[4].remainingSec,0);assert.equal(w.page.deadlineAtMs,deadline+60000);
 assert.equal(w.page.timerState,'running');assert.ok(validateState(w.state,slides));
});
test('timestamp restoration accounts for time away exactly once',()=>{
 const {w,advance}=setup();w.start();advance(20);const snapshot=structuredClone(w.state);
 const restored=new Workshop(slides,snapshot,()=>1_050_000);assert.equal(restored.page.remainingSec,70);assert.equal(restored.page.activeElapsedSec,50);
 restored.settle();assert.equal(restored.page.activeElapsedSec,50);
});
test('expiry stops at zero and does not advance; add time waits for start',()=>{
 const {w,advance}=setup();w.navigate(25);w.start();advance(181);assert.equal(w.state.activePage,25);assert.equal(w.page.remainingSec,0);
 assert.equal(w.page.timerState,'expired');w.navigate(26,true);assert.equal(w.state.activePage,25);
 w.adjust(60);assert.equal(w.page.timerState,'paused');assert.equal(w.page.planState,'scheduled');
});
test('elapsed and quotas are independent; reset does not erase work or global start',()=>{
 const {w,advance}=setup();w.start();advance(20);const start=w.state.workshopStartedAt;w.resetPage();
 assert.equal(w.page.activeElapsedSec,20);assert.equal(w.state.workshopStartedAt,start);assert.equal(w.page.remainingSec,120);assert.equal(w.page.timerState,'idle');
});
test('adjustment clamps at zero, never subtracts more than remaining',()=>{
 const {w}=setup();w.navigate(1);w.setRemaining(30);w.adjust(-60);assert.equal(w.page.allocatedSec,0);assert.equal(w.page.remainingSec,0);assert.equal(w.page.timerState,'expired');
 assert.ok(validateState(w.state,slides));
});
test('late resume across multiple thresholds chooses only highest priority reminder',()=>{
 const {w,advance}=setup();w.navigate(17);w.start();advance(1500);assert.equal(w.activeAlert.id,'work-3');
 assert.ok(w.page.handledAlertIds.includes('work-10'));w.dismissAlert();w.adjust(600);advance(600);assert.equal(w.activeAlert,undefined);
 w.replayAlert('work-3');assert.equal(w.activeAlert.id,'work-3');w.resetPage();assert.equal(w.page.handledAlertIds.length,0);
});
test('one-minute reflection shows wrap-up only at ten seconds',()=>{
 const {w,advance}=setup();w.navigate(22);w.start();advance(49);assert.equal(w.activeAlert,undefined);advance(1);assert.equal(w.activeAlert.id,'wrap');
});
test('expiry sound handled once even after adding time; reset re-arms',()=>{
 const {w,advance}=setup();w.state.config.sound=true;w.start();advance(130);assert.deepEqual(w.effects,['expiry-sound']);
 w.effects=[];w.adjust(1);w.start();advance(2);assert.deepEqual(w.effects,[]);w.resetPage();w.start();advance(120);assert.deepEqual(w.effects,['expiry-sound']);
});
test('restoring an already expired snapshot does not replay sound',()=>{
 const {w,advance}=setup();w.state.config.sound=true;w.start();advance(120);
 const restored=new Workshop(slides,structuredClone(w.state),()=>2_000_000);assert.deepEqual(restored.effects,[]);
});
test('invalid or inconsistent storage is rejected',()=>{
 const s=freshState(slides);assert.ok(validateState(s,slides));s.pages[1].remainingSec=-1;assert.equal(validateState(s,slides),false);
 const t=freshState(slides);t.config.logoDataUri='javascript:alert(1)';assert.equal(validateState(t,slides),false);
 const u=freshState(slides);u.pages[1].timerState='running';assert.equal(validateState(u,slides),false);
});
test('formatting, URL validation and venue timezone are deterministic',()=>{
 assert.equal(clockText(-1),'00:00');assert.equal(clockText(60.1),'01:01');
 assert.equal(validUploadUrl('javascript:alert(1)'),false);assert.equal(validUploadUrl('https://user:pass@example.com'),false);assert.equal(validUploadUrl('https://example.com/upload'),true);
 assert.equal(new Date(targetTimestamp(freshState(slides).config)).toISOString(),'2026-11-01T02:30:00.000Z');
});
test('random navigation and timing preserve state invariants',()=>{
 const {w,advance}=setup();let seed=1234;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
 for(let i=0;i<1500;i++){
  switch(Math.floor(random()*7)){
   case 0:w.navigate(Math.floor(random()*26),random()>.5);break;
   case 1:w.toggle();break;
   case 2:w.adjust(random()>.5?60:-60);break;
   case 3:w.resetPage();break;
   case 4:advance(Math.floor(random()*300));break;
   case 5:w.requeue(Math.floor(random()*26));break;
   case 6:w.transfer(Math.floor(random()*26),Math.floor(random()*26));break;
  }
  assert.ok(validateState(w.state,slides),`invariant failed after action ${i}`);
 }
});
test('large time edits and transfers cannot poison the saved-state quota limits',()=>{
 const {w,advance}=setup();w.start();advance(100);w.setRemaining(86400);assert.equal(w.page.allocatedSec,86400);assert.ok(validateState(w.state,slides));
 w.navigate(2);w.setRemaining(86400);const before=w.page.remainingSec;w.transfer(1,2);assert.equal(w.page.remainingSec,before);assert.ok(validateState(w.state,slides));
});
