// js/core/daily.js — 한 질문 만들기, 대화 흐름, 면접 질문으로 바꾸기, 키워드 뽑기, AI tip
// (진짜 AI 대신 정해 둔 문장으로 움직여요. 나중에 AI를 붙일 때 이 파일만 바꾸면 돼요.)
import { addDays, md } from './date.js';
import { blank, todayList } from './schedule.js';

export const CATS = ['수업', '동아리', '대외활동', '아르바이트'];

const TPL = {
  수업: ['어제 {t}에서 맡은 역할은 무엇이었나요?', '어제 {t}에서 새롭게 알게 된 점은 무엇인가요?'],
  동아리: ['어제 {t}에서 다른 사람과 의견이 달랐던 순간이 있었나요?', '어제 {t}에서 내가 맡은 일은 무엇이었나요?'],
  대외활동: ['어제 {t}에서 새롭게 알게 된 점은 무엇인가요?', '어제 {t}에서 가장 어려웠던 순간은 언제였나요?'],
  아르바이트: ['어제 {t}에서 가장 기억에 남는 일은 무엇이었나요?', '어제 {t}에서 스스로 바꿔 본 것이 있나요?'],
};
const ANY = ['어제 {t}에서 가장 기억에 남는 일은 무엇이었나요?'];
const NO_EVENT = '이번 주에 가장 기억에 남는 일은 무엇이었나요?';

export const MSG = {
  follow: '좋아요. 추가 질문이 있어요!\n그때 구체적으로 어떻게 했나요?',
  askNow: '지금 답변할까요?',
  offerQ: '잘 정리했어요. 이 이야기를 면접 질문으로 만들어 학습하기에 넣어 둘까요?',
  madeQ: '학습하기에 넣어 두었어요. 면접 연습에서 익혀 보세요!',
  skipQ: '알겠어요. 오늘 이야기는 기록으로 남겨 둘게요.',
  later: '알겠어요. 생각나면 언제든 이어서 답해 주세요.',
};

// 오늘의 한 질문이 없으면 어제 일정으로 만들어요. 만들었으면 true
export function ensureDaily(s, today) {
  if (!s.loggedIn) return false;
  let made = false;
  if (s.settings.dailyQ && !s.records.some(r => r.date === today)) {
    const y = addDays(today, -1);
    const evs = s.settings.nextDayQ ? s.events.filter(e => e.date === y) : [];
    const ev = evs.find(e => e.memo) || evs[0];
    const n = s.records.length;
    const list = ev ? (TPL[ev.cat] || ANY) : null;
    const question = ev ? list[n % list.length].replace('{t}', ev.title) : NO_EVENT;
    s.records.unshift({
      id: 'r' + Date.now().toString(36), date: today,
      eventId: ev?.id || null, cat: ev?.cat || '기타', title: ev?.title || '오늘의 한 질문',
      question, answers: [], stage: 'ask',
      messages: [{ from: 'ai', text: question }],
    });
    pushNoti(s, { type: '질문', title: '오늘의 한 질문이 도착했어요', sub: question, date: today, time: '09:00' });
    made = true;
  }
  const due = todayList(s.questions, today, s.settings.maxPerDay).length;
  if (due && !s.notis.some(x => x.type === '복습' && x.date === today)) {
    pushNoti(s, { type: '복습', title: `오늘 말해 볼 질문이 ${due}개 있어요`, sub: '연습하기에서 바로 시작할 수 있어요', date: today, time: '08:00' });
  }
  return made;
}
function pushNoti(s, n) {
  s.notis.unshift({ id: 'n' + Date.now().toString(36) + s.notis.length, read: false, ...n });
}

// 한 질문 기록 → 면접 질문
export function questionFromRecord(rec, today) {
  const answer = rec.answers.join(' ');
  return {
    id: 'q' + Date.now().toString(36), cat: '경험',
    question: rec.eventId ? `${rec.title}에서 맡은 역할과 배운 점은 무엇인가요?` : '최근 가장 기억에 남는 경험과 배운 점은 무엇인가요?',
    answer, keywords: keywordsFrom(answer),
    source: `${md(rec.date)} 한 질문에서`, createdAt: today,
    ...blank(),
  };
}

// 답변에서 키워드 뽑기 (간단한 규칙: 조사·어미를 떼고 두 글자 이상 낱말 4개)
const END = /(했습니다|했어요|했고|해서|하고|하는|하며|했던|였어요|이었어요|입니다|이에요|예요|에서|에게|으로|부터|까지|처럼|보다|이라|라고|을|를|이|가|은|는|로|와|과|의|도|에|만|요|다|고)$/;
const STOP = new Set(['그리고', '그래서', '하지만', '그때', '제가', '저는', '저도', '정말', '너무', '많이', '조금', '이번', '그런', '어떤', '같은', '먼저', '하나', '모두', '가장', '것이', '때문', '생각']);
export function keywordsFrom(text) {
  const out = [];
  for (let w of String(text).replace(/[.,!?~"'()·]/g, ' ').split(/\s+/)) {
    w = w.replace(END, '').replace(END, '');
    if (w.length >= 2 && !STOP.has(w) && !out.includes(w)) out.push(w);
    if (out.length === 4) break;
  }
  return out;
}

// 학습하기 화면의 AI tip — 질문 종류별 대답 순서
export const TIPS = {
  경험: '맡은 역할 → 내가 한 행동 → 배운 점',
  인성: '결론 먼저 → 근거가 된 경험 → 앞으로의 다짐',
  '관심 분야': '관심 분야 → 계기가 된 경험 → 해 보고 싶은 일',
  기타: '결론 → 이유 → 예시',
};
export const QCATS = ['인성', '경험', '관심 분야', '기타'];
