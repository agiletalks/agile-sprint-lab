/* Agile Sprint Lab · Projection
   The projected view is the presenter's view: slides, a global floating timer, and page numbers.
   No separate facilitator console. State (page, language, timer) persists in localStorage. */
const slides = JSON.parse(document.getElementById('slide-data').textContent);
const assets = JSON.parse(document.getElementById('config-data').textContent);
const CONFIG = {
  title:'Agile Sprint Lab', facilitatorName:'Percy Hsu', email:'agiletalks@gmail.com',
  eventName:'IAF Asia 2026', location:'Hangzhou', eventDate:'2026-11-01', timezone:'Asia/Shanghai',
  scheduledStart:'08:30', scheduledEnd:'10:30', teamSizeMin:4, teamSizeMax:5,
  feedbackWallLabels:[{en:'Feedback for Percy',zhTW:'给 Percy 的反馈'},{en:'My next experiment',zhTW:'我的下一次尝试'}]
};
const ROLE = {en:'Enterprise Agile Coach & Facilitator', zhTW:'企业敏捷教练与引导师'};
const STORAGE_KEY = 'agile-sprint-lab-projection-v2';
const LANGS = ['both','en','zh'];
const MAX_TIMER_SEC = 180*60;
const LAST = slides.length - 1;
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loc = (en, zhTW) => ({en, zhTW});
const clockText = sec => { const n=Math.max(0,Math.ceil(sec)); return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; };

/* ---------- State ---------- */
const maxSteps = s => s && s.actions ? s.actions.length : 0;
function defaults() {
  return {page:0, reveal:0, lang:'both', timerOpen:false, timer:{durationSec:300, remainingSec:300, running:false, endsAt:null}};
}
function validState(v) {
  const t=v?.timer, num=n=>Number.isFinite(n)&&n>=0;
  return !!v && Number.isInteger(v.page) && v.page>=0 && v.page<=LAST
    && (v.reveal===undefined || (Number.isInteger(v.reveal) && v.reveal>=0 && v.reveal<=10))
    && LANGS.includes(v.lang) && typeof v.timerOpen==='boolean'
    && !!t && num(t.durationSec) && t.durationSec<=MAX_TIMER_SEC && num(t.remainingSec) && t.remainingSec<=MAX_TIMER_SEC
    && typeof t.running==='boolean' && (t.running ? num(t.endsAt) : t.endsAt===null);
}
let state = (() => { try { const v=JSON.parse(localStorage.getItem(STORAGE_KEY)); if (validState(v)) { if (v.reveal===undefined) v.reveal=0; return v; } } catch {} return defaults(); })();
let storageOk = true;
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageOk=true; } catch { storageOk=false; } }

/* ---------- Timer model (one global countdown, independent of pages) ---------- */
const T = {
  remaining() { const t=state.timer; return t.running ? Math.max(0,(t.endsAt-Date.now())/1000) : t.remainingSec; },
  status() { const t=state.timer, r=T.remaining(); return t.running ? 'running' : r<=0 && t.durationSec>0 ? 'expired' : r>=t.durationSec ? 'ready' : 'paused'; },
  start() { const t=state.timer; if (t.running) return; if (t.remainingSec<=0) t.remainingSec=t.durationSec; if (t.remainingSec<=0) return; t.endsAt=Date.now()+t.remainingSec*1000; t.running=true; },
  pause() { const t=state.timer; if (!t.running) return; t.remainingSec=T.remaining(); t.running=false; t.endsAt=null; },
  toggle() { state.timer.running ? T.pause() : T.start(); },
  stop() { const t=state.timer; t.running=false; t.endsAt=null; t.remainingSec=t.durationSec; },
  restart() { T.stop(); T.start(); },
  set(sec) { const t=state.timer; sec=Math.min(MAX_TIMER_SEC,Math.max(0,Math.round(sec))); t.durationSec=sec; t.remainingSec=sec; t.running=false; t.endsAt=null; },
  adjust(delta) {
    const t=state.timer, next=Math.min(MAX_TIMER_SEC,Math.max(0,T.remaining()+delta));
    if (t.running) { if (next<=0) { t.running=false; t.endsAt=null; t.remainingSec=0; } else t.endsAt=Date.now()+next*1000; }
    else t.remainingSec=next;
    if (next>t.durationSec) t.durationSec=next; // keep the progress bar meaningful
  },
  settle() { const t=state.timer; if (t.running && Date.now()>=t.endsAt) { t.running=false; t.endsAt=null; t.remainingSec=0; return true; } return false; }
};
function parseTime(value) {
  const v=String(value).trim();
  let m;
  if ((m=v.match(/^(\d{1,3})$/))) return +m[1]*60;                 // "5" = 5 minutes
  if ((m=v.match(/^(\d{1,3}):([0-5]?\d)$/))) return +m[1]*60 + +m[2]; // "5:30" / "05:30"
  return null;
}

