// 3. 면접 연습 — 첫 화면, 학습하기(새 질문 익히기), 연습하기(간격 반복으로 말하기)
import { sb, hd, bk, ic, ch, esc, tabs, chips, toast, recBar } from '../ui.js';
import { go, back, refresh } from '../router.js';
import * as store from '../data/store.js';
import { sync } from '../data/sync.js';
import * as rec from '../core/recorder.js';
import { TIPS, QCATS } from '../core/daily.js';
import { learn, judge, todayList, plannedOn, needsReview, nextInterval, willGraduate, memoryPct, status } from '../core/schedule.js';
import { addDays, dayNum, md, daysBetween } from '../core/date.js';

// ---------- 공통 조각 ----------
const pill = k => `<span class="pill">${esc(k)}</span>`;
const newQuestions = () => store.get().questions.filter(q => !q.learnedAt).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
const learnedToday = () => store.get().questions.some(q => q.learnedAt === store.today() && q.history.length === 0);

export const prow = q => `<button class="listrow" style="padding:14px 0" data-q="${q.id}"><div style="flex:1;min-width:0">
  <div class="row" style="gap:6px"><span class="tag">${esc(q.cat)}</span><span class="mute">${q.learnedAt ? q.history.length + '회 연습' : '학습 전'}</span></div>
  <div style="font-size:15px;font-weight:600;margin-top:7px">${esc(q.question)}</div>
  <div class="row" style="gap:5px;margin-top:8px;flex-wrap:wrap">${q.keywords.slice(0, 3).map(pill).join('')}</div></div>
  <span class="circ o" style="width:34px;height:34px">${ic('right', 18)}</span></button>`;

// 오늘 기준 앞뒤 3일 줄. marks = 점을 진하게 찍을 날짜들
function timeline(sel, marks) {
  const t = store.today();
  const days = Array.from({ length: 7 }, (_, i) => addDays(t, i - 3));
  return `<div style="position:relative;margin:18px 0 18px;height:70px">
  <div style="position:absolute;left:4px;right:4px;top:22px;height:1.5px;background:var(--g4)"></div>
  <div class="row between" style="position:relative">${days.map(d => d === t
    ? `<button data-day="${d}" style="width:46px;height:46px;border-radius:50%;background:var(--k);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;${sel !== t ? 'box-shadow:0 0 0 3px #fff,0 0 0 4.5px var(--g4)' : ''}"><b style="font-size:15px">${dayNum(d)}</b><span style="font-size:10px">오늘</span></button>`
    : `<button data-day="${d}" style="display:flex;flex-direction:column;align-items:center;width:30px;gap:8px;padding-top:17px"><i style="width:11px;height:11px;border-radius:50%;background:${d === sel ? 'var(--k)' : '#fff'};border:1.5px solid ${marks.includes(d) || d === sel ? 'var(--k)' : 'var(--g4)'}"></i><span style="font-size:12px;color:${d === sel ? 'var(--k)' : 'var(--g3)'};font-weight:${d === sel ? 700 : 400}">${dayNum(d)}</span></button>`).join('')}</div></div>`;
}
const monthHead = () => { const [y, m] = store.today().split('-').map(Number); return `<div class="row" style="gap:4px;font-size:20px;font-weight:800">${y}년 ${m}월</div>`; };

const qhead = (title, n, tot) => `<div class="hd"><button class="bk" data-back>${ic('left', 26)}${title}</button><div class="row" style="gap:8px"><div class="dots">${Array.from({ length: tot }, (_, i) => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</div><span class="mute">${n + 1}/${tot}</span></div></div>`;

// 녹음 버튼 연결
let timer = null;
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
function stopRec() { rec.stop(); clearInterval(timer); timer = null; }
function bindRec(app, key, onNext) {
  app.querySelector('[data-rec]').onclick = async () => {
    if (rec.isRecording()) { stopRec(); refresh(); return; }
    try {
      await rec.start(key);
      refresh();
      timer = setInterval(() => { const el = document.querySelector('[data-timer]'); if (el && rec.isRecording()) el.innerHTML = `<span class="recdot"></span>녹음 중 ${fmt(rec.elapsed())}`; }, 500);
    } catch {
      toast('마이크를 쓸 수 없어요. 소리 내어 말한 뒤 다음을 눌러 주세요');
    }
  };
  app.querySelector('[data-redo]').onclick = () => { stopRec(); toast('처음부터 다시 말해 보세요'); refresh(); };
  app.querySelector('[data-next]').onclick = () => { stopRec(); setTimeout(onNext, 60); };
}
const recState = label => ({ recording: rec.isRecording(), sec: rec.elapsed(), label: rec.isRecording() ? '말 끝나면 누르기' : label });

