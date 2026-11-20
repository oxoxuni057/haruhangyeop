// 1. 홈 — 달력, 일정 목록, 일정 추가, 알림
import { sb, hd, bk, ic, esc, tabs, chips, toast, confirmBox, inputBox } from '../ui.js';
import { go, back, refresh } from '../router.js';
import * as store from '../data/store.js';
import { sync } from '../data/sync.js';
import { CATS } from '../core/daily.js';
import { monthGrid, addMonths, monthOf, dayNum, mdw, timeKo, dotw, when, addDays } from '../core/date.js';

// 분류별 막대 모양 (흑백으로 구분)
const BASE = { 수업: 'background:var(--k)', 동아리: 'background:var(--g3)', 대외활동: 'border:1.5px solid var(--k);background:#fff', 아르바이트: 'background:var(--g4)' };
const EXTRA = ['border:1.5px dashed var(--k);background:#fff', 'background:var(--g1)', 'border:1.5px solid var(--g3);background:#fff'];
export function catStyle(cat) {
  if (BASE[cat]) return BASE[cat];
  const custom = store.get().customCats || [];
  return EXTRA[Math.max(0, custom.indexOf(cat)) % EXTRA.length];
}
const tagCls = cat => (cat === '수업' ? 'dark' : cat === '대외활동' ? 'line' : '');
const evbar = (c, w = 22, m = '3px auto 0') => `<div style="height:5px;width:${w}px;border-radius:3px;margin:${m};flex:none;${catStyle(c)}"></div>`;
export const allCats = () => [...CATS, ...(store.get().customCats || [])];

const evcard = e => `<div class="card row" style="padding:14px 14px 14px 16px;gap:12px">
  <div style="width:5px;align-self:stretch;border-radius:3px;${catStyle(e.cat)}"></div>
  <div style="flex:1;min-width:0"><div class="row" style="gap:6px"><span class="tag ${tagCls(e.cat)}">${esc(e.cat)}</span><span class="mute">${e.allDay ? '하루 종일' : timeKo(e.start)}</span></div>
  <div style="font-size:15.5px;font-weight:600;margin-top:7px">${esc(e.title)}</div>${e.memo ? `<div class="sub" style="margin-top:4px">${esc(e.memo)}</div>` : ''}</div>
  <button data-more="${e.id}" aria-label="더 보기">${ic('more', 20)}</button></div>`;

const eventsOn = d => store.get().events.filter(e => e.date === d).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
const todayLabel = (d, t) => `${mdw(d)}${d === t ? ' <span style="color:var(--g3);font-weight:500">(오늘)</span>' : ''}`;

function bindMore(app) {
  app.querySelectorAll('[data-more]').forEach(b => (b.onclick = e => {
    e.stopPropagation();
    const s = store.get();
    const ev = s.events.find(x => x.id === b.dataset.more);
    confirmBox('이 일정을 지울까요?', ev.title, '지우기', () => {
      s.events = s.events.filter(x => x.id !== ev.id); store.save(); refresh(); toast('일정을 지웠어요');
    });
  }));
}
function monthPicker(app, month, sel) {
  const inp = app.querySelector('[data-month]');
  inp.onchange = () => inp.value && refresh({ month: inp.value, sel: inp.value === monthOf(store.today()) ? store.today() : inp.value + '-01' });
  app.querySelector('[data-prev]').onclick = () => refresh({ month: addMonths(month, -1), sel: addMonths(month, -1) + '-01' });
  app.querySelector('[data-nextm]').onclick = () => refresh({ month: addMonths(month, 1), sel: addMonths(month, 1) + '-01' });
}
const monthTitle = (month, faded) => `<div class="row" style="gap:2px;${faded ? 'color:var(--g4)' : ''}">
  <button data-prev aria-label="이전 달" style="display:flex;margin-left:-6px">${ic('left', 20, 2)}</button>
  <label class="row" style="gap:4px;font-size:22px;font-weight:800;position:relative;cursor:pointer">${month.replace('-', '.')} ${ic('down', 22, 2)}
    <input type="month" data-month value="${month}" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
  <button data-nextm aria-label="다음 달" style="display:flex">${ic('right', 20, 2)}</button></div>`;