/* ---------- Shared building blocks ---------- */
function textPair(value, className='') {
  if (!value) return '';
  const replace = t => String(t || '').replace(/4–5/g, `${CONFIG.teamSizeMin}–${CONFIG.teamSizeMax}`);
  return `<div class="pair ${className}">${value.en ? `<div class="en" lang="en">${esc(replace(value.en))}</div>` : ''}${value.zhTW ? `<div class="zh" lang="zh-Hans">${esc(replace(value.zhTW))}</div>` : ''}</div>`;
}
const LABELS = {why:loc('WHY','为什么'),what:loc('WHAT','要完成什么'),how:loc('HOW','怎么做'),about:loc('ABOUT','讲师简介')};
function label(value, className='') {
  return `<div class="section-label ${className}"><span class="en" lang="en">${esc(value.en)}</span><span class="zh" lang="zh-Hans">${esc(value.zhTW)}</span></div>`;
}
function inline(value) { return `<span class="en" lang="en">${esc(value.en)}</span><span class="zh" lang="zh-Hans">${esc(value.zhTW)}</span>`; }
function logo(size='top') {
  return assets.logoDataUri ? `<img class="${size==='top'?'top-logo':''}" src="${esc(assets.logoDataUri)}" alt="Company logo">` : (size==='top' ? '<span class="brand-square" aria-hidden="true"></span>' : '<div class="brand-type">THINK.<span>MAKE.</span>LEARN.</div>');
}
function topbar() { return `<header class="topbar brand-bar"><div class="wordmark">${logo()}<span>${esc(CONFIG.title)}</span></div></header>`; }
function howHeader(s) {
  const n = maxSteps(s);
  const dots = n ? `<span class="how-dots" role="group" aria-label="HOW steps">${Array.from({length:n},(_,i)=>`<button type="button" class="how-dot" data-reveal="${i+1}" aria-label="Step ${i+1}"></button>`).join('')}</span>` : '';
  return `<div class="how-head">${label(LABELS.how,'how-label')}${dots}</div>`;
}
function actionsHTML(s, variant='list') {
  return `<ol class="actions actions-${variant} count-${s.actions.length}">${s.actions.map((a,i)=>`<li data-step="${i+1}"><span class="action-no" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div class="action-body">${textPair(a,'action-text')}${a.note?textPair(a.note,'action-note'):''}</div></li>`).join('')}</ol>`;
}
const card = (title, body, className='') => `<div class="card ${className}">${title?label(title,'card-title'):''}${body}</div>`;
const figure = (title, body, className='') => `<figure class="diagram ${className}">${title?label(title,'figure-label'):''}${body}</figure>`;