// ---------- 3-0 면접 연습 첫 화면 ----------
const bigcard = (go_, t, s, c, dark) => `<button class="card" data-go="${go_}" style="flex:1;padding:16px;display:flex;flex-direction:column;align-items:center;text-align:center;${dark ? 'background:var(--k);color:#fff;border:none' : ''}">
  <div style="height:112px;display:flex;align-items:flex-end">${ch(c, 108)}</div><div style="font-size:17px;font-weight:700;margin-top:12px">${t}</div>
  <div style="font-size:12.5px;margin-top:4px;color:${dark ? '#aaa' : 'var(--g2)'}">${s}</div><div class="row" style="gap:4px;margin-top:12px;font-size:13px;font-weight:600">시작 ${ic('arrow', 16, 2)}</div></button>`;

export const practiceHub = {
  render: ({ f = '전체' }) => {
    sync();
    const s = store.get(); const t = store.today();
    const nNew = newQuestions().length;
    const learnSub = learnedToday() ? '오늘 학습 완료' : nNew ? '새 질문 1개' : '새 질문 없음';
    const due = todayList(s.questions, t, s.settings.maxPerDay).length;
    const list = s.questions.filter(q => !q.graduated && (f === '전체' || q.cat === f));
    return `${sb()}${hd('chat', '면접 연습')}<div class="ct">
    <div class="row" style="gap:10px;align-items:stretch">${bigcard('learnPick', '학습하기', learnSub, 'study', 1)}${bigcard('practicePick', '연습하기', due ? `오늘 말할 질문 ${due}개` : '오늘 연습 끝', 'jump')}</div>
    <div class="row between" style="margin:24px 0 12px"><div class="h2">면접 기록</div><button class="mute" data-go="records">전체 보기</button></div>
    ${chips(['전체', ...QCATS], f, 'f')}
    ${list.slice(0, 4).map(prow).join('') || '<div class="sub" style="padding:16px 0">이 분류에는 아직 질문이 없어요.</div>'}
    </div>${tabs(2)}`;
  },
  bind: app => {
    app.querySelectorAll('[data-f]').forEach(b => (b.onclick = () => refresh({ f: b.dataset.f })));
    app.querySelectorAll('[data-q]').forEach(b => (b.onclick = () => go('recordDetail', { id: b.dataset.q })));
  },
};

