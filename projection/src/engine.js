export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'agile-sprint-lab-projection-v1';
export const DEFAULT_CONFIG = {
  title: 'Agile Sprint Lab', facilitatorName: 'Percy Hsu', email: 'agiletalks@gmail.com',
  eventName: 'IAF Asia 2026', location: 'Hangzhou', eventDate: '2026-11-01',
  timezone: 'Asia/Shanghai', scheduledStart: '08:30', scheduledEnd: '10:30',
  teamSizeMin: 4, teamSizeMax: 5, languageMode: 'both', uploadUrl: '', logoDataUri: '',
  showTimer: true, sound: false,
  feedbackWallLabels: [
    { en: 'Feedback for Percy', zhTW: '給 Percy 的回饋' },
    { en: 'My next experiment', zhTW: '我的下一次嘗試' }
  ]
};
export function freshState(slides) {
  return {
    schemaVersion: SCHEMA_VERSION, activePage: 0, lastActivityPage: 1, workshopStartedAt: null,
    config: structuredClone(DEFAULT_CONFIG),
    pages: slides.map(s => ({
      timerState: 'idle', planState: 'scheduled', allocatedSec: s.durationSec,
      remainingSec: s.durationSec, activeElapsedSec: 0, deadlineAtMs: null,
      lastAccountedAtMs: null, handledAlertIds: [], dismissedAlertIds: [],
      expirySoundHandled: false, activeAlertId: null
    }))
  };
}
export function validateState(s, slides) {
  const num = n => Number.isFinite(n) && n >= 0;
  const index = n => Number.isInteger(n) && n >= 0 && n < slides.length;
  if (!s || s.schemaVersion !== SCHEMA_VERSION || !index(s.activePage) || !index(s.lastActivityPage)
      || s.lastActivityPage === 0 || !Array.isArray(s.pages) || s.pages.length !== slides.length
      || !(s.workshopStartedAt === null || num(s.workshopStartedAt))) return false;
  const c = s.config;
  if (!c || !['both','en','zh'].includes(c.languageMode) || !['showTimer','sound'].every(k => typeof c[k] === 'boolean')
      || !['title','facilitatorName','email','eventName','location','eventDate','timezone','scheduledStart','scheduledEnd','uploadUrl','logoDataUri'].every(k => typeof c[k] === 'string')
      || !Number.isInteger(c.teamSizeMin) || !Number.isInteger(c.teamSizeMax) || c.teamSizeMin < 1 || c.teamSizeMax < c.teamSizeMin || c.teamSizeMax > 20
      || !/^\d{4}-\d{2}-\d{2}$/.test(c.eventDate) || ![c.scheduledStart,c.scheduledEnd].every(v => /^([01]\d|2[0-3]):[0-5]\d$/.test(v))
      || !Array.isArray(c.feedbackWallLabels) || c.feedbackWallLabels.length !== 2 || !c.feedbackWallLabels.every(l => typeof l.en === 'string' && typeof l.zhTW === 'string')
      || !(c.logoDataUri === '' || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(c.logoDataUri))) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: c.timezone }); } catch { return false; }
  let running = 0;
  return s.pages.every((p,i) => {
    if (!p || !['idle','running','paused','expired'].includes(p.timerState) || !['scheduled','deferred','completed'].includes(p.planState)
        || !['allocatedSec','remainingSec','activeElapsedSec'].every(k => num(p[k])) || p.remainingSec > 86400 || p.allocatedSec > 86400
        || p.remainingSec > p.allocatedSec || ![p.deadlineAtMs,p.lastAccountedAtMs].every(v => v === null || num(v))
        || !['handledAlertIds','dismissedAlertIds'].every(k => Array.isArray(p[k]) && p[k].every(v => typeof v === 'string'))
        || typeof p.expirySoundHandled !== 'boolean' || !(p.activeAlertId === null || typeof p.activeAlertId === 'string')) return false;
    if (p.timerState === 'running') {
      running++;
      if (i !== s.activePage || i === 0 || running > 1 || p.planState !== 'scheduled' || p.deadlineAtMs === null || p.lastAccountedAtMs === null || s.workshopStartedAt === null) return false;
    } else if (p.deadlineAtMs !== null) return false;
    if (i > 0 && ((p.timerState === 'expired') !== (p.remainingSec === 0) || (p.planState === 'completed') !== (p.remainingSec === 0))) return false;
    return true;
  });
}
export function clockText(sec) {
  const n = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(n / 60)).padStart(2,'0')}:${String(n % 60).padStart(2,'0')}`;
}
export function validUploadUrl(value) {
  if (!value) return false;
  try { const u = new URL(value); return ['http:','https:'].includes(u.protocol) && !u.username && !u.password && value.length <= 1500; } catch { return false; }
}
export function alertDefinitions(slide) {
  const common = slide.durationSec <= 60
    ? [{ id: 'wrap', sec: 10, priority: 30, en: 'Please wrap up', zhTW: '請準備收尾' }]
    : [
      { id: 'almost', sec: slide.durationSec * .2, priority: 10, en: 'Almost time', zhTW: '即將到時' },
      { id: 'wrap', sec: slide.durationSec * .1, priority: 30, en: 'Please wrap up', zhTW: '請準備收尾' }
    ];
  if (slide.id === 'P17') common.push(
    { id: 'work-10', sec: 600, priority: 20, en: 'Check your AC. Decide how to use the remaining time.', zhTW: '對照驗收條件，決定剩餘時間如何運用。' },
    { id: 'work-3', sec: 180, priority: 40, en: 'Finish and capture the current challenge. Mark unfinished work clearly.', zhTW: '聚焦完成目前題目並記錄，未完成請標示狀態。' }
  );
  return common;
}
export class Workshop {
  constructor(slides, state = freshState(slides), now = () => Date.now()) {
    if (!validateState(state, slides)) throw new Error('Invalid workshop state');
    this.slides = slides; this.state = state; this.now = now; this.effects = [];
    this.settle();
  }
  get page() { return this.state.pages[this.state.activePage]; }
  get slide() { return this.slides[this.state.activePage]; }
  checkAlerts(p, slide, previous) {
    const defs = alertDefinitions(slide);
    const crossed = defs.filter(a => previous > a.sec && p.remainingSec <= a.sec && !p.handledAlertIds.includes(a.id));
    crossed.forEach(a => p.handledAlertIds.push(a.id));
    const old = defs.find(a => a.id === p.activeAlertId);
    const best = [...crossed, ...(old ? [old] : [])].sort((a,b) => b.priority-a.priority)[0];
    if (best) p.activeAlertId = best.id;
  }
  settle() {
    if (!this.state.activePage) return;
    const p = this.page;
    if (p.timerState !== 'running') return;
    const now = this.now();
    const previous = p.remainingSec;
    // A backwards system clock adjustment must not add time or double-count work.
    const effectiveNow = Math.max(now, p.lastAccountedAtMs);
    p.remainingSec = Math.max(0, Math.min(previous, (p.deadlineAtMs-effectiveNow)/1000));
    p.activeElapsedSec += previous-p.remainingSec;
    p.lastAccountedAtMs = effectiveNow;
    this.checkAlerts(p, this.slide, previous);
    if (p.remainingSec === 0) this.expire(p);
  }
  expire(p) {
    p.remainingSec = 0; p.timerState = 'expired'; p.planState = 'completed'; p.deadlineAtMs = null; p.lastAccountedAtMs = null;
    if (!p.expirySoundHandled) {
      p.expirySoundHandled = true;
      if (this.state.config.sound) this.effects.push('expiry-sound');
    }
  }
  start() {
    this.settle();
    if (!this.state.activePage) {
      if (this.state.workshopStartedAt !== null) { this.navigate(this.state.lastActivityPage); return; }
      this.navigate(1);
    }
    const p = this.page;
    if (p.remainingSec <= 0 || p.timerState === 'running') return;
    if (this.state.workshopStartedAt === null) {
      this.state.workshopStartedAt = this.now();
      for (let i=1;i<this.state.activePage;i++) if(this.state.pages[i].planState === 'scheduled') this.state.pages[i].planState = 'deferred';
    }
    p.planState = 'scheduled'; p.timerState = 'running';
    p.deadlineAtMs = this.now()+p.remainingSec*1000; p.lastAccountedAtMs = this.now();
  }
  pause() {
    this.settle();
    if (this.page.timerState === 'running') { this.page.timerState = 'paused'; this.page.deadlineAtMs = null; this.page.lastAccountedAtMs = null; }
  }
  toggle() { this.page.timerState === 'running' ? this.pause() : this.start(); }
  navigate(index, andStart = false) {
    if (!Number.isInteger(index) || index < 0 || index >= this.slides.length || index === this.state.activePage) return;
    const from = this.state.activePage;
    this.pause();
    if (from > 0 && index > from) {
      for (let i=from; i<index; i++) {
        const p=this.state.pages[i];
        if (p.planState === 'scheduled' && p.remainingSec > 0) p.planState='deferred';
      }
    }
    this.state.activePage = index;
    if (index) this.state.lastActivityPage = index;
    if (andStart && index) this.start();
  }
  setRemaining(seconds) {
    if (!this.state.activePage || !Number.isFinite(seconds)) return;
    this.settle(); const p=this.page, old=p.remainingSec, was=p.timerState;
    p.remainingSec=Math.max(0,Math.min(86400-(p.allocatedSec-old),seconds));
    p.allocatedSec+=p.remainingSec-old;
    if (p.remainingSec === 0) this.expire(p);
    else if (was === 'running') { p.deadlineAtMs=this.now()+p.remainingSec*1000; p.lastAccountedAtMs=this.now(); }
    else if (was === 'expired') { p.timerState='paused'; p.planState='scheduled'; }
    this.checkAlerts(p,this.slide,old);
  }
  adjust(delta) { this.settle(); this.setRemaining(this.page.remainingSec+delta); }
  resetPage() {
    if (!this.state.activePage) return;
    this.pause();
    const elapsed=this.page.activeElapsedSec;
    Object.assign(this.page, freshState(this.slides).pages[this.state.activePage], {activeElapsedSec:elapsed});
  }
  requeue(index) {
    this.settle(); const p=this.state.pages[index];
    if (index > 0 && p?.remainingSec > 0) p.planState='scheduled';
  }
  discard(index) {
    this.settle(); const p=this.state.pages[index];
    if (!index || p?.planState !== 'deferred') return;
    p.allocatedSec-=p.remainingSec; p.remainingSec=0; p.timerState='expired'; p.planState='completed';
    p.activeAlertId=null; p.expirySoundHandled=true;
  }
  transfer(from,to) {
    this.settle();
    const p=this.state.pages[from], q=this.state.pages[to];
    if (!from || !to || from === to || p?.planState !== 'deferred' || !q || q.allocatedSec+p.remainingSec > 86400) return;
    const amount=p.remainingSec;
    this.discard(from);
    q.remainingSec+=amount; q.allocatedSec+=amount; q.planState='scheduled';
    if (q.timerState === 'expired') q.timerState='paused';
    if (q.timerState === 'running') { q.deadlineAtMs=this.now()+q.remainingSec*1000; q.lastAccountedAtMs=this.now(); }
  }
  dismissAlert() {
    const p=this.page;
    if (p.activeAlertId) p.dismissedAlertIds.push(p.activeAlertId);
    p.activeAlertId=null;
  }
  replayAlert(id) {
    if (!alertDefinitions(this.slide).some(a=>a.id===id)) return;
    this.page.activeAlertId=id;
    this.page.dismissedAlertIds=this.page.dismissedAlertIds.filter(a=>a!==id);
  }
  get activeAlert() { return alertDefinitions(this.slide).find(a=>a.id===this.page.activeAlertId); }
  stepRemaining() { return this.slides.reduce((sum,s,i)=>sum+(s.stepId === this.slide.stepId && this.state.pages[i].planState === 'scheduled' ? this.state.pages[i].remainingSec : 0),0); }
  plannedRemaining() { return this.state.pages.slice(1).reduce((sum,p)=>sum+(p.planState === 'scheduled' ? p.remainingSec : 0),0); }
  deferredRemaining() { return this.state.pages.slice(1).reduce((sum,p)=>sum+(p.planState === 'deferred' ? p.remainingSec : 0),0); }
}
// Resolve a wall time in an IANA time zone without assuming the host time zone.
export function targetTimestamp(config) {
  const [y,m,d]=config.eventDate.split('-').map(Number);
  const [h,min]=config.scheduledEnd.split(':').map(Number);
  const utc=Date.UTC(y,m-1,d,h,min);
  let stamp=utc;
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:config.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  for(let i=0;i<3;i++) {
    const parts=Object.fromEntries(fmt.formatToParts(stamp).map(p=>[p.type,p.value]));
    stamp+=utc-Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute);
  }
  return stamp;
}
