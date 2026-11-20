// 2. 한 질문 — 오늘의 한 질문, 지난 기록, 대화로 답하기
import { sb, hd, bk, ic, esc, tabs, chips, toast, confirmBox } from '../ui.js';
import { go, back, refresh } from '../router.js';
import * as store from '../data/store.js';
import { sync } from '../data/sync.js';
import { MSG, questionFromRecord } from '../core/daily.js';
import { md, dot, ymd } from '../core/date.js';

const answered = r => r.answers.length > 0;
const rec = r => `<button class="card" style="padding:15px 16px" data-r="${r.id}">
  <div class="row between"><span class="tag">${esc(r.cat)}</span><span class="tag ${answered(r) ? 'dark' : 'line'}">${answered(r) ? '답변 완료' : '미답변'}</span></div>
  <div class="row" style="margin-top:9px"><div style="flex:1;min-width:0"><div style="font-size:15.5px;font-weight:700">${esc(r.title)}</div>
  <div class="sub" style="margin-top:4px">${esc(r.question)}</div><div class="mute" style="margin-top:6px">${dot(r.date)}</div></div>${ic('right', 20)}</div></button>`;

export const oneq = {
  render: ({ f = '전체' }) => {
    sync();
    const s = store.get(); const t = store.today();
    const todayRec = s.records.find(r => r.date === t);
    const past = s.records.filter(r => r.date !== t).sort((a, b) => b.date.localeCompare(a.date));
    const cats = ['전체', ...new Set(past.map(r => r.cat))];
    const shown = past.filter(r => f === '전체' || r.cat === f);
    const top = todayRec ? `<div class="card" style="background:var(--k);color:#fff;border:none;padding:20px">
      <div class="row between"><span style="font-size:13px;font-weight:600;color:#bbb">오늘의 한 질문</span><span style="font-size:12px;color:#999">${md(t)}</span></div>
      <span class="tag" style="background:#333;color:#eee;margin-top:14px">${esc(todayRec.cat)}${todayRec.eventId ? ' · ' + esc(todayRec.title) : ''}</span>
      <div style="font-size:19px;font-weight:700;line-height:1.45;margin-top:10px">${esc(todayRec.question)}</div>
      <button class="row" style="width:100%;justify-content:center;gap:6px;margin-top:18px;height:46px;border-radius:12px;background:#fff;color:var(--k);font-size:15px;font-weight:600" data-r="${todayRec.id}">
        ${todayRec.stage === 'done' ? '대화 다시 보기' : answered(todayRec) ? '이어서 답하기' : '질문 확인하기'} ${ic('arrow', 18, 2)}</button></div>`
      : `<div class="card" style="background:var(--bg3);padding:20px"><div class="h2">오늘의 한 질문이 꺼져 있어요</div><div class="sub" style="margin-top:6px">설정에서 '오늘의 한 질문'을 켜면 매일 하나씩 받아요.</div></div>`;
    return `${sb()}${hd('q', '한 질문')}<div class="ct">${top}
    <div class="row between" style="margin:26px 0 12px"><div class="h2">지난 기록</div><span class="mute">${past.length}개</span></div>
    ${past.length ? `<div style="margin-bottom:12px">${chips(cats, f, 'f')}</div>` : ''}
    <div class="stack">${shown.map(rec).join('') || '<div class="sub">아직 지난 기록이 없어요.</div>'}</div>
    </div>${tabs(1)}`;
  },
  bind: app => {
    app.querySelectorAll('[data-f]').forEach(b => (b.onclick = () => refresh({ f: b.dataset.f })));
    app.querySelectorAll('[data-r]').forEach(b => (b.onclick = () => go('oneqChat', { id: b.dataset.r })));
  },
};

// 대화 화면. stage: ask(첫 답 기다림) → offerFollow(추가 질문 예/아니요) → follow(추가 답 기다림) → offerQ(면접 질문 만들까요?) → done
const aiBubble = t => `<div class="row" style="align-items:flex-start;gap:8px"><div style="width:34px;flex:none;display:flex;justify-content:center"><img src="img/char/front.png" alt="" style="height:42px"></div>
  <div><div class="mute" style="margin-bottom:5px;font-weight:600">한겹 AI</div><div class="bub-ai">${esc(t)}</div></div></div>`;
const meBubble = t => `<div class="bub-me">${esc(t)}</div>`;
const yesNo = (sub) => `<div style="padding-left:42px"><div class="sub" style="margin-bottom:8px">${sub}</div><div class="row" style="gap:8px">
  <button class="chip on" style="height:36px;padding:0 20px" data-yes>예</button><button class="chip" style="height:36px;padding:0 16px" data-no>아니요</button></div></div>`;