export const home = {
  render: ({ month, sel }) => {
    sync();
    const t = store.today();
    sel = sel || t; month = month || monthOf(sel);
    const cells = monthGrid(month).map(d => {
      if (!d) return '<div class="day"></div>';
      const evs = eventsOn(d);
      const cats = [...new Set(evs.map(e => e.cat))].slice(0, 2);
      return `<button class="day ${d === t ? 'today' : ''} ${d === sel && d !== t ? 'sel' : ''}" data-d="${d}"><div class="n">${dayNum(d)}</div>${cats.map(c => evbar(c)).join('')}</button>`;
    }).join('');
    const W = ['일', '월', '화', '수', '목', '금', '토'].map((w, i) => `<div style="font-size:12px;color:${i === 0 ? 'var(--g2)' : 'var(--g3)'};font-weight:600;padding-bottom:8px">${w}</div>`).join('');
    const legend = `<div class="row" style="gap:8px;font-size:11.5px;color:var(--g2);flex-wrap:wrap;justify-content:flex-end">${CATS.map(c => `<span class="row" style="gap:4px">${evbar(c, 14, '0')}${c}</span>`).join('')}</div>`;
    const evs = eventsOn(sel);
    return `${sb()}${hd('home', '홈')}<div class="ct" style="padding-top:0;padding-bottom:190px">
    <div class="row between" style="margin:6px 0 16px;align-items:flex-start">${monthTitle(month)}</div>
    <div style="margin:-8px 0 12px">${legend}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center">${W}${cells}</div></div>
    <div class="sheet" style="bottom:78px;height:170px" data-sheet>
      <button class="handle" data-up aria-label="목록 보기" style="display:block"></button>
      <div class="row between"><div class="h2" style="font-size:16px">${todayLabel(sel, t)}</div><button class="mute" data-up>위로 올려 목록 보기</button></div>
      <div style="margin-top:12px">${evs.length ? evcard(evs[0]) + (evs.length > 1 ? `<div class="mute" style="margin-top:8px;text-align:center">일정 ${evs.length - 1}개 더 있어요</div>` : '')
        : `<div class="sub" style="padding:14px 0">일정이 없어요. + 를 눌러 경험을 적어 보세요.</div>`}</div></div>
    <button class="fab" style="bottom:270px" data-add aria-label="일정 추가">${ic('plus', 28, 2)}</button>
    <div style="position:absolute;left:0;right:0;bottom:0;z-index:4">${tabs(0)}</div>`;
  },
  bind: (app, { month, sel }) => {
    const t = store.today();
    sel = sel || t; month = month || monthOf(sel);
    app.querySelectorAll('[data-d]').forEach(b => (b.onclick = () => refresh({ sel: b.dataset.d, month })));
    app.querySelectorAll('[data-up]').forEach(b => (b.onclick = () => go('homeList', { sel, month })));
    app.querySelector('[data-add]').onclick = () => go('eventAdd', { date: sel });
    monthPicker(app, month, sel);
    bindMore(app);
    // 시트를 위로 밀면 목록으로
    const sh = app.querySelector('[data-sheet]');
    let y0 = null;
    sh.addEventListener('touchstart', e => (y0 = e.touches[0].clientY), { passive: true });
    sh.addEventListener('touchend', e => { if (y0 !== null && y0 - e.changedTouches[0].clientY > 40) go('homeList', { sel, month }); y0 = null; });
  },
};

