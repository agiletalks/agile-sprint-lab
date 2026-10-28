import { Workshop, freshState, validateState, STORAGE_KEY, DEFAULT_CONFIG, clockText, alertDefinitions, validUploadUrl, targetTimestamp } from './engine.js';

const slides = JSON.parse(document.getElementById('slide-data').textContent);
const embeddedConfig = JSON.parse(document.getElementById('config-data').textContent);
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageWarning = '', corruptStorage = false, panelError = '', audio = null, lastAnnouncement = '', savedAt = 0;
const initial = freshState(slides);
initial.config = {...initial.config,...embeddedConfig};
let restored = initial;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const value = JSON.parse(raw);
    if (!validateState(value, slides)) throw new Error('incompatible');
    restored = value;
  }
} catch (e) {
  if (e instanceof SyntaxError || e.message === 'incompatible') {
    corruptStorage = true;
    storageWarning = '儲存資料格式不相容或毀損。目前以記憶體開始新場，舊資料尚未覆寫；請先匯出備份，再清除本場進度。';
  } else storageWarning = '瀏覽器儲存不可用，目前僅保留記憶體進度；關閉前請匯出進度備份。';
}
// Adopt newly supplied branding without resetting any saved workshop progress.
if (!restored.config.logoDataUri && embeddedConfig.logoDataUri) restored.config.logoDataUri=embeddedConfig.logoDataUri;
let workshop = new Workshop(slides, restored);
const stage = $('#slide'), panel = $('#console'), clearDialog = $('#confirm-clear');
const toolLabels = [null,
 ['Your experience','您的工作經驗'],['Listening','聆聽'],['Language agreement','語言約定'],
 ['Introduction Card','個人自我介紹卡'],['Introduction Card','自我介紹卡'],['Introduction Card','自我介紹卡'],
 ['Group notes','小組紀錄'],['Challenge Card + AC Card','挑戰卡＋驗收條件卡'],['Challenge Card + AC Card','挑戰卡＋驗收條件卡'],
 ['Challenge Card + AC Card + DoR Card','個人挑戰卡、AC 卡；小組 DoR 卡'],['Challenge Card + AC Card + DoR Card','挑戰卡、AC 卡與 DoR 卡'],
 ['DoD Card','共同完成標準卡'],['Challenge Card + AC Card · R / G dots','挑戰卡、AC 卡與紅綠點貼紙'],
 ['Challenge Card + AC Card · Matrix','挑戰卡、AC 卡與矩陣海報'],['Challenge matrix + paired cards','挑戰矩陣與配對卡片'],
 ['Selected cards + DoD Card','已選挑戰卡、AC 卡與 DoD 卡'],['Challenge + AC + DoD · Poster','挑戰卡、AC 卡、DoD 卡與成果海報'],
 ['Posters · Phone','成果海報、手機'],['Posters · Feedback notes','成果海報、回饋便條'],['Posters · Feedback notes','成果海報、回饋便條'],
 ['Posters · Feedback notes','成果海報、回饋便條'],['Quiet reflection','安靜反思'],['Group notes','小組紀錄'],
 ['Sticky notes · Feedback wall','便條紙、回饋牆'],['Your next session','您的下一場活動']
];
const loc = (en, zhTW) => ({en,zhTW});
const stateLabels = {idle:loc('Ready','尚未開始'),running:loc('In progress','進行中'),paused:loc('Paused','已暫停'),expired:loc('Time is up','時間到')};
function textPair(value, className='') {
  if (!value) return '';
  const config=workshop.state.config;
  const replace = t => String(t || '').replace(/4–5/g, `${config.teamSizeMin}–${config.teamSizeMax}`);
  return `<div class="pair ${className}">${value.en ? `<div class="en" lang="en">${esc(replace(value.en))}</div>` : ''}${value.zhTW ? `<div class="zh" lang="zh-Hant">${esc(replace(value.zhTW))}</div>` : ''}</div>`;
}
function announce(text) {
  if (text && text !== lastAnnouncement) { $('#announcement').textContent=text; lastAnnouncement=text; }
}
function save() {
  if (corruptStorage) return;
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(workshop.state)); }
  catch { storageWarning='儲存失敗，目前僅保留記憶體進度；請在關閉前匯出進度備份。'; }
}
function logo(size='top') {
  const c=workshop.state.config;
  return c.logoDataUri ? `<img class="${size === 'top' ? 'top-logo' : ''}" src="${esc(c.logoDataUri)}" alt="Company logo">` : (size === 'top' ? '<span class="brand-square" aria-hidden="true"></span>' : '<div class="brand-type">AGILE<span>SPRINT</span>LAB.</div>');
}
function featureLogo() {
  return workshop.state.config.logoDataUri ? `<figure class="brand-feature">${logo('large')}</figure>` : '';
}
function topbar(s) {
  return `<header class="topbar"><div class="wordmark">${logo()}<span>${esc(workshop.state.config.title)}</span></div><div class="top-meta">${s.stepId ? `<span class="step-code"><span class="en">STEP ${String(s.stepId).padStart(2,'0')} / 13</span><span class="zh">步驟 ${String(s.stepId).padStart(2,'0')} / 13</span></span>${textPair(s.stepTitle)}` : `<span>${esc(workshop.state.config.eventName)}</span>`}</div></header>`;
}
function actionsHTML(s) {
  return `<ol class="actions">${s.actions.map((a,i)=>`<li><span class="action-no" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${textPair(a)}</li>`).join('')}</ol>`;
}
function mini(en,zh,extra='') { return `<div class="mini-card ${extra}">${textPair(loc(en,zh))}</div>`; }
function diagram(s) {
  if (s.id === 'P01') return featureLogo();
  if (s.id === 'P04') return `<div class="diagram"><div class="mini-card"><div class="card-label">INTRODUCTION CARD</div><div class="intro-fields">${[['Name','稱呼'],['Strengths','長處'],['Working languages','可用語言'],['Preferred language','偏好語言']].map(a=>textPair(loc(...a))).join('')}</div></div></div>`;
  if (s.id === 'P08') return `<div class="diagram"><div class="mini-card"><div class="card-label">CHALLENGE CARD</div>${textPair(loc('Situation · Challenge · Impact','情境・挑戰・影響'))}<div class="card-fields"><span>When I am…</span><span>The challenge I face is…</span><span>This affects my work by…</span></div></div><div class="mini-card ac"><div class="card-label">ACCEPTANCE CRITERIA CARD</div>${textPair(loc('A useful response would…','有用的回應應能……'))}</div></div>`;
  if (s.id === 'P10') return `<div class="diagram">${mini('Clear context','情境、挑戰與影響清楚')}${mini('Understandable AC','驗收條件可理解')}${mini('Progress today','今天能有實質進展')}</div>`;
  if (s.id === 'P12') return `<div class="diagram poster-check">${mini('Challenge','挑戰')}${mini('AC','驗收條件')}${mini('Solution','可以使用或嘗試的解法')}</div>`;
  if (s.id === 'P13') return `<div class="diagram"><div class="mini-card"><div class="vote-tag"><span class="vote-icon">R</span>${textPair(loc('Experienced','經歷過'))}</div></div><div class="mini-card"><div class="vote-tag"><span class="vote-icon green">G</span>${textPair(loc('First choice','優先選擇'))}</div></div></div>`;
  if (s.id === 'P17') return `<div class="cycle">${[['Develop a useful solution','發展有用的解法'],['Capture it on one poster','整理成一張海報'],['Check AC + DoD together','一起檢查 AC 與 DoD'],['When done, check time. Choose the next if time allows.','完成後確認時間，時間允許再選下一題']].map((a,i)=>`<div class="mini-card"><div class="cycle-index">0${i+1}</div>${textPair(loc(...a))}</div>`).join('')}</div>`;
  if (s.id === 'P24') return `<div class="diagram two-notes">${workshop.state.config.feedbackWallLabels.map((l,i)=>`<div class="mini-card"><div class="card-label">NOTE 0${i+1}</div>${textPair(l)}</div>`).join('')}</div>`;
  return '';
}
function matrixHTML() {
  return `<div class="matrix-figure"><svg class="matrix-svg" viewBox="0 0 510 365" role="img" aria-label="挑戰矩陣：紅點共同經驗向右增加，綠點優先意願向上增加；兩軸 0 至組員人數 N。"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#151515"/></marker></defs>${[0,1,2,3,4].map(i=>`<line class="guide" x1="115" x2="455" y1="${260-i*44}" y2="${260-i*44}"/><line class="guide" x1="${115+i*80}" x2="${115+i*80}" y1="260" y2="66"/>`).join('')}<path class="axis" d="M115 57 V260 H475" fill="none" marker-end="url(#arrow)"/><path class="axis" d="M115 260 V42" marker-end="url(#arrow)"/>${['0','1','2','…','N'].map((n,i)=>`<text class="tick" x="${115+i*80}" y="291" text-anchor="middle">${n}</text><text class="tick" x="94" y="${267-i*44}" text-anchor="end">${n}</text>`).join('')}<text class="axis-en en" x="290" y="328" text-anchor="middle">R · Shared experience →</text><text class="axis-zh zh" x="290" y="359" text-anchor="middle">紅點：共同經驗</text><text class="axis-en en" x="20" y="24">G · First choices ↑</text><text class="axis-zh zh" x="20" y="55">綠點：優先意願</text></svg>${textPair(loc('N = people in your team','N＝實際組員數；示意，不代表票數結果'),'matrix-note')}</div>`;
}
function supportDefault(s) {
  const map={P05:loc('Meet at least 3 people','至少認識三位夥伴'),P06:loc('Need a team? Ask Percy.','需要組隊協助，請找 Percy'),P09:loc('Quiet writing. One paired set per person.','安靜書寫；每人一組配對卡片'),P11:loc('Clarify first. Up to 2 minutes per person.','先釐清；每人最多兩分鐘'),P17:loc('Keep AC + DoD visible. One challenge at a time.','讓 AC 與 DoD 保持可見；一次處理一題'),P20:loc('Switch hosts now','現在換手'),P24:loc('Use a comfortable language; add short English if possible.','使用熟悉的語言，方便時補上簡短英文')};
  if(map[s.id]) return map[s.id];
  if (s.id==='P08'||s.id==='P04') return null; // The full example remains in facilitator notes.
  return s.supportingText[0] || null;
}
function timerHTML() {
  return `<aside class="timer-card" aria-label="Activity time and materials"><div class="timer-label">${textPair(loc('THIS ACTIVITY','本活動'))}</div><div class="timer-number" id="timer-number" aria-live="off"></div><div class="timer-state" id="timer-state"></div><div class="timer-progress" aria-hidden="true"><div class="timer-progress-fill" id="timer-progress-fill"></div></div><div class="preview-label" id="preview-label"></div><div class="tool-area"><div class="eyebrow">${textPair(loc('TOOLS','使用工具'))}</div>${textPair(loc(...toolLabels[workshop.state.activePage]))}</div><div class="step-left" id="step-left"></div></aside>`;
}
function footer(s) {
  return `<footer class="footer-info">${[['WHY','原理',s.why],['OUTPUT','產出',s.output]].map(([en,zh,val])=>`<div class="info-row"><div class="info-label">${textPair(loc(en,zh))}</div>${textPair(val,'info-text')}</div>`).join('')}</footer>`;
}
function bottom(s) {
  const siblings=slides.filter(v=>v.stepId===s.stepId);
  const progress=siblings.length>1 ? `<div class="substeps">${siblings.map(v=>`<span class="${s.id===v.id?'current':''}">${textPair(v.title)}</span>`).join('')}</div>` : `<div class="step-track" aria-label="Step ${s.stepId} of 13">${Array.from({length:13},(_,i)=>`<span class="${i+1===s.stepId?'current':''}"></span>`).join('')}</div>`;
  return `<div class="bottom-bar">${progress}<span class="page-code"><span class="en">PAGE</span><span class="zh">頁碼</span> ${s.id} / P25</span></div>`;
}
function renderCover() {
  const c=workshop.state.config, started=workshop.state.workshopStartedAt!==null;
  return `${topbar(slides[0])}<section class="cover-main"><div><div class="cover-index">${textPair(loc('A hands-on workshop','實作工作坊'))}</div><h1>${c.title==='Agile Sprint Lab'?'Agile<span>Sprint Lab.</span>':esc(c.title)}</h1><div class="cover-subtitle">${textPair(loc('Working together on our challenges in the age of AI','一起面對 AI 時代的工作挑戰'))}</div><div class="cover-host">${esc(c.facilitatorName)}<span>${textPair(loc('Agile Coach','敏捷教練'))}</span></div><div class="cover-start"><button class="primary" data-command="start">${textPair(started?loc('Return to activity','返回目前活動'):loc('Start workshop','開始工作坊'))} <span aria-hidden="true">→</span></button><small>${started?slides[workshop.state.lastActivityPage].id:textPair(loc('120 minutes · 13 steps','120 分鐘・13 步驟'))}</small></div></div><div class="cover-mark">${c.logoDataUri?logo('large'):'<div class="large-number">120<span style="color:var(--orange)">.</span></div><div class="minutes-label">Minutes of collaboration</div><div class="brand-type">THINK.<span>MAKE.</span>LEARN.</div>'}</div></section><footer class="cover-bottom"><div>${esc(c.eventName)} · ${esc(c.location)}<br><small>${esc(c.eventDate)} · ${esc(c.scheduledStart)}–${esc(c.scheduledEnd)} · ${esc(c.timezone)}</small></div><a class="email" href="mailto:${esc(c.email)}">${esc(c.email)}</a></footer>`;
}
function profileHTML() {
  const c=workshop.state.config;
  return `<div class="content-area"><div class="profile-layout"><div><div class="profile-name">${esc(c.facilitatorName)}</div><div class="profile-role">${textPair(loc('Agile Coach','敏捷教練'))}</div><div class="profile-intro">${textPair(loc('I share practical Agile elements that help teams work together.','分享協助團隊合作的敏捷實務。'))}</div></div>${featureLogo()}</div><div class="profile-contact"><a class="email" href="mailto:${esc(c.email)}">${esc(c.email)}</a></div></div>`;
}
function uploadHTML() {
  const url=workshop.state.config.uploadUrl;
  if (!validUploadUrl(url)) return '';
  try {
    qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];
    const qr=qrcode(0,'M'); qr.addData(new URL(url).href,'Byte'); qr.make();
    return `<div class="upload-box">${qr.createSvgTag({cellSize:3,margin:4,scalable:true})}<div>${textPair(loc('Upload photos if available','可連線時上傳照片'))}<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a></div></div>`;
  } catch { return ''; }
}
function renderStage() {
  const s=workshop.slide,c=workshop.state.config;
  stage.className=`canvas page-${s.id} lang-${c.languageMode} ${s.id==='P00'?'cover':''} ${s.id==='P25'?'closing':''} ${c.showTimer?'':'timer-hidden'}`;
  document.documentElement.lang=c.languageMode==='zh'?'zh-Hant':'en';
  if(!s.stepId) stage.innerHTML=renderCover();
  else {
    let left=s.id==='P02'?profileHTML():`<div class="content-area ${['P08','P24'].includes(s.id)?'dense':''}"><div class="eyebrow">${textPair(loc('DO NOW','現在請做'))}</div>${s.id==='P14'?`<div class="matrix-layout">${matrixHTML()}${actionsHTML(s)}</div>`:s.id==='P17'?'':actionsHTML(s)}${diagram(s)}${s.id==='P18'?uploadHTML():''}${s.id==='P25'?`<div class="closing-summary"><div class="closing-thanks">${textPair(loc('Thank you for your ideas, participation, and support.','謝謝各位的想法、參與與彼此支持。'))}</div>${featureLogo()}</div><div class="profile-contact"><a class="email" href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`:'<div class="support-band" id="support-band"></div>'}</div>`;
    stage.innerHTML=`${topbar(s)}<div class="title-block"><div class="step-number" aria-hidden="true">${String(s.stepId).padStart(2,'0')}</div><h1>${textPair(s.title)}</h1></div><section class="main-grid">${left}${timerHTML()}</section>${footer(s)}${bottom(s)}`;
  }
  updateDynamic(true);
}
function updateDynamic(force=false) {
  const p=workshop.page,s=workshop.slide,c=workshop.state.config;
  if(s.stepId) {
    $('#timer-number').textContent=clockText(p.remainingSec);
    $('#timer-state').innerHTML=`<span class="state-dot" aria-hidden="true"></span>${textPair(stateLabels[p.timerState])}`;
    $('#timer-progress-fill').style.width=`${Math.min(100,p.remainingSec/Math.max(1,p.allocatedSec)*100)}%`;
    $('#preview-label').innerHTML=p.planState==='deferred'?textPair(loc('Preview · not scheduled','回看・尚未重新排入')):'';
    $('#step-left').innerHTML=`${textPair(loc('Step remaining','步驟剩餘'))}<strong>${clockText(workshop.stepRemaining())}</strong>`;
    stage.classList.toggle('running',p.timerState==='running');
    stage.classList.toggle('near-time',p.remainingSec<=s.durationSec*.2);
    const band=$('#support-band');
    if(band) {
      const alert=workshop.activeAlert;
      const key=alert?.id || 'default';
      if(force||band.dataset.alert!==key) { band.innerHTML=textPair(alert || supportDefault(s)); band.dataset.alert=key; }
    }
    const a=workshop.activeAlert;
    const stateAnnounce=`${s.id} ${stateLabels[p.timerState].zhTW}${a?`。${a.zhTW}`:''}`;
    announce(stateAnnounce);
  }
  while(workshop.effects.length) { const e=workshop.effects.shift(); if(e==='expiry-sound') beep(); }
  if(panel.open) updateMetrics();
}
function fmtTime(ms) { return new Intl.DateTimeFormat('en-GB',{timeZone:workshop.state.config.timezone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(ms); }
function updateMetrics() {
  const now=Date.now(),state=workshop.state,planned=workshop.plannedRemaining();
  const elapsed=state.workshopStartedAt===null?'尚未開始':clockText((now-state.workshopStartedAt)/1000);
  $('#metric-elapsed').textContent=elapsed;
  $('#metric-eta').textContent=planned>0?fmtTime(now+planned*1000):'已排入活動結束';
  $('#eta-caption').textContent=planned>0?(state.workshopStartedAt===null?'若現在開始，後續連續執行':'假設後續連續執行、不再暫停'):'可另查看待處理配額';
  const diff=(now+planned*1000-targetTimestamp(state.config))/60000;
  $('#metric-diff').textContent=planned>0?`${diff>=0?'超時':'提早'} ${Math.ceil(Math.abs(diff))} 分`:'—';
  $('#metric-deferred').textContent=clockText(workshop.deferredRemaining());
  $('#panel-current').textContent=`${workshop.slide.id} · ${clockText(workshop.page.remainingSec)} · ${stateLabels[workshop.page.timerState].zhTW}`;
}
function field(name,label,type='text',extra='') {
  return `<label>${label}<input name="${name}" type="${type}" value="${esc(workshop.state.config[name])}" ${extra}></label>`;
}
function renderPanel() {
  const c=workshop.state.config,p=workshop.page;
  const deferred=workshop.state.pages.map((p,i)=>({p,i})).filter(({p,i})=>i&&p.planState==='deferred');
  panel.innerHTML=`<div class="console-head"><div><h2 id="console-title">引導者控制台</h2><div id="panel-current" class="hint"></div></div><button data-command="panel-close" aria-label="關閉控制台 (Esc)">關閉 ×</button></div><p class="console-warning">此控制台會出現在投影。開啟面板不會暫停活動；僅開啟一個操作分頁。</p>${storageWarning?`<p class="storage-warning" role="alert">${esc(storageWarning)}</p>`:''}<div class="console-grid"><div><section class="console-section"><h3>活動與倒數</h3><div class="button-row"><button data-command="prev" ${workshop.state.activePage===0?'disabled':''}>← 上一頁</button><button data-command="next" ${workshop.state.activePage===25?'disabled':''}>下一頁 →</button></div><div class="button-row"><button class="primary" data-command="toggle">${p.timerState==='running'?'暫停':'開始／繼續'} <kbd>Space</kbd></button><button class="dark" data-command="next-start" ${workshop.state.activePage===25?'disabled':''}>下一頁並開始</button></div><div class="button-row"><button data-command="minus" ${!workshop.state.activePage?'disabled':''}>− 1 分鐘</button><button data-command="plus" ${!workshop.state.activePage?'disabled':''}>＋ 1 分鐘</button><button data-command="reset" ${!workshop.state.activePage?'disabled':''}>重設本頁</button></div><form id="remaining-form" class="time-edit"><label for="remaining-input">指定剩餘</label><input id="remaining-input" name="remaining" inputmode="numeric" pattern="[0-9]{1,4}:[0-5][0-9]" value="${clockText(p.remainingSec)}" aria-label="指定剩餘時間，格式 MM:SS" ${!workshop.state.activePage?'disabled':''}><button ${!workshop.state.activePage?'disabled':''}>套用</button></form><div class="button-row"><button data-command="fullscreen">全螢幕 <kbd>F</kbd></button><button data-command="timer">${c.showTimer?'隱藏':'顯示'}倒數 <kbd>T</kbd></button></div><label><input type="checkbox" id="sound-toggle" ${c.sound?'checked':''}>到時音效（每頁一次）</label><div class="button-row"><button data-command="dismiss">關閉提醒</button>${alertDefinitions(workshop.slide).filter(a=>a.id.startsWith('work-')).map(a=>`<button data-replay="${a.id}">重播 ${a.sec/60} 分提醒</button>`).join('')}</div><p id="panel-error" class="console-error" role="alert">${esc(panelError)}</p></section><section class="console-section" style="margin-top:18px"><h3>場次時間 · ${esc(c.timezone)}</h3><div class="metrics"><div class="metric">全場實際經過<b id="metric-elapsed"></b></div><div class="metric">預估完成<b id="metric-eta"></b><small id="eta-caption"></small></div><div class="metric">與目標結束時間相比<b id="metric-diff"></b><small>目標 ${esc(c.eventDate)} ${esc(c.scheduledEnd)}</small></div><div class="metric">已略過、待處理配額<b id="metric-deferred"></b></div></div><details id="deferred-details"><summary>待處理配額（${deferred.length} 頁）</summary><div class="deferred-list">${deferred.length?deferred.map(({p,i})=>`<div class="deferred-item"><b>${slides[i].id} · ${esc(slides[i].title.zhTW)} · ${clockText(p.remainingSec)}</b><div class="button-row"><button data-requeue="${i}">重新排入</button><button data-discard="${i}">捨棄剩餘</button></div><div class="time-edit"><select aria-label="${slides[i].id} 配額轉移目標" id="transfer-${i}">${slides.slice(1).filter(s=>s.id!==slides[i].id).map(s=>`<option value="${slides.indexOf(s)}" ${slides.indexOf(s)===workshop.state.activePage?'selected':''}>${s.id} ${esc(s.title.zhTW)}</option>`).join('')}</select><button data-transfer="${i}">轉移全部</button></div></div>`).join(''):'<p>沒有待處理配額。</p>'}</div></details><details id="notes-details"><summary>巡組提問與本頁備註（會被投影）</summary>${['What does the challenge owner need? / 挑戰提出者需要什麼？','Which acceptance criterion are you addressing? / 目前在回應哪一項驗收條件？','What would make this usable? / 怎樣才能讓它可用？','Let us hear from someone who has not spoken yet. / 聽聽還沒發言的夥伴。','Could you give us a specific example? / 可以給一個具體例子嗎？','What still needs to be completed? / 還有什麼需要完成？','What would you need to check before trying this in your own work? / 在工作中嘗試前，需要先確認什麼？',...workshop.slide.supportingText.map(l=>l.en+' / '+l.zhTW),...workshop.slide.facilitatorNotes].map(v=>`<p>${esc(v)}</p>`).join('')}<p>${c.logoDataUri?'Logo 已載入；卡片與海報照片待補。':'Logo、卡片與海報照片待補。'}未核實的個人資格不投影。</p><p>若落後，優先縮短 P02 簡介、P11 延伸討論，或減少 P17 開啟下一題；保留全員分享、驗收檢查、成果回應與回顧。</p></details></section></div><div><section class="console-section"><h3>頁面索引 · 26 頁 / 120 分鐘</h3><div class="page-index">${slides.map((s,i)=>`<button data-page="${i}" class="${i===workshop.state.activePage?'current':''}" aria-label="跳至 ${s.id} ${esc(s.title.zhTW)}">${s.id} · ${esc(s.title.zhTW||'會前待機')}<small>${i?`${s.durationSec/60} min · ${workshop.state.pages[i].planState}`:'待機，不計時'}</small></button>`).join('')}</div></section><section class="console-section" style="margin-top:18px"><details id="settings-details"><summary>場次、語言、素材設定</summary><form id="settings-form"><div class="settings-grid">${field('title','工作坊標題','text','required maxlength="80"')}${field('facilitatorName','引導者','text','required maxlength="80"')}${field('email','聯絡信箱','email','required')}${field('eventName','活動名稱','text','maxlength="100"')}${field('location','地點','text','maxlength="80"')}${field('eventDate','場次日期','date','required')}${field('scheduledStart','預定開始','time','required')}${field('scheduledEnd','目標結束','time','required')}${field('timezone','場次時區','text','required')}<label>語言<select name="languageMode"><option value="both" ${c.languageMode==='both'?'selected':''}>雙語 / Bilingual</option><option value="en" ${c.languageMode==='en'?'selected':''}>English only</option><option value="zh" ${c.languageMode==='zh'?'selected':''}>中文</option></select></label>${field('teamSizeMin','每組最少人數','number','min="1" max="20" required')}${field('teamSizeMax','每組最多人數','number','min="1" max="20" required')}<div class="wide">${field('uploadUrl','照片上傳網址（選填；空白則隱藏）','url','maxlength="1500"')}</div>${c.feedbackWallLabels.map((l,i)=>`<label>回饋牆 ${i+1} 英文<input name="wall${i}en" value="${esc(l.en)}" maxlength="80" required></label><label>回饋牆 ${i+1} 中文<input name="wall${i}zh" value="${esc(l.zhTW)}" maxlength="80" required></label>`).join('')}</div><div class="button-row"><button class="primary">儲存設定</button></div></form><label>載入原始 Logo（JPEG／PNG／WebP，5 MB 以下）<input id="logo-file" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="hint">圖像保留原貌與比例，不裁切。匯出單檔會嵌入目前 Logo。</p></details><details id="management-details"><summary>匯出與進度管理</summary><div class="button-row"><button data-command="export-html">匯出離線單檔</button><button data-command="backup">匯出進度備份</button></div><label>還原進度（將替換本分頁進度）<input id="restore-file" type="file" accept="application/json,.json"></label><p class="hint">離線單檔包含目前設定與 Logo，不攜帶本場進度。進度備份供跨瀏覽器還原；file:// 儲存不受支援時仍可使用。</p><button class="danger" data-command="clear">清除本場進度</button></details><details id="shortcuts-details"><summary>快捷鍵與操作說明</summary><p>←／→、PageUp／PageDown：換頁後等待開始<br>Shift＋→：下一頁並開始<br>Space：開始／暫停<br>＋／−：加減一分鐘<br>F：全螢幕　T：隱藏倒數　P：控制台<br>輸入欄位操作期間停用全域快捷鍵。</p><p>全場經過時間包含暫停與轉場。提早往後換頁，未用時間列為待處理；回看不會自動重新排入。重新整理可恢復進度，但請勿同時開啟多個操作分頁。</p></details></section></div></div>`;
  updateMetrics();
}
function openPanel() { renderPanel(); panel.showModal(); $('#console-entry').setAttribute('aria-expanded','true'); }
function closePanel() { panel.close(); $('#console-entry').setAttribute('aria-expanded','false'); }
async function unlockAudio() {
  try { const Audio=window.AudioContext||window.webkitAudioContext; if(!Audio) throw new Error(); audio ||= new Audio(); await audio.resume(); }
  catch { panelError='此瀏覽器無法啟用音效；計時仍可正常使用。'; }
}
function beep() {
  if(!audio||audio.state!=='running') return;
  const oscillator=audio.createOscillator(), gain=audio.createGain();
  oscillator.frequency.value=660; oscillator.connect(gain); gain.connect(audio.destination);
  gain.gain.setValueAtTime(.1,audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.3);
  oscillator.start(); oscillator.stop(audio.currentTime+.3);
}
function download(blob,name) {
  const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function exportHTML() {
  const clone=document.documentElement.cloneNode(true);
  clone.querySelector('#config-data').textContent=JSON.stringify(workshop.state.config).replaceAll('<','\\u003c');
  ['#slide','#console','#announcement'].forEach(s=>clone.querySelector(s).innerHTML='');
  clone.querySelectorAll('dialog').forEach(d=>d.removeAttribute('open'));
  clone.querySelector('#console-entry').classList.remove('visible');
  clone.querySelector('#console-entry').setAttribute('aria-expanded','false');
  download(new Blob(['<!doctype html>\n'+clone.outerHTML],{type:'text/html'}),'Agile-Sprint-Lab-Projection.html');
}
async function fullscreen() {
  try { if(document.fullscreenElement) await document.exitFullscreen(); else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else throw new Error(); }
  catch { panelError='無法進入全螢幕；可使用瀏覽器的全螢幕命令或一般視窗。'; if(!panel.open) openPanel(); }
}
function commit() {
  save(); renderStage();
  if(panel.open) {
    const expanded=[...panel.querySelectorAll('details[open]')].map(d=>d.id);
    const scrollTop=panel.scrollTop;
    const focused=document.activeElement;
    const selector=focused?.dataset?.command?`[data-command="${focused.dataset.command}"]`:null;
    renderPanel();
    expanded.forEach(id=>{const detail=document.getElementById(id);if(detail)detail.open=true;});
    panel.scrollTop=scrollTop;
    if(selector) panel.querySelector(selector)?.focus({preventScroll:true});
  }
}
function command(name) {
  panelError='';
  switch(name) {
    case 'start': workshop.start();break;
    case 'toggle': workshop.toggle();break;
    case 'prev':workshop.navigate(workshop.state.activePage-1);break;
    case 'next':workshop.navigate(workshop.state.activePage+1);break;
    case 'next-start':workshop.navigate(workshop.state.activePage+1,true);break;
    case 'plus':workshop.adjust(60);break;
    case 'minus':workshop.adjust(-60);break;
    case 'reset':workshop.resetPage();break;
    case 'timer':workshop.state.config.showTimer=!workshop.state.config.showTimer;break;
    case 'dismiss':workshop.dismissAlert();break;
    case 'fullscreen':fullscreen();return;
    case 'panel-close':closePanel();return;
    case 'clear':clearDialog.showModal();return;
    case 'export-html':exportHTML();return;
    case 'backup': {
      workshop.settle();
      if(corruptStorage) { try { download(new Blob([localStorage.getItem(STORAGE_KEY)||'null'],{type:'application/json'}),'Agile-Sprint-Lab-Recovery.json'); } catch {} }
      else download(new Blob([JSON.stringify(workshop.state,null,2)],{type:'application/json'}),'Agile-Sprint-Lab-Progress.json');
      return;
    }
  }
  commit();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.command) command(b.dataset.command);
  else if(b.dataset.page!==undefined) {workshop.navigate(+b.dataset.page);commit();}
  else if(b.dataset.requeue) {workshop.requeue(+b.dataset.requeue);commit();}
  else if(b.dataset.discard) {workshop.discard(+b.dataset.discard);commit();}
  else if(b.dataset.transfer) {workshop.transfer(+b.dataset.transfer,+$(`#transfer-${b.dataset.transfer}`).value);commit();}
  else if(b.dataset.replay) {workshop.replayAlert(b.dataset.replay);commit();}
});
$('#console-entry').addEventListener('click',openPanel);
panel.addEventListener('close',()=>$('#console-entry').setAttribute('aria-expanded','false'));
$('#cancel-clear').onclick=()=>clearDialog.close();
$('#do-clear').onclick=()=>{
  const config=structuredClone(workshop.state.config), s=freshState(slides);s.config=config;
  workshop=new Workshop(slides,s);corruptStorage=false;storageWarning='';clearDialog.close();commit();announce('本場進度已清除');
};
document.addEventListener('keydown',e=>{
  if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.key==='Escape')return; // Native dialog and fullscreen behavior takes priority.
  if(e.target.closest('input,select,textarea,[contenteditable="true"]') || clearDialog.open) return;
  const key=e.key.toLowerCase();
  if(panel.open) {if(key==='p'){e.preventDefault();closePanel();}return;}
  if(e.target.closest('button,summary') && key === ' ') return;
  const map={'arrowright':e.shiftKey?'next-start':'next','pagedown':e.shiftKey?'next-start':'next','arrowleft':'prev','pageup':'prev',' ':'toggle','+':'plus','=':'plus','-':'minus','f':'fullscreen','t':'timer'};
  if(key==='p') {e.preventDefault();openPanel();return;}
  if(map[key]) {
    e.preventDefault();
    if(e.target.closest('button,summary')) {stage.tabIndex=-1;stage.focus({preventScroll:true});}
    command(map[key]);
  }
});
document.addEventListener('submit',e=>{
  if(e.target.id==='remaining-form') {
    e.preventDefault();const value=$('#remaining-input').value;
    if(!/^\d{1,4}:[0-5]\d$/.test(value))return;
    const [m,s]=value.split(':').map(Number);workshop.setRemaining(m*60+s);commit();
  }
  if(e.target.id==='settings-form') {
    e.preventDefault();const data=new FormData(e.target),config={...workshop.state.config};
    for(const key of ['title','facilitatorName','email','eventName','location','eventDate','timezone','scheduledStart','scheduledEnd','uploadUrl','languageMode']) config[key]=String(data.get(key)).trim();
    for(const key of ['teamSizeMin','teamSizeMax'])config[key]=Number(data.get(key));
    config.feedbackWallLabels=[0,1].map(i=>loc(String(data.get(`wall${i}en`)).trim(),String(data.get(`wall${i}zh`)).trim()));
    const candidate=structuredClone(workshop.state);candidate.config=config;
    if(!validateState(candidate,slides)||config.uploadUrl&&!validUploadUrl(config.uploadUrl)) {
      panelError='請確認組隊人數、日期、時區與網址格式。';$('#panel-error').textContent=panelError;return;
    }
    workshop.state.config=config;commit();announce('場次設定已儲存');
  }
});
document.addEventListener('change',async e=>{
  if(e.target.id==='sound-toggle') {workshop.state.config.sound=e.target.checked;if(e.target.checked)await unlockAudio();save();$('#panel-error').textContent=panelError;}
  if(e.target.id==='logo-file') {
    const file=e.target.files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){$('#panel-error').textContent='請使用 5 MB 以下的 JPEG、PNG 或 WebP 原圖。';return;}
    const reader=new FileReader();reader.onload=async()=>{
      try {const img=new Image();img.src=reader.result;await img.decode();workshop.state.config.logoDataUri=reader.result;commit();}
      catch {$('#panel-error').textContent='無法讀取此圖檔。';}
    };reader.readAsDataURL(file);
  }
  if(e.target.id==='restore-file') {
    const file=e.target.files[0];e.target.value='';if(!file)return;
    try {
      if(file.size>10*1024*1024)throw Error();
      const value=JSON.parse(await file.text());if(!validateState(value,slides))throw Error();
      if(!window.confirm('還原將替換本分頁的活動進度與設定，是否繼續？')){announce('已取消還原，原進度保留');return;}
      workshop=new Workshop(slides,value);corruptStorage=false;storageWarning='';commit();announce('進度已還原');
    }catch {$('#panel-error').textContent='備份格式不相容或無效，原進度未變更。';}
  }
});
let entryTimeout;
function showEntry() {$('#console-entry').classList.add('visible');clearTimeout(entryTimeout);entryTimeout=setTimeout(()=>$('#console-entry').classList.remove('visible'),2200);}
document.addEventListener('pointermove',showEntry,{passive:true});
document.addEventListener('focusin',e=>{if(e.target===$('#console-entry'))showEntry();});
function resize(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1920,innerHeight/1080));}
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{workshop.settle();save();updateDynamic();});
window.addEventListener('pagehide',()=>{workshop.settle();save();});
resize();renderStage();save();
setInterval(()=>{
  workshop.settle();updateDynamic();
  if(Date.now()-savedAt>=1000){save();savedAt=Date.now();}
},200);
