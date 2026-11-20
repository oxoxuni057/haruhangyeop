// js/ui.js — 여러 화면에서 같이 쓰는 조각(아이콘, 머리줄, 탭바, 캐릭터, 팝업)
import * as store from './data/store.js';

export const I = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  q: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.4v.6"/><circle cx="12" cy="16.9" r=".6" fill="currentColor"/>',
  chat: '<path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-8.5L6 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z"/>',
  doc: '<path d="M6.5 3h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4.5h4.5M9 12h6.5M9 16h6.5"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.8 8.5 2.8 8.5H3.2S6 15 6 8.5"/><path d="M10.2 20.5a2 2 0 0 0 3.6 0"/>',
  left: '<path d="M15 18l-6-6 6-6"/>', right: '<path d="M9 18l6-6-6-6"/>', down: '<path d="M6 9l6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  mic: '<rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  redo: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/>',
  more: '<circle cx="12" cy="5.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="18.5" r="1.3" fill="currentColor" stroke="none"/>',
  head: '<path d="M3.5 14h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2v-7a8.5 8.5 0 0 1 17 0v7a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2.5"/>',
  img: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-9 8.5"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
};
export const ic = (n, s = 24, w) =>
  `<svg class="i" viewBox="0 0 24 24" style="width:${s}px;height:${s}px${w ? ';stroke-width:' + w : ''}">${I[n]}</svg>`;

// 캐릭터 한겹 (전신, 배경 없이)
export const ch = (n, h) => `<img class="char" src="img/char/${n}.png" alt="" style="height:${Math.round(h * 0.72)}px">`;

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// 상태 표시줄 (컴퓨터에서 볼 때만 보여요)
export function sb() {
  const d = new Date();
  return `<div class="sb"><span>${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}</span><span class="bat"></span></div>`;
}
export function bell() {
  const unread = store.get().notis.some(n => !n.read);
  return `<button class="bell ${unread ? 'dot' : ''}" data-go="notis" aria-label="알림">${ic('bell')}</button>`;
}
export const hd = (icon, title, right = bell()) =>
  `<div class="hd"><div class="t">${ic(icon, 24)}${title}</div>${right}</div>`;
export const bk = (title, right = '') =>
  `<div class="hd"><button class="bk" data-back>${ic('left', 26)}${esc(title)}</button>${right}</div>`;

const TABS = [['home', '홈', 'home'], ['q', '한 질문', 'oneq'], ['chat', '면접 연습', 'practiceHub'], ['doc', '포트폴리오', 'portfolio'], ['gear', '설정', 'settings']];
export const tabs = on =>
  `<nav class="tabs">${TABS.map(([i, t, go], k) =>
    `<button class="tab ${k === on ? 'on' : ''}" data-tab="${go}">${ic(i, 24, k === on ? 2 : 1.7)}<span>${t}</span></button>`).join('')}</nav>`;

// 칩 목록: chips(['전체','수업'], '전체', 'cat')  → data-cat="수업"
export const chips = (list, on, key) =>
  `<div class="chips">${list.map(c => `<button class="chip ${c === on ? 'on' : ''}" data-${key}="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;

// 아래에 잠깐 뜨는 안내
let tt;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(tt);
  tt = setTimeout(() => el.classList.remove('on'), 2200);
}

// 확인 창 (예/아니요). 고르면 ok() 실행
export function confirmBox(title, sub, okLabel, ok) {
  const app = document.getElementById('app');
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal"><div class="t">${esc(title)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}
    <div class="row" style="margin-top:20px"><button class="btn o" data-x>취소</button><button class="btn p" data-ok>${esc(okLabel)}</button></div></div>`;
  bg.addEventListener('click', e => {
    if (e.target === bg || e.target.closest('[data-x]')) bg.remove();
    if (e.target.closest('[data-ok]')) { bg.remove(); ok(); }
  });
  app.appendChild(bg);
}

// 녹음 버튼 줄 (학습하기·연습하기에서 같이 써요)
export function recBar({ recording, sec, label, nextLabel = '다음' }) {
  const t = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
  return `<div class="bottom" style="padding-top:4px">
  <div style="text-align:center;font-size:13px;font-weight:600;margin-bottom:6px;height:18px" data-timer>${recording ? `<span class="recdot"></span>녹음 중 ${t}` : ''}</div>
  <div class="row" style="justify-content:space-between;padding:0 6px">
    <button class="recbtn" data-redo><span class="circ o" style="width:52px;height:52px">${ic('redo', 22)}</span><span class="mute">다시 하기</span></button>
    <button class="recbtn" data-rec><span class="circ p ${recording ? 'on' : ''}" style="width:72px;height:72px">${recording ? '<span class="stop"></span>' : ic('mic', 30)}</span><span class="mute" style="color:var(--k);font-weight:600">${label}</span></button>
    <button class="recbtn" data-next><span class="circ o" style="width:52px;height:52px">${ic('play', 20)}</span><span class="mute">${nextLabel}</span></button>
  </div></div>`;
}

// 글 한 줄 입력 창. 확인하면 ok(입력한 글) 실행
export function inputBox(title, placeholder, okLabel, ok) {
  const app = document.getElementById('app');
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal"><div class="t">${esc(title)}</div>
    <input class="inp" id="box-input" style="margin-top:14px" maxlength="8" placeholder="${esc(placeholder)}">
    <div class="row" style="margin-top:16px"><button class="btn o" data-x>취소</button><button class="btn p" data-ok>${esc(okLabel)}</button></div></div>`;
  const input = bg.querySelector('input');
  const done = () => { const v = input.value.trim(); if (!v) return; bg.remove(); ok(v); };
  bg.addEventListener('click', e => {
    if (e.target === bg || e.target.closest('[data-x]')) bg.remove();
    if (e.target.closest('[data-ok]')) done();
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) done(); });
  app.appendChild(bg);
  input.focus();
}
