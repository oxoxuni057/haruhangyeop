// 3-3. 면접 기록 — 목록, 상세, 질문 추가·답변 수정
import { sb, bk, ic, esc, chips, toast, confirmBox } from '../ui.js';
import { go, back, refresh } from '../router.js';
import * as store from '../data/store.js';
import * as rec from '../core/recorder.js';
import { QCATS, keywordsFrom } from '../core/daily.js';
import { memoryPct, status, editAnswer, blank, todayList } from '../core/schedule.js';
import { md, dot } from '../core/date.js';

const stTag = st => `<span class="tag ${st === '졸업' ? 'dark' : 'line'}">${st}</span>`;
const hrow = q => {
  const pct = memoryPct(q);
  return `<button class="listrow" data-q="${q.id}"><div style="flex:1;min-width:0"><div class="row" style="gap:6px"><span class="tag">${esc(q.cat)}</span>${stTag(status(q))}</div>
  <div style="font-size:15px;font-weight:600;margin-top:8px">${esc(q.question)}</div>
  <div class="row" style="gap:8px;margin-top:8px"><span class="mute">${q.history.length}회 연습</span><div style="width:80px;height:5px;border-radius:3px;background:var(--bg2);overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--k)"></div></div><span class="mute">기억 ${pct}%</span></div></div>
  <span class="circ o" style="width:34px;height:34px">${ic('right', 18)}</span></button>`;
};

export const records = {
  render: ({ f = '전체' }) => {
    const s = store.get();
    const order = { '진행 중': 0, '학습 전': 1, '졸업': 2 };
    const list = s.questions
      .filter(q => f === '전체' || status(q) === f || q.cat === f)
      .sort((a, b) => order[status(a)] - order[status(b)]);
    return `${sb()}${bk('면접 기록', `<button data-go="qEdit" style="display:flex" aria-label="질문 추가">${ic('plus', 24, 2)}</button>`)}<div class="ct">
    <div style="margin-bottom:4px">${chips(['전체', '진행 중', '학습 전', '졸업', ...QCATS], f, 'f')}</div>
    ${list.map(hrow).join('') || '<div class="empty"><div class="s">질문이 없어요. 오른쪽 위 + 로 추가해 보세요.</div></div>'}
    </div>`;
  },
  bind: app => {
    app.querySelectorAll('[data-f]').forEach(b => (b.onclick = () => refresh({ f: b.dataset.f })));
    app.querySelectorAll('[data-q]').forEach(b => (b.onclick = () => go('recordDetail', { id: b.dataset.q })));
  },
};