let listening = null;
export const oneqChat = {
  render: ({ id }) => {
    const r = store.record(id);
    const typing = r.stage === 'ask' || r.stage === 'follow';
    const choice = r.stage === 'offerFollow' ? yesNo(MSG.askNow) : r.stage === 'offerQ' ? yesNo('학습하기에 넣을까요?') : '';
    return `${sb()}${bk(r.eventId ? r.title : '오늘의 한 질문', `<button data-del aria-label="기록 지우기">${ic('more')}</button>`)}
    <div class="ct" data-scroll>
      <div class="mute" style="text-align:center;margin:2px 0 16px">${ymd(r.date)} · ${esc(r.cat)}</div>
      <div class="stack" style="gap:16px">${r.messages.map(m => (m.from === 'ai' ? aiBubble(m.text) : meBubble(m.text))).join('')}${choice}</div>
    </div>
    <div style="padding:10px 14px 30px;border-top:1px solid var(--line)"><div class="row" style="gap:8px">
      <button class="circ o" style="width:42px;height:42px" data-plus aria-label="사진 추가">${ic('plus', 22)}</button>
      <input class="chatin" data-in placeholder="${typing ? '답변하기...' : r.stage === 'done' ? '대화가 끝났어요' : '위에서 골라 주세요'}" ${typing ? '' : 'disabled'} enterkeyhint="send">
      <button class="circ p" style="width:44px;height:44px" data-send aria-label="보내기">${ic('mic', 22)}</button></div></div>`;
  },
  bind: (app, { id }) => {
    const s = store.get(); const r = store.record(id);
    const sc = app.querySelector('[data-scroll]'); sc.scrollTop = sc.scrollHeight;
    const say = (from, text) => r.messages.push({ from, text });
    const inp = app.querySelector('[data-in]');
    const sendBtn = app.querySelector('[data-send]');
    const setIcon = () => { sendBtn.innerHTML = inp.value.trim() ? ic('send', 22, 2) : ic('mic', 22); };
    inp.oninput = setIcon;

    const submit = () => {
      const text = inp.value.trim();
      if (!text) return;
      say('me', text); r.answers.push(text);
      if (r.stage === 'ask') { say('ai', MSG.follow); r.stage = 'offerFollow'; }
      else { say('ai', MSG.offerQ); r.stage = 'offerQ'; }
      store.save(); refresh();
    };
    inp.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) submit(); };
    sendBtn.onclick = () => (inp.value.trim() ? submit() : dictate(inp, setIcon, r.stage));

    app.querySelector('[data-yes]')?.addEventListener('click', () => {
      say('me', '예');
      if (r.stage === 'offerFollow') { r.stage = 'follow'; say('ai', '좋아요, 편하게 말해 주세요.'); }
      else if (r.stage === 'offerQ') {
        const q = questionFromRecord(r, store.today()); s.questions.push(q);
        say('ai', MSG.madeQ); r.stage = 'done'; r.madeQ = q.id; toast('면접 연습 > 학습하기에 새 질문이 생겼어요');
      }
      store.save(); refresh();
    });
    app.querySelector('[data-no]')?.addEventListener('click', () => {
      say('me', '아니요');
      if (r.stage === 'offerFollow') { say('ai', MSG.offerQ); r.stage = 'offerQ'; }
      else { say('ai', MSG.skipQ); r.stage = 'done'; }
      store.save(); refresh();
    });
    app.querySelector('[data-plus]').onclick = () => toast('사진 첨부는 다음 버전에서 열려요');
    app.querySelector('[data-del]').onclick = () => confirmBox('이 기록을 지울까요?', r.question, '지우기', () => {
      s.records = s.records.filter(x => x.id !== r.id); store.save(); back('oneq');
    });
  },
  leave: () => { listening?.stop(); listening = null; },
};

// 말로 답하기 (브라우저 음성 인식이 있으면)
function dictate(inp, setIcon, stage) {
  if (stage !== 'ask' && stage !== 'follow') return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast('이 브라우저에서는 말로 입력할 수 없어요. 글로 적어 주세요');
  if (listening) { listening.stop(); return; }
  const sr = new SR(); sr.lang = 'ko-KR'; sr.interimResults = true;
  listening = sr;
  toast('듣고 있어요. 다 말하면 마이크를 다시 눌러 주세요');
  sr.onresult = e => { inp.value = [...e.results].map(x => x[0].transcript).join(''); setIcon(); };
  sr.onend = () => { listening = null; };
  sr.onerror = () => { listening = null; toast('마이크를 쓸 수 없어요. 글로 적어 주세요'); };
  sr.start();
}