// ---------- 학습하기 ----------
export const learnPick = {
  render: ({ day }) => {
    const s = store.get(); const t = store.today(); day = day || t;
    const marks = s.questions.filter(q => q.learnedAt).map(q => q.learnedAt);
    const q = newQuestions()[0];
    let body, btn = '';
    if (day !== t) {
      const learned = s.questions.filter(x => x.learnedAt === day);
      body = learned.length
        ? `<div class="sub" style="margin-bottom:10px">${md(day)}에 익힌 질문</div><div class="stack">${learned.map(x => `<div class="card"><span class="tag">${esc(x.cat)}</span><div style="font-size:15px;font-weight:600;margin-top:8px">${esc(x.question)}</div></div>`).join('')}</div>`
        : `<div class="empty"><div class="s">${md(day)}에는 ${day < t ? '익힌 질문이 없어요.' : '아직 정해진 학습이 없어요.'}</div></div>`;
    } else if (learnedToday()) {
      body = `<div class="empty">${ch('happy', 150)}<div class="t">오늘 학습 카드를 익혔어요</div><div class="s">학습은 하루에 1개씩이에요.<br>내일 새 질문을 익혀 보세요.</div></div>`;
      btn = `<button class="btn p" data-go="practicePick">연습하기로 가기</button>`;
    } else if (!q) {
      body = `<div class="empty">${ch('curious', 150)}<div class="t">새 질문이 없어요</div><div class="s">한 질문에 답하거나<br>직접 면접 질문을 추가해 보세요.</div></div>`;
      btn = `<button class="btn p" data-go="qEdit">질문 직접 추가하기</button>`;
    } else {
      body = `<div class="card" style="padding:18px"><div class="row between"><span class="tag">${esc(q.cat)}</span><span class="mute">새 질문 · ${esc(q.source || '')}</span></div>
        <div style="font-size:17px;font-weight:700;margin-top:10px;line-height:1.45">${esc(q.question)}</div>
        <div class="row" style="gap:6px;margin-top:12px;flex-wrap:wrap">${q.keywords.map(pill).join('')}</div></div>
        <div class="sub" style="margin-top:20px;text-align:center">오늘 새로 익힐 학습 카드 1개</div>`;
      btn = `<button class="btn p" data-start="${q.id}">학습 시작하기</button>`;
    }
    return `${sb()}${bk('학습하기')}<div class="ct">${monthHead()}${timeline(day, marks)}${body}</div>${btn ? `<div class="bottom">${btn}</div>` : ''}`;
  },
  bind: app => {
    app.querySelectorAll('[data-day]').forEach(b => (b.onclick = () => refresh({ day: b.dataset.day })));
    app.querySelector('[data-start]')?.addEventListener('click', e => go('learnRead', { id: e.currentTarget.dataset.start }));
  },
};

export const learnRead = {
  render: ({ id }) => {
    const q = store.question(id);
    return `${sb()}${qhead('학습하기', 0, 1)}<div class="ct">
    <div class="ql">Q.</div><div class="q">${esc(q.question)}</div>
    <div style="display:flex;justify-content:center;margin:10px 0 8px">${ch('study', 120)}</div>
    <div style="margin:4px 0 16px"><span style="display:inline-block;background:var(--k);color:#fff;font-size:12px;font-weight:700;padding:3px 9px;border-radius:6px;margin-bottom:8px">AI tip</span>
    <div style="font-size:14.5px;line-height:1.65;text-align:justify;text-align-last:left">이런 질문에는 <b>${TIPS[q.cat] || TIPS['기타']}</b> 순서로 대답하면 좋아요!</div></div>
    <div class="ql">A.</div>
    ${q.answer ? `<div style="background:var(--bg3);border:1px solid var(--line);border-radius:14px;padding:16px;font-size:15.5px;line-height:1.75">${esc(q.answer)}</div>
    <div class="mute" style="margin-top:10px">소리 내어 두세 번 읽어 보세요</div>`
      : `<div style="border:1.5px dashed var(--g4);border-radius:14px;padding:22px;text-align:center;font-size:15px;color:var(--g3)">아직 답변이 없어요. 답변을 먼저 적어 주세요.</div>`}
    </div><div class="bottom" style="flex-direction:row"><button class="btn o" style="flex:1" data-edit>답변 ${q.answer ? '수정' : '쓰기'}</button><button class="btn p" style="flex:1.6" data-ok ${q.answer ? '' : 'disabled'}>다 읽었어요</button></div>`;
  },
  bind: (app, { id }) => {
    app.querySelector('[data-edit]').onclick = () => go('qEdit', { id });
    app.querySelector('[data-ok]').onclick = () => go('learnSpeak', { id, mode: '가리기' }, { replace: true });
  },
};