/* ---------- Visual examples (right column of split pages) ---------- */
function diagram(s) {
  switch (s.id) {
    case 'P01': {
      const facts=[['120',loc('minutes','分钟')],['13',loc('steps','个步骤')],[`${CONFIG.teamSizeMin}–${CONFIG.teamSizeMax}`,loc('people per team','人一组')]];
      return figure(loc('At a glance','工作坊概览'),`<dl class="facts">${facts.map(([n,l])=>`<div class="fact"><dt>${esc(n)}</dt><dd>${textPair(l)}</dd></div>`).join('')}</dl>`,'fig-facts');
    }
    case 'P04': {
      const src=assets.cards?.intro||'';
      return figure(null,`<div class="card-viewer" data-popup="intro" role="button" tabindex="0" aria-label="Click to view Introduction Card full screen"><img class="card-img" src="${esc(src)}" alt="Introduction Card example"><span class="zoom-hint">${inline(loc('Click to view full screen','点击全屏放大'))}</span></div>`,'fig-card-img');
    }
    case 'P08': {
      const ch=assets.cards?.challenge||'', ac=assets.cards?.ac||'';
      return figure(null,`<div class="card-tabs" role="tablist" aria-label="Card examples"><button type="button" class="card-tab is-on" data-card="challenge">${inline(loc('Challenge Card','挑战卡'))}</button><button type="button" class="card-tab" data-card="ac">${inline(loc('Acceptance Criteria','验收条件卡'))}</button></div><div class="card-viewer" id="p08-cards" data-active="challenge" data-popup="p08" role="button" tabindex="0" aria-label="Click to view card full screen"><img class="card-img card-challenge" src="${esc(ch)}" alt="Challenge Card example"><img class="card-img card-ac" src="${esc(ac)}" alt="Acceptance Criteria Card example"><span class="zoom-hint">${inline(loc('Click to view full screen','点击全屏放大'))}</span></div>`,'fig-card-img fig-dual-cards');
    }
    case 'P10': {
      const src=assets.cards?.dor||'';
      return figure(null,`<div class="card-viewer" data-popup="dor" role="button" tabindex="0" aria-label="Click to view DoR Card full screen"><img class="card-img" src="${esc(src)}" alt="Definition of Ready (DoR) Card example"><span class="zoom-hint">${inline(loc('Click to view full screen','点击全屏放大'))}</span></div>`,'fig-card-img');
    }
    case 'P12': {
      const src=assets.cards?.dod||'';
      return figure(null,`<div class="card-viewer" data-popup="dod" role="button" tabindex="0" aria-label="Click to view DoD Card full screen"><img class="card-img" src="${esc(src)}" alt="Definition of Done (DoD) Card example"><span class="zoom-hint">${inline(loc('Click to view full screen','点击全屏放大'))}</span></div>`,'fig-card-img');
    }
    case 'P13':
      return figure(loc('Dot stickers','圆点贴纸'),`<div class="votes"><div class="vote"><span class="vote-icon red" aria-hidden="true">R</span><div>${textPair(loc('Experienced','经历过'),'vote-name')}${textPair(loc('One on each challenge you have experienced','每个经历过的挑战各贴一点'),'vote-rule')}</div></div><div class="vote"><span class="vote-icon green" aria-hidden="true">G</span><div>${textPair(loc('First choice','优先选择'),'vote-name')}${textPair(loc('One per person','每人只有一点'),'vote-rule')}</div></div></div>`,'fig-votes');
    case 'P14': return matrixHTML();
    case 'P24':
      return figure(loc('Feedback wall','反馈墙'),`<div class="notes">${CONFIG.feedbackWallLabels.map((l,i)=>`<div class="note"><span class="note-no">${String(i+1).padStart(2,'0')}</span>${textPair(l)}</div>`).join('')}</div>`,'fig-notes');
  }
  return '';
}
function matrixHTML() {
  const ticks=['0','1','2','…','N'];
  const svg=`<svg class="matrix-svg" viewBox="0 0 640 500" role="img" aria-label="挑战矩阵：红点共同经验向右增加，绿点优先意愿向上增加；两轴 0 至组员人数 N。"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L0,8 L9,4 z" fill="#151515"/></marker></defs>
${ticks.map((n,i)=>`<line class="guide" x1="120" x2="580" y1="${390-i*70}" y2="${390-i*70}"/><line class="guide" x1="${120+i*110}" x2="${120+i*110}" y1="390" y2="110"/>`).join('')}
<path class="axis" d="M120 390 H610" marker-end="url(#arrow)"/><path class="axis" d="M120 390 V92" marker-end="url(#arrow)"/>
${ticks.map((n,i)=>`<text class="tick" x="${120+i*110}" y="426" text-anchor="middle">${n}</text><text class="tick" x="100" y="${398-i*70}" text-anchor="end">${n}</text>`).join('')}
<text class="axis-en en" x="0" y="29"><tspan class="t-green">Green</tspan> · First choices ↑</text><text class="axis-zh zh" x="0" y="62"><tspan class="t-green">绿点</tspan>：优先意愿</text>
<text class="axis-en en" x="610" y="464" text-anchor="end"><tspan class="t-red">Red</tspan> · Shared experience →</text><text class="axis-zh zh" x="610" y="496" text-anchor="end"><tspan class="t-red">红点</tspan>：共同经验</text></svg>`;
  return figure(loc('Challenge matrix','挑战矩阵'),`${svg}${textPair(loc('N = people in your team','N＝实际组员数；仅为示意'),'matrix-note')}`,'fig-matrix');
}
function cycleHTML() {
  const steps=[['Develop a useful solution','发展有用的解法'],['Capture it on one poster','整理成一张海报'],['Check AC + DoD together','一起检查 AC 与 DoD'],['Check the time','确认剩余时间']];
  return `<div class="cycle-wrap"><ol class="cycle">${steps.map((a,i)=>`<li data-step="${i+1}"><span class="cycle-no" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${textPair(loc(...a))}</li>`).join('')}</ol><div class="cycle-return" data-step="4">${textPair(loc('Time left? Choose the next challenge and repeat','还有时间？选下一题，再循环一次'),'cycle-return-label')}</div></div>`;
}
function supportText(s) {
  const map={P06:loc('Need a team? Ask Percy.','需要组队协助，请找 Percy'),P09:loc('Quiet writing. One paired set per person.','安静书写；每人一组配对卡片'),P11:loc('Clarify first. Up to 2 minutes per person.','先厘清；每人最多两分钟'),P17:loc('Keep AC + DoD visible. One challenge at a time.','让 AC 与 DoD 保持可见；一次处理一题'),P20:loc('Switch hosts now','现在换手'),P24:loc('Use a comfortable language; add short English if possible.','使用熟悉的语言，方便时补上简短英文')};
  if (map[s.id]) return map[s.id];
  if (s.id==='P08'||s.id==='P04') return null;
  return s.supportingText[0] || null;
}
const supportHTML = s => { const t=supportText(s); return t ? `<div class="support-band" data-step="${maxSteps(s)}">${textPair(t)}</div>` : ''; };