export const homeList = {
  render: ({ sel, month }) => {
    const t = store.today();
    sel = sel || t; month = month || monthOf(sel);
    const s = store.get();
    const upcoming = [...new Set(s.events.filter(e => e.date > sel && e.date <= addDays(sel, 30)).map(e => e.date))].sort();
    const block = (d, first) => `<div class="h2" style="${first ? '' : 'margin-top:26px;font-size:15px;color:var(--g2)'}">${todayLabel(d, t)}</div>
      <div class="stack" style="margin-top:${first ? 14 : 12}px">${eventsOn(d).map(evcard).join('') || '<div class="sub">일정이 없어요.</div>'}</div>`;
    return `${sb()}${hd('home', '홈')}<div style="height:60px;padding:6px 20px 0" class="row">${monthTitle(month, true)}</div>
    <div class="sheet" style="position:relative;flex:1;overflow-y:auto;padding-bottom:90px" data-sheet>
      <button class="handle" data-down aria-label="달력 보기" style="display:block"></button>
      ${block(sel, true)}${upcoming.map(d => block(d)).join('')}
    </div>
    <button class="fab" style="bottom:98px" data-add aria-label="일정 추가">${ic('plus', 28, 2)}</button>${tabs(0)}`;
  },
  bind: (app, { sel, month }) => {
    sel = sel || store.today(); month = month || monthOf(sel);
    const toCal = () => go('home', { sel, month }, { reset: true });
    app.querySelector('[data-down]').onclick = toCal;
    app.querySelector('[data-add]').onclick = () => go('eventAdd', { date: sel });
    app.querySelector('[data-month]').onchange = e => e.target.value && go('home', { month: e.target.value, sel: e.target.value + '-01' }, { reset: true });
    app.querySelector('[data-prev]').onclick = () => go('home', { month: addMonths(month, -1), sel: addMonths(month, -1) + '-01' }, { reset: true });
    app.querySelector('[data-nextm]').onclick = () => go('home', { month: addMonths(month, 1), sel: addMonths(month, 1) + '-01' }, { reset: true });
    bindMore(app);
    const sh = app.querySelector('[data-sheet]');
    let y0 = null;
    sh.addEventListener('touchstart', e => (y0 = sh.scrollTop === 0 ? e.touches[0].clientY : null), { passive: true });
    sh.addEventListener('touchend', e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 60) toCal(); y0 = null; });
  },
};