const ring = (v, label, pct) => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px"><div style="width:86px;height:86px;border-radius:50%;background:conic-gradient(var(--k) ${pct * 3.6}deg,var(--bg2) 0);display:flex;align-items:center;justify-content:center">
  <div style="width:70px;height:70px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800">${v}</div></div><span class="sub">${label}</span></div>`;

export const recordDetail = {
  render: ({ id }) => {
    const q = store.question(id);
    if (!q) return `${sb()}${bk('')}<div class="ct"><div class="empty"><div class="s">지워진 질문이에요.</div></div></div>`;
    const st = status(q); const t = store.today();
    const next = st === '졸업' ? '졸업한 질문이에요' : st === '학습 전' ? '아직 학습 전이에요' : q.nextDate <= t ? '오늘 연습할 차례예요' : `다음 연습 ${md(q.nextDate)}`;
    const main = st === '졸업' ? ['relearn', '다시 학습하기'] : st === '학습 전' ? ['learn', '학습하기'] : ['practice', '이어서 연습하기'];
    return `${sb()}${bk('', `<button data-del aria-label="지우기">${ic('more')}</button>`)}<div class="ct">
    <div class="row" style="justify-content:center;gap:40px;margin:4px 0 22px">${ring(q.history.length + '회', '연습 횟수', Math.min(100, q.history.length * 10))}${ring(memoryPct(q) + '%', '기억도', memoryPct(q))}</div>
    <div class="row" style="gap:6px">${stTag(st)}<span class="tag">${esc(q.cat)}</span><span class="mute" style="margin-left:auto">${next}</span></div>
    <div class="ql" style="margin-top:14px">Q.</div><div class="q" style="font-size:19px">${esc(q.question)}</div>
    <div class="ql" style="margin-top:18px">A.</div><div style="font-size:15px;line-height:1.7;color:var(--g1)">${esc(q.answer) || '<span class="mute">아직 답변이 없어요</span>'}</div>
    <div class="ql" style="margin-top:18px">키워드</div><div class="row" style="flex-wrap:wrap;gap:8px">${q.keywords.map(k => `<span class="kw" style="height:32px;font-size:13.5px">${esc(k)}</span>`).join('')}</div>
    ${q.history.length ? `<div class="ql" style="margin-top:20px">연습 기록</div><div class="stack" style="gap:0">${q.history.slice().reverse().map(h =>
      `<div class="row between" style="padding:9px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${dot(h.date)}</span><span style="color:var(--g2)">간격 ${h.interval}일</span><b style="font-weight:${h.result === 'good' ? 700 : 500}">${h.result === 'good' ? '잘 말했어요' : '막혔어요'}</b></div>`).join('')}</div>` : ''}
    </div><div style="border-top:1px solid var(--line);padding:12px 16px 30px;display:flex;gap:8px">
    <button class="circ o" style="width:54px;height:54px;border-radius:14px" data-listen aria-label="녹음 듣기">${ic('head', 22)}</button>
    <button class="btn o" style="flex:1;height:54px" data-edit>답변 수정</button><button class="btn p" style="flex:1.3;height:54px" data-main="${main[0]}">${main[1]}</button></div>`;
  },
  bind: (app, { id }) => {
    const s = store.get(); const q = store.question(id);
    if (!q) return;
    app.querySelector('[data-listen]').onclick = () => rec.play(id) || toast('이번에 녹음한 소리가 없어요. 연습할 때 녹음해 보세요');
    app.querySelector('[data-edit]').onclick = () => go('qEdit', { id });
    app.querySelector('[data-main]').onclick = e => {
      const m = e.currentTarget.dataset.main; const t = store.today();
      if (m === 'learn') return go('learnRead', { id });
      if (m === 'relearn') return confirmBox('처음부터 다시 학습할까요?', '연습 간격이 처음(1일)으로 돌아가요.', '다시 학습', () => {
        store.updateQuestion({ ...q, ...blank() }); go('learnRead', { id });
      });
      if (q.nextDate > t) return toast(`다음 연습은 ${md(q.nextDate)}이에요. 그날 연습하기에 나와요`);
      if (!todayList(s.questions, t, 99).some(x => x.id === id)) return toast('오늘은 이미 연습했어요');
      go('practiceRun', { ids: [id], i: 0 });
    };
    app.querySelector('[data-del]').onclick = () => confirmBox('이 질문을 지울까요?', q.question, '지우기', () => {
      s.questions = s.questions.filter(x => x.id !== id); store.save(); toast('질문을 지웠어요'); back('records');
    });
  },
};

// 질문 추가 / 답변 수정
export const qEdit = {
  render: ({ id }) => {
    const q = id ? store.question(id) : { cat: '경험', question: '', answer: '', keywords: [] };
    return `${sb()}${bk(id ? '답변 수정' : '면접 질문 추가')}<div class="ct">
    <div class="lab" style="margin-top:4px">분류</div><div class="chips">${QCATS.map(c => `<button class="chip ${c === q.cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>
    <div class="lab">질문</div><textarea class="ta" name="question" style="height:76px" placeholder="예: 본인의 장점과 단점은 무엇인가요?">${esc(q.question)}</textarea>
    <div class="lab">내 답변</div><textarea class="ta" name="answer" style="height:170px" placeholder="면접에서 말할 답변을 적어 주세요">${esc(q.answer)}</textarea>
    <div class="row between"><div class="lab">키워드 <span class="mute" style="font-weight:400">쉼표(,)로 나눠요</span></div><button class="mute" style="text-decoration:underline" data-auto>답변에서 뽑기</button></div>
    <input class="inp" name="keywords" value="${esc(q.keywords.join(', '))}" placeholder="예: 책임감, 마감 지키기">
    ${id && q.learnedAt ? '<div class="mute" style="margin-top:12px;line-height:1.6">답변을 바꾸면 외울 내용이 달라지므로 학습하기부터 다시 시작해요.</div>' : ''}
    </div><div class="bottom"><button class="btn p" data-save>저장</button></div>`;
  },
  bind: (app, { id }) => {
    let cat = id ? store.question(id).cat : '경험';
    const v = n => app.querySelector(`[name=${n}]`);
    app.querySelectorAll('[data-cat]').forEach(b => (b.onclick = () => { cat = b.dataset.cat; app.querySelectorAll('[data-cat]').forEach(x => x.classList.toggle('on', x === b)); }));
    app.querySelector('[data-auto]').onclick = () => { v('keywords').value = keywordsFrom(v('answer').value).join(', '); };
    app.querySelector('[data-save]').onclick = () => {
      const question = v('question').value.trim(), answer = v('answer').value.trim();
      const keywords = v('keywords').value.split(',').map(x => x.trim()).filter(Boolean);
      if (!question) return toast('질문을 적어 주세요');
      if (!answer) return toast('답변을 적어 주세요');
      const s = store.get();
      if (id) {
        const q = store.question(id);
        const changed = q.answer !== answer || q.keywords.join() !== (keywords.length ? keywords : keywordsFrom(answer)).join();
        const fields = { cat, question, answer, keywords: keywords.length ? keywords : keywordsFrom(answer) };
        store.updateQuestion(changed && q.learnedAt ? editAnswer(q, fields) : { ...q, ...fields });
        toast(changed && q.learnedAt ? '저장했어요. 학습하기부터 다시 시작해요' : '저장했어요');
        back('records');
      } else {
        s.questions.push({ id: store.uid('q'), cat, question, answer, keywords: keywords.length ? keywords : keywordsFrom(answer), source: '직접 추가', createdAt: store.today(), ...blank() });
        store.save(); toast('학습하기에 새 질문을 넣었어요'); back('records');
      }
    };
  },
};