/* ---------- Pages ---------- */
function renderCover() {
  return `${topbar()}<section class="cover-main"><div class="cover-copy">${label(loc('A hands-on workshop','实践工作坊'),'cover-index')}<h1>Agile<span>Sprint Lab.</span></h1><div class="cover-subtitle">${textPair(loc('Working together on our challenges in the age of AI','一起面对 AI 时代的工作挑战'))}</div><div class="cover-host"><strong>${esc(CONFIG.facilitatorName)}</strong><span class="zh" lang="zh-Hans">徐柏峰</span><span class="cover-role">${textPair(ROLE)}</span></div><div class="cover-start"><button class="primary" data-cmd="next">${textPair(loc('Start workshop','开始工作坊'))} <span aria-hidden="true">→</span></button><small>${textPair(loc('120 minutes · 13 steps','120 分钟・13 个步骤'))}</small></div></div><div class="cover-mark">${logo('large')}</div></section><footer class="cover-bottom"><div>${esc(CONFIG.eventName)} · ${esc(CONFIG.location)}<br><small>${esc(CONFIG.eventDate)} · ${esc(CONFIG.scheduledStart)}–${esc(CONFIG.scheduledEnd)} · ${esc(CONFIG.timezone)}</small></div><a class="email" href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a></footer>`;
}
function profileHTML() {
  const credentials=[
    loc('Agile and digital transformation','敏捷转型与数字化转型'),
    loc('2025 distinguished lecturer, Taiwan Academy of Banking and Finance · five consecutive years','2025 年台湾金融研训院菁英讲座 · 连续五年'),
    loc('Founding chair, Agile Experts Association','敏捷专家学会创会理事长'),
    loc('Applying Agile since 2009 · coached over 45 organizations across industries','2009 年起应用敏捷 · 辅导跨行业 45 家以上组织')
  ];
  return `${assets.profileImageDataUri?`<figure class="profile-portrait"><img src="${esc(assets.profileImageDataUri)}" alt="Percy 徐柏峰的卡通肖像"></figure>`:''}<div class="profile-copy"><div class="profile-name"><span class="profile-en">${esc(CONFIG.facilitatorName)}</span><span class="zh" lang="zh-Hans">徐柏峰</span></div>${textPair(ROLE,'profile-role')}<ul class="profile-credentials">${credentials.map(v=>`<li>${textPair(v)}</li>`).join('')}</ul></div>`;
}
function contactHTML() {
  const qr=assets.contactQr||{};
  const codes=[['wechat',loc('WeChat','微信')],['linkedin',loc('LinkedIn','领英')]].filter(([k])=>qr[k]);
  return `<aside class="contact-card" aria-label="Contact">${label(loc("Let's stay connected",'保持联系'),'contact-label')}<div class="contact-name"><strong>${esc(CONFIG.facilitatorName)}</strong><span class="zh" lang="zh-Hans">徐柏峰</span></div>${textPair(ROLE,'contact-role')}${codes.length?`<div class="qr-row">${codes.map(([k,l])=>`<figure><img src="${esc(qr[k])}" alt="${esc(l.en)} QR code"><figcaption>${textPair(l)}</figcaption></figure>`).join('')}</div>`:''}<a class="email" href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a></aside>`;
}
const SPLIT_PAGES=new Set(['P01','P04','P08','P10','P12','P13','P14','P24']);
function layoutOf(s) {
  if (s.id==='P02') return 'profile';
  if (s.id==='P25') return 'closing';
  if (s.id==='P17') return 'cycle';
  return SPLIT_PAGES.has(s.id) ? 'split' : 'columns';
}
function mainHTML(s) {
  const layout=layoutOf(s);
  let body;
  if (layout==='profile') body=`${label(LABELS.about,'how-label')}<div class="how-body">${profileHTML()}</div>`;
  else if (layout==='closing') body=`<div class="how-body"><div class="how-main">${howHeader(s)}${actionsHTML(s)}<div class="closing-thanks" data-step="${maxSteps(s)}">${textPair(loc('Thank you for your ideas, participation, and support.','谢谢各位的想法、参与与彼此支持。'))}</div></div>${contactHTML()}</div>`;
  else if (layout==='cycle') body=`${howHeader(s)}<div class="how-body">${cycleHTML()}${supportHTML(s)}</div>`;
  else if (layout==='split') body=`${howHeader(s)}<div class="how-body"><div class="how-main">${actionsHTML(s)}${supportHTML(s)}</div>${diagram(s)}</div>`;
  else body=`${howHeader(s)}<div class="how-body">${actionsHTML(s,'columns')}${supportHTML(s)}</div>`;
  return `<section class="main-grid" aria-label="HOW"><div class="content-area layout-${layout}">${body}</div></section>`;
}
function setCardTab(which) {
  const viewer=$('#p08-cards');
  if (viewer) viewer.dataset.active=which;
  document.querySelectorAll('.card-tab').forEach(btn => {
    btn.classList.toggle('is-on', btn.dataset.card===which);
  });
  const modalImg=$('#card-modal-img');
  if (modalImg && (which==='challenge'||which==='ac')) {
    modalImg.src = assets.cards?.[which] || '';
    modalImg.alt = which==='ac' ? 'Acceptance Criteria Card example' : 'Challenge Card example';
  }
}
function openCardModal(kind) {
  const modal=$('#card-modal'); if (!modal) return;
  const isDual = kind==='p08' || kind==='challenge' || kind==='ac';
  const active = kind==='p08' ? ($('#p08-cards')?.dataset.active || 'challenge') : kind;
  const src = assets.cards?.[active] || '';
  const tabs = isDual ? `<div class="card-tabs modal-tabs" role="tablist"><button type="button" class="card-tab ${active==='challenge'?'is-on':''}" data-card="challenge">${inline(loc('Challenge Card','挑战卡'))}</button><button type="button" class="card-tab ${active==='ac'?'is-on':''}" data-card="ac">${inline(loc('Acceptance Criteria','验收条件卡'))}</button></div>` : '<div></div>';
  modal.innerHTML = `<div class="card-modal-bar">${tabs}<button type="button" class="card-modal-close" data-cmd="close-modal">${inline(loc('Close','关闭'))} ✕</button></div><div class="card-modal-body"><img id="card-modal-img" class="card-modal-img" src="${esc(src)}" alt="Card full screen view"></div>`;
  modal.hidden = false;
}
function closeCardModal() {
  const modal=$('#card-modal');
  if (modal && !modal.hidden) { modal.hidden=true; modal.innerHTML=''; return true; }
  return false;
}
function updateReveal() {
  const s = slides[state.page], max = maxSteps(s);
  const rev = Math.min(max, Math.max(0, state.reveal ?? 0));
  state.reveal = rev;
  document.querySelectorAll('#slide [data-step]').forEach(el => {
    el.classList.toggle('is-hidden', +el.dataset.step > rev);
  });
  document.querySelectorAll('#slide .how-dot').forEach(btn => {
    const on = +btn.dataset.reveal <= rev;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  if (s.id === 'P08') setCardTab(rev === 2 ? 'ac' : 'challenge');
  const grid = $('#slide .main-grid');
  if (grid) grid.classList.toggle('can-reveal', rev < max);
}
function renderSlide() {
  closeCardModal();
  const s=slides[state.page];
  const kind=!s.stepId?'cover':s.id==='P25'?'activity closing':'activity';
  const stage=$('#slide');
  stage.className=`canvas page-${s.id} ${kind}`;
  stage.innerHTML = !s.stepId ? renderCover()
    : `${s.id==='P25'?topbar():''}<header class="activity-heading"><h1>${textPair(s.title)}</h1></header><section class="activity-overview" aria-label="WHY and WHAT"><div class="brief-item brief-why">${label(LABELS.why)}${textPair(s.why,'overview-text')}</div><div class="brief-item brief-what">${label(LABELS.what)}${textPair(s.output,'overview-text')}</div></section>${mainHTML(s)}`;
  $('#frame').className=`frame lang-${state.lang}${state.page===0?' on-cover':''}`;
  document.documentElement.lang = state.lang==='zh' ? 'zh-Hans' : 'en';
  $('#page-number').innerHTML=`<strong>${String(state.page).padStart(2,'0')}</strong><span>/ ${String(LAST).padStart(2,'0')}</span>`;
  $('[data-cmd="prev-page"].pager-btn').disabled = state.page===0;
  $('[data-cmd="next-page"].pager-btn').disabled = state.page===LAST;
  updateReveal();
  renderTimer();
  announce(`${String(state.page).padStart(2,'0')} / ${LAST} ${s.title.en||''}`);
}

/* ---------- Floating timer ---------- */
const ICON = {
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h4.2v15H6zM13.8 4.5H18v15h-4.2z"/></svg>',
  stop:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"/></svg>',
  restart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.6 4.7l2.1.7A4.8 4.8 0 1 0 12 7.2V10L7.5 6.1 12 2.2z"/></svg>',
  open:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5l7 7 7-7-1.6-1.6L12 12.3 6.6 6.9z"/></svg>',
  close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5l7-7 7 7-1.6 1.6L12 11.7l-5.4 5.4z"/></svg>'
};
const STATUS = {ready:loc('Ready','待开始'),running:loc('Running','计时中'),paused:loc('Paused','已暂停'),expired:loc("Time's up",'时间到')};
function renderTimer() {
  const open=state.timerOpen, page=slides[state.page], pageSec=page.durationSec;
  const presets=[[180,'3:00'],[300,'5:00'],[600,'10:00'],[900,'15:00']];
  $('#timer').innerHTML=`<div class="timer-pill"><span class="state-dot" aria-hidden="true"></span><span class="timer-compact" id="timer-compact" aria-live="off"></span><button class="icon-btn" data-cmd="toggle" id="pill-toggle"></button><button class="icon-btn" data-cmd="panel" aria-expanded="${open}" aria-controls="timer-panel" aria-label="${open?'Collapse':'Expand'} timer">${open?ICON.close:ICON.open}</button></div>
  <div class="timer-panel" id="timer-panel" ${open?'':'hidden'}>
    <div class="timer-number" id="timer-number" aria-live="off"></div>
    <div class="timer-progress" aria-hidden="true"><div class="timer-progress-fill" id="timer-progress-fill"></div></div>
    <div class="timer-state" id="timer-state"></div>
    <div class="btn-row main-controls"><button class="btn btn-primary" data-cmd="toggle" id="panel-toggle"></button><button class="btn" data-cmd="stop">${ICON.stop}<span>${inline(loc('Stop','停止'))}</span></button><button class="btn" data-cmd="restart">${ICON.restart}<span>${inline(loc('Restart','重来'))}</span></button></div>
    <div class="btn-row adjust-controls">${[[-60,'−1:00'],[-10,'−0:10'],[10,'+0:10'],[60,'+1:00']].map(([d,t])=>`<button class="btn btn-quiet" data-adjust="${d}">${t}</button>`).join('')}</div>
    <div class="panel-section">${label(loc('Set time','设定时间'),'panel-label')}
      <form class="set-row" id="timer-form"><input id="timer-input" inputmode="numeric" autocomplete="off" placeholder="MM:SS" aria-label="Set time, MM:SS or minutes" value="${clockText(state.timer.durationSec)}"><button class="btn">${inline(loc('Set','设定'))}</button></form>
      <div class="btn-row presets">${pageSec?`<button class="btn btn-quiet preset-page" data-preset="${pageSec}">${inline(loc('This page','本页'))} ${clockText(pageSec)}</button>`:''}${presets.map(([s,t])=>`<button class="btn btn-quiet" data-preset="${s}">${t}</button>`).join('')}</div>
      <p class="timer-error" id="timer-error" role="alert"></p>
    </div>
    <div class="panel-foot"><div class="lang-switch" role="group" aria-label="Display language">${[['both','双语 EN'],['en','EN'],['zh','中文']].map(([k,t])=>`<button class="seg ${state.lang===k?'is-on':''}" data-lang="${k}" aria-pressed="${state.lang===k}">${t}</button>`).join('')}</div><button class="btn btn-quiet" data-cmd="fullscreen">${inline(loc('Fullscreen','全屏'))}</button></div>
    <p class="key-hint">Space ${inline(loc('start/pause','开始/暂停'))} · R ${inline(loc('restart','重来'))} · S ${inline(loc('stop','停止'))} · +/− ${inline(loc('1 min','1 分钟'))} · T ${inline(loc('panel','面板'))} · L ${inline(loc('language','语言'))}</p>
  </div>`;
  updateTimer();
}
// Only touch the DOM when content changes, so buttons are never replaced mid-click.
function put(el, html) { if (el && el.dataset.html!==html) { el.innerHTML=html; el.dataset.html=html; } }
function updateTimer() {
  if (T.settle()) save();
  const r=T.remaining(), status=T.status(), t=state.timer;
  const el=$('#timer');
  const cls=`timer is-${status} ${state.timerOpen?'is-open':'is-closed'} ${status!=='expired'&&t.durationSec>0&&r<=t.durationSec*.2?'near-time':''}`;
  if (el.className!==cls) el.className=cls;
  put($('#timer-compact'),clockText(r));
  put($('#timer-number'),clockText(r));
  $('#timer-progress-fill').style.width=`${t.durationSec?Math.min(100,r/t.durationSec*100):0}%`;
  put($('#timer-state'),`${inline(STATUS[status])}<span class="timer-of">${inline(loc('of','共'))} ${clockText(t.durationSec)}</span>`);
  const running=t.running;
  const pill=$('#pill-toggle'); put(pill,running?ICON.pause:ICON.play); pill.setAttribute('aria-label',running?'Pause timer':'Start timer');
  put($('#panel-toggle'),`${running?ICON.pause:ICON.play}<span>${inline(running?loc('Pause','暂停'):status==='paused'?loc('Resume','继续'):loc('Start','开始'))}</span>`);
}

/* ---------- Commands ---------- */
let lastAnnouncement='';
function announce(text) { if (text && text!==lastAnnouncement) { $('#announcement').textContent=text; lastAnnouncement=text; } }
function go(page, revealMode=0) {
  const p=Math.min(LAST,Math.max(0,page));
  const max=maxSteps(slides[p]);
  const nextReveal = revealMode==='all' ? max : Math.min(max,Math.max(0,+revealMode||0));
  if (p===state.page && nextReveal===state.reveal) return;
  state.page=p; state.reveal=nextReveal; save(); renderSlide();
}
async function fullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch {}
}
function command(name) {
  switch (name) {
    case 'next': {
      const max=maxSteps(slides[state.page]);
      if (state.page>0 && state.reveal<max) { state.reveal++; save(); updateReveal(); return; }
      return go(state.page+1, 0);
    }
    case 'prev': {
      if (state.page>0 && state.reveal>0) { state.reveal--; save(); updateReveal(); return; }
      return go(state.page-1, 'all');
    }
    case 'next-page': return go(state.page+1, 0);
    case 'prev-page': return go(state.page-1, 'all');
    case 'first': return go(0, 0);
    case 'last': return go(LAST, 0);
    case 'toggle': T.toggle(); break;
    case 'stop': T.stop(); break;
    case 'restart': T.restart(); break;
    case 'panel': state.timerOpen=!state.timerOpen; save(); renderTimer(); return;
    case 'close-panel': if (closeCardModal()) return; if (!state.timerOpen) return; state.timerOpen=false; save(); renderTimer(); return;
    case 'close-modal': closeCardModal(); return;
    case 'lang': state.lang=LANGS[(LANGS.indexOf(state.lang)+1)%LANGS.length]; save(); renderSlide(); return;
    case 'fullscreen': fullscreen(); return;
    default: return;
  }
  save(); updateTimer();
}
document.addEventListener('click', e => {
  const b=e.target.closest('button');
  if (b) {
    if (b.disabled) return;
    if (b.closest('form') && b.type!=='button') return; // handled by submit
    if (b.dataset.cmd) command(b.dataset.cmd);
    else if (b.dataset.adjust) { T.adjust(+b.dataset.adjust); save(); updateTimer(); }
    else if (b.dataset.preset) { T.set(+b.dataset.preset); save(); renderTimer(); }
    else if (b.dataset.lang) { state.lang=b.dataset.lang; save(); renderSlide(); }
    else if (b.dataset.card) { setCardTab(b.dataset.card); }
    else if (b.dataset.reveal) {
      const target=+b.dataset.reveal;
      state.reveal = state.reveal===target ? target-1 : target;
      save(); updateReveal();
    }
    b.blur(); // keep keyboard shortcuts global after a mouse click
    return;
  }
  // Clicking inside the full-screen card modal (outside tabs) closes it
  if (e.target.closest('#card-modal')) {
    if (!e.target.closest('.modal-tabs')) closeCardModal();
    return;
  }
  // Clicking any example card opens the full-screen popup
  const viewer = e.target.closest('.card-viewer[data-popup]');
  if (viewer) {
    openCardModal(viewer.dataset.popup);
    return;
  }
  // Clicking on the HOW area (or activity slide body outside links/contact-card) reveals the next HOW item one by one.
  if (e.target.closest('a,input,select,textarea,#timer,.pager,.contact-card')) return;
  if (e.target.closest('#slide .main-grid') || e.target.closest('#slide.activity')) {
    const max=maxSteps(slides[state.page]);
    if (state.reveal<max) { state.reveal++; save(); updateReveal(); }
  }
});
document.addEventListener('submit', e => {
  if (e.target.id!=='timer-form') return;
  e.preventDefault();
  const sec=parseTime($('#timer-input').value);
  if (sec===null || sec<=0 || sec>MAX_TIMER_SEC) { $('#timer-error').textContent='请输入 MM:SS 或分钟数（最多 180 分钟） · Use MM:SS or minutes'; return; }
  T.set(sec); save(); renderTimer();
});
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('input,select,textarea,[contenteditable="true"]')) { if (e.key==='Escape') e.target.blur(); return; }
  const key=e.key.length===1 ? e.key.toLowerCase() : e.key;
  const map={ArrowRight:'next',PageDown:'next',ArrowDown:'next',ArrowLeft:'prev',PageUp:'prev',ArrowUp:'prev',Home:'first',End:'last',' ':'toggle',r:'restart',s:'stop',t:'panel',l:'lang',f:'fullscreen',Escape:'close-panel'};
  if (key==='+'||key==='=') { e.preventDefault(); T.adjust(60); save(); updateTimer(); return; }
  if (key==='-'||key==='_') { e.preventDefault(); T.adjust(-60); save(); updateTimer(); return; }
  if (e.shiftKey && (key==='ArrowRight'||key==='PageDown')) { e.preventDefault(); command('next-page'); return; }
  if (e.shiftKey && (key==='ArrowLeft'||key==='PageUp')) { e.preventDefault(); command('prev-page'); return; }
  if (map[key]) { if (e.repeat && map[key]!=='next' && map[key]!=='prev') return; e.preventDefault(); command(map[key]); }
});
// Reveal the page arrows briefly when the mouse moves; the page number itself is always visible.
let hideTimer;
document.addEventListener('pointermove', () => { document.body.classList.add('show-pager'); clearTimeout(hideTimer); hideTimer=setTimeout(()=>document.body.classList.remove('show-pager'),2200); }, {passive:true});
window.addEventListener('storage', e => { if (e.key===STORAGE_KEY) { try { const v=JSON.parse(e.newValue); if (validState(v)) { state=v; renderSlide(); } } catch {} } });
function resize() { document.documentElement.style.setProperty('--scale', Math.min(innerWidth/1920, innerHeight/1080)); }
window.addEventListener('resize', resize);
resize(); renderSlide(); save();
setInterval(updateTimer, 250);