// 답변을 가리고 말하기. 키워드가 들어간 낱말과 마지막 낱말만 보여요
function masked(q) {
  const stems = q.keywords.map(k => k.split(' ')[0].replace(/(을|를|이|가|은|는)$/, '')).filter(Boolean);
  const words = q.answer.split(' ');
  return words.map((w, i) => (stems.some(k => w.includes(k)) || i === words.length - 1)
    ? `<b style="border-bottom:2px solid var(--k)">${esc(w)}</b>`
    : `<span style="display:inline-block;height:14px;width:${Math.min(w.length * 12, 120)}px;background:var(--g4);border-radius:4px;vertical-align:middle;opacity:.55"></span>`).join(' ');
}
export const learnSpeak = {
  render: ({ id, mode = '가리기' }) => {
    const q = store.question(id);
    const box = mode === '전체' ? esc(q.answer) : mode === '키워드'
      ? `<div class="row" style="flex-wrap:wrap;gap:8px">${q.keywords.map(k => `<span class="kw">${esc(k)}</span>`).join('')}</div>` : masked(q);
    return `${sb()}${qhead('학습하기', 0, 1)}<div class="ct">
    <div class="ql">Q.</div><div class="q">${esc(q.question)}</div>
    <div style="display:flex;justify-content:center;margin:14px 0 8px">${ch('curious', 120)}</div>
    <div class="row between" style="margin-bottom:8px"><div class="ql" style="margin:0">A.</div>
    <div class="seg">${['전체', '가리기', '키워드'].map(t => `<button class="${t === mode ? 'on' : ''}" data-mode="${t}">${t}</button>`).join('')}</div></div>
    <div style="border:1px solid var(--line);border-radius:14px;padding:16px;font-size:15.5px;line-height:2">${box}</div>
    <div class="mute" style="margin-top:10px">가린 부분을 떠올리며 소리 내어 말해 보세요</div>
    </div>${recBar({ ...recState('말하며 녹음'), nextLabel: '학습 끝' })}`;
  },
  bind: (app, { id }) => {
    app.querySelectorAll('[data-mode]').forEach(b => (b.onclick = () => refresh({ mode: b.dataset.mode })));
    bindRec(app, id, () => {
      const q = store.question(id);
      store.updateQuestion(learn(q, store.today()));
      go('learnDone', { id }, { replace: true });
    });
  },
  leave: stopRec,
};

const doneScreen = (c, t, s, btns) => `${sb()}<div class="hd"><span></span><button data-close aria-label="닫기">${ic('x')}</button></div>
  <div class="ct" style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:40px">
  ${ch(c, 200)}<div style="font-size:28px;font-weight:800;margin-top:28px">${t}</div><div style="font-size:15.5px;color:var(--g2);line-height:1.65;margin-top:10px">${s}</div></div><div class="bottom">${btns}</div>`;

export const learnDone = {
  render: () => {
    const due = todayList(store.get().questions, store.today(), store.get().settings.maxPerDay).length;
    return doneScreen('happy', '학습 완료!', '오늘 새 질문 1개를 익혔어요.<br>내일부터 연습하기에 나와요.',
      `${due ? `<button class="btn p" data-go="practicePick">오늘 연습하기 (${due}개) ${ic('arrow', 18, 2)}</button>` : ''}<button class="btn ${due ? 'o' : 'p'}" data-end>종료하기</button>`);
  },
  bind: app => {
    const end = () => go('practiceHub', {}, { reset: true });
    app.querySelector('[data-close]').onclick = end;
    app.querySelector('[data-end]').onclick = end;
  },
};

// ---------- 연습하기 ----------
function practiceSub(q) {
  const t = store.today();
  const n = q.history.length + 1;
  if (!q.history.length) return `첫 연습 · ${q.learnedAt === addDays(t, -1) ? '어제 배움' : md(q.learnedAt) + ' 배움'}`;
  return `${n}번째 연습 · 지난 간격 ${q.interval}일${q.nextDate < t ? ` · ${daysBetween(q.nextDate, t)}일 밀림` : ''}`;
}
const lcard = (i, q, sub) => `<button class="card row" style="padding:15px 16px;gap:12px" data-q="${q.id}"><span class="circ" style="width:30px;height:30px;background:var(--bg2);font-weight:700;font-size:14px">${i}</span>
  <div style="flex:1;min-width:0"><span class="tag">${esc(q.cat)}</span>${needsReview(q) ? ' <span class="tag line">답 먼저 보기</span>' : ''}<div style="font-size:15px;font-weight:600;margin-top:7px">${esc(q.question)}</div><div class="mute" style="margin-top:4px">${sub}</div></div>${ic('right', 18)}</button>`;