// 일정 추가
let draft = null;
export const eventAdd = {
  render: ({ date }) => {
    if (!draft) draft = { title: '', allDay: false, date: date || store.today(), start: '14:00', end: '15:00', cat: '수업', memo: '' };
    const d = draft;
    const tagInput = (type, name, val) => `<label class="tag" style="font-size:14px;padding:7px 11px;position:relative;cursor:pointer">${type === 'date' ? dotw(val) : timeKo(val)}
      <input type="${type}" name="${name}" value="${val}" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>`;
    return `${sb()}<div class="hd"><button data-back style="margin-left:-6px;display:flex" aria-label="뒤로">${ic('left', 26)}</button><div style="font-size:17px;font-weight:700">일정 추가</div><button data-save style="display:flex" aria-label="저장">${ic('check', 26, 2)}</button></div>
    <div class="ct">
    <input name="title" value="${esc(d.title)}" placeholder="제목" style="width:100%;border:0;border-bottom:1px solid var(--line);font-size:22px;font-weight:700;padding:12px 0 16px;outline:none">
    <div class="listrow"><span style="flex:1;font-size:15px;font-weight:500">하루 종일</span><button class="toggle ${d.allDay ? '' : 'off'}" data-allday aria-label="하루 종일"></button></div>
    <div class="listrow"><span style="flex:1;font-size:15px;font-weight:500">시작</span>${tagInput('date', 'date', d.date)}${d.allDay ? '' : tagInput('time', 'start', d.start)}</div>
    ${d.allDay ? '' : `<div class="listrow"><span style="flex:1;font-size:15px;font-weight:500">종료</span>${tagInput('date', 'date2', d.date)}${tagInput('time', 'end', d.end)}</div>`}
    <div class="lab" style="margin-top:22px">분류</div>
    <div class="chips">${allCats().map(c => `<button class="chip ${c === d.cat ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}<button class="chip" style="padding:0 9px" data-newcat aria-label="분류 추가">${ic('plus', 16)}</button></div>
    <div class="mute" style="margin-top:8px">+ 를 눌러 나만의 분류를 만들 수 있어요</div>
    <div class="lab" style="margin-top:24px">한 줄 메모</div>
    <textarea class="ta" name="memo" style="height:150px" placeholder="무엇을 했는지, 누구와 함께했는지 짧게 적어 두면&#10;다음 날 한 질문으로 물어봐요">${esc(d.memo)}</textarea>
    </div>`;
  },
  bind: app => {
    const d = draft;
    const val = n => app.querySelector(`[name=${n}]`);
    const keep = () => { d.title = val('title').value; d.memo = val('memo').value; };
    app.querySelector('[data-allday]').onclick = () => { keep(); d.allDay = !d.allDay; refresh(); };
    app.querySelectorAll('[data-cat]').forEach(b => (b.onclick = () => { keep(); d.cat = b.dataset.cat; refresh(); }));
    app.querySelector('[data-newcat]').onclick = () => {
      keep();
      inputBox('새 분류 이름', '예: 스터디', '추가', name => {
        const s = store.get();
        s.customCats = [...new Set([...(s.customCats || []), name])];
        store.save(); d.cat = name; refresh();
      });
    };
    ['date', 'date2', 'start', 'end'].forEach(n => { const el = val(n); if (el) el.onchange = () => { keep(); if (el.value) d[n === 'date2' ? 'date' : n] = el.value; refresh(); }; });
    app.querySelector('[data-save]').onclick = () => {
      keep();
      if (!d.title.trim()) return toast('제목을 적어 주세요');
      const s = store.get();
      s.events.push({ id: store.uid('e'), date: d.date, cat: d.cat, title: d.title.trim(), allDay: d.allDay, start: d.allDay ? '' : d.start, end: d.allDay ? '' : d.end, memo: d.memo.trim() });
      store.save();
      const date = d.date; draft = null;
      toast('일정을 추가했어요. 다음 날 한 질문으로 물어볼게요');
      go('home', { sel: date, month: monthOf(date) }, { reset: true });
    };
  },
  leave: () => { draft = null; },
};

// 알림 목록
export const notis = {
  render: ({ f = '전체' }) => {
    const s = store.get(); const t = store.today();
    const list = s.notis.filter(n => f === '전체' || n.type === f);
    return `${sb()}${bk('알림')}<div class="ct">
    <div style="margin-bottom:6px">${chips(['전체', '질문', '복습', '소식'], f, 'f')}</div>
    ${list.map(n => `<button class="listrow" style="align-items:flex-start;padding:16px 0" data-n="${n.id}">
      ${!n.read ? '<div style="width:7px;height:7px;border-radius:50%;background:var(--k);margin-top:7px;flex:none"></div>' : '<div style="width:7px;flex:none"></div>'}
      <div style="flex:1"><div style="font-size:15px;font-weight:${n.read ? 500 : 600};line-height:1.45">${esc(n.title)}</div><div class="sub" style="margin-top:4px">${esc(n.sub)}</div></div>
      <span class="mute" style="flex:none">${when(n.date, n.time, t)}</span></button>`).join('') || '<div class="empty"><div class="s">알림이 없어요.</div></div>'}
    </div>`;
  },
  bind: app => {
    app.querySelectorAll('[data-f]').forEach(b => (b.onclick = () => refresh({ f: b.dataset.f })));
    app.querySelectorAll('[data-n]').forEach(b => (b.onclick = () => {
      const s = store.get(); const n = s.notis.find(x => x.id === b.dataset.n);
      n.read = true; store.save();
      if (n.type === '질문') go('oneq', {}, { reset: true });
      else if (n.type === '복습') go('practiceHub', {}, { reset: true });
      else refresh();
    }));
  },
  leave: () => { const s = store.get(); s.notis.forEach(n => (n.read = true)); store.save(); },
};