export const practicePick = {
  render: ({ day }) => {
    const s = store.get(); const t = store.today(); day = day || t;
    const list = todayList(s.questions, t, s.settings.maxPerDay);
    const marks = [...new Set(s.questions.flatMap(q => [q.nextDate, ...q.history.map(h => h.date)]).filter(Boolean))];
    let body, btn = '';
    if (day > t) {
      const plan = plannedOn(s.questions, day);
      body = plan.length ? `<div class="sub" style="margin-bottom:10px">${md(day)}에 말할 예정인 질문</div><div class="stack">${plan.map((q, i) => lcard(i + 1, q, practiceSub(q))).join('')}</div>`
        : `<div class="empty"><div class="s">${md(day)}에는 정해진 연습이 없어요.</div></div>`;
    } else if (day < t) {
      const done = s.questions.flatMap(q => q.history.filter(h => h.date === day).map(h => ({ q, h })));
      body = done.length ? `<div class="sub" style="margin-bottom:10px">${md(day)}에 말한 질문</div><div class="stack">${done.map(({ q, h }, i) => lcard(i + 1, q, h.result === 'good' ? '잘 말했어요' : '막혔어요')).join('')}</div>`
        : `<div class="empty"><div class="s">${md(day)}에는 연습한 질문이 없어요.</div></div>`;
    } else if (list.length) {
      body = `<div class="stack">${list.map((q, i) => lcard(i + 1, q, practiceSub(q))).join('')}</div>
        <div class="sub" style="margin-top:20px;text-align:center">오늘 말해 볼 연습 카드 ${list.length}개 · 하루 최대 ${s.settings.maxPerDay}개</div>`;
      btn = `<button class="btn p" data-start>연습 시작하기</button>`;
    } else {
      const next = s.questions.filter(q => q.learnedAt && !q.graduated && q.nextDate > t).sort((a, b) => a.nextDate.localeCompare(b.nextDate))[0];
      body = `<div class="empty">${ch('jump', 150)}<div class="t">오늘 말할 질문을 다 말했어요</div><div class="s">${next ? `다음 연습은 ${md(next.nextDate)}이에요.` : '학습하기에서 새 질문을 익히면<br>다음 날부터 여기에 나와요.'}</div></div>`;
    }
    return `${sb()}${bk('연습하기')}<div class="ct">${monthHead()}${timeline(day, marks)}${body}</div>${btn ? `<div class="bottom">${btn}</div>` : ''}`;
  },
  bind: app => {
    const s = store.get();
    const ids = todayList(s.questions, store.today(), s.settings.maxPerDay).map(q => q.id);
    app.querySelectorAll('[data-day]').forEach(b => (b.onclick = () => refresh({ day: b.dataset.day })));
    app.querySelector('[data-start]')?.addEventListener('click', () => go('practiceRun', { ids, i: 0 }));
    app.querySelectorAll('[data-q]').forEach(b => (b.onclick = () => go('recordDetail', { id: b.dataset.q })));
  },
};

// 한 질문씩: (답 다시 보기) → 키워드 보고 말하기 → 키워드 없이 말하기 → 판정
export const practiceRun = {
  render: ({ ids, i, step }) => {
    const q = store.question(ids[i]);
    step = step || (needsReview(q) ? 'review' : 'kw');
    const head = qhead('연습하기', i, ids.length);
    const top = `<div class="ql">Q.</div><div class="q">${esc(q.question)}</div>`;
    if (step === 'review') return `${sb()}${head}<div class="ct">${top}
      <div style="display:flex;justify-content:center;margin:16px 0 10px">${ch('front', 130)}</div>
      <div class="card" style="background:var(--bg3);margin-bottom:12px"><b style="font-size:14.5px">두 번 연속 막혔어요</b><div class="sub" style="margin-top:4px">답을 한 번 소리 내어 읽고 말해 볼까요?</div></div>
      <div class="ql">A.</div><div style="border:1px solid var(--line);border-radius:14px;padding:16px;font-size:15.5px;line-height:1.75">${esc(q.answer)}</div>
      </div><div class="bottom"><button class="btn p" data-step="kw">다 읽었어요</button></div>`;
    if (step === 'kw') return `${sb()}${head}<div class="ct">${top}
      <div style="display:flex;justify-content:center;margin:20px 0 14px">${ch('jump', 160)}</div>
      <div class="ql">A. 키워드</div><div class="row" style="flex-wrap:wrap;gap:8px">${q.keywords.map(k => `<span class="kw">${esc(k)}</span>`).join('')}</div>
      <div class="mute" style="margin-top:12px">키워드만 보고 내 말로 이어 말해 보세요</div></div>${recBar(recState('눌러서 말하기'))}`;
    if (step === 'nokw') return `${sb()}${head}<div class="ct">${top}
      <div style="display:flex;justify-content:center;margin:20px 0 14px">${ch('curious', 160)}</div>
      <div class="ql">A.</div><div style="border:1.5px dashed var(--g4);border-radius:14px;height:108px;display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--g3)">이번엔 키워드 없이 말해 보세요</div>
      </div>${recBar(recState('눌러서 말하기'))}`;
    // 판정
    const goodTxt = willGraduate(q, 'good') ? '이 질문은 졸업해요' : `다음 연습 ${nextInterval(q, 'good')}일 뒤`;
    return `${sb()}${head}<div class="ct" style="display:flex;flex-direction:column">${top}
      <div style="display:flex;justify-content:center;margin:24px 0 10px">${ch('curious', 150)}</div>
      <div style="text-align:center;font-size:21px;font-weight:800">방금 어땠나요?</div>
      <div class="sub" style="text-align:center;margin-top:6px">스스로 골라 주세요. 다음 연습 날짜가 정해져요.</div>
      <div class="row" style="gap:10px;margin-top:24px;align-items:stretch">
        <button class="card" style="flex:1;text-align:center;padding:18px 10px;background:var(--k);color:#fff;border:none" data-j="good"><div style="font-size:17px;font-weight:700">잘 말했어요</div><div style="font-size:12.5px;color:#aaa;margin-top:6px">${goodTxt}</div></button>
        <button class="card" style="flex:1;text-align:center;padding:18px 10px" data-j="stuck"><div style="font-size:17px;font-weight:700">막혔어요</div><div class="mute" style="margin-top:6px;font-size:12.5px">다음 연습 ${nextInterval(q, 'stuck')}일 뒤</div></button></div>
      <button class="row" style="justify-content:center;gap:6px;margin-top:22px;font-size:14px;color:var(--g2)" data-listen>${ic('head', 18)} 방금 녹음 듣기</button></div>`;
  },
  bind: (app, { ids, i, step }) => {
    const q = store.question(ids[i]);
    step = step || (needsReview(q) ? 'review' : 'kw');
    app.querySelector('[data-step]')?.addEventListener('click', () => refresh({ step: 'kw' }));
    if (step === 'kw') bindRec(app, q.id, () => refresh({ step: 'nokw' }));
    if (step === 'nokw') bindRec(app, q.id, () => refresh({ step: 'judge' }));
    if (step === 'judge') {
      app.querySelector('[data-listen]').onclick = () => rec.play(q.id) || toast('이번 연습에서 녹음한 소리가 없어요');
      app.querySelectorAll('[data-j]').forEach(b => (b.onclick = () => {
        const updated = judge(q, b.dataset.j, store.today());
        store.updateQuestion(updated);
        if (updated.graduated) toast('축하해요! 이 질문은 졸업했어요');
        if (i + 1 < ids.length) go('practiceRun', { ids, i: i + 1 }, { replace: true });
        else go('practiceDone', { n: ids.length }, { replace: true });
      }));
    }
  },
  leave: stopRec,
};

export const practiceDone = {
  render: ({ n }) => doneScreen('jump', '연습 완료!', `오늘 말할 질문 ${n}개를 모두 말했어요.<br>다음 연습 날짜는 연습하기에 표시돼요.`,
    `<button class="btn p" data-home>홈으로 ${ic('arrow', 18, 2)}</button><button class="btn o" data-end>면접 연습으로</button>`),
  bind: app => {
    app.querySelector('[data-home]').onclick = () => go('home', {}, { reset: true });
    const end = () => go('practiceHub', {}, { reset: true });
    app.querySelector('[data-close]').onclick = end;
    app.querySelector('[data-end]').onclick = end;
  },
};
