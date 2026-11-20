// js/core/schedule.js — 복습 규칙(간격 반복). 화면·저장을 모르는 순수 함수만 있어요.
import { addDays } from './date.js';

export const GRADUATE_AFTER = 32; // 간격이 32일 이상일 때 잘 말하면 졸업

// 새 질문의 기본 상태
export const blank = () => ({ learnedAt: null, interval: 0, nextDate: null, stuckStreak: 0, graduated: false, history: [] });

// 학습하기를 마쳤을 때 → 첫 연습은 다음 날
export function learn(q, today) {
  return { ...q, ...blank(), learnedAt: today, interval: 1, nextDate: addDays(today, 1) };
}

// 판정 결과로 다음 간격 계산 (good = 잘 말했어요, stuck = 막혔어요)
export function nextInterval(q, result) {
  if (result === 'good') return q.interval * 2;
  return Math.max(1, Math.floor(q.interval / 2));
}
export const willGraduate = (q, result) => result === 'good' && q.interval >= GRADUATE_AFTER;

export function judge(q, result, today) {
  const history = [...q.history, { date: today, result, interval: q.interval }];
  if (willGraduate(q, result)) return { ...q, history, stuckStreak: 0, graduated: true, nextDate: null };
  const interval = nextInterval(q, result);
  return {
    ...q, history, interval,
    nextDate: addDays(today, interval),
    stuckStreak: result === 'stuck' ? q.stuckStreak + 1 : 0,
  };
}

// 오늘 연습할 질문: 날짜가 된 것 중 오래 밀린 순으로(같으면 많이 막힌 질문 먼저), 오늘 남은 개수만큼
export function todayList(questions, today, maxPerDay = 3) {
  const left = Math.max(0, maxPerDay - practicedCount(questions, today));
  return questions
    .filter(q => q.learnedAt && !q.graduated && q.nextDate <= today && !q.history.some(h => h.date === today))
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate) || b.stuckStreak - a.stuckStreak) // 밀린 순, 같으면 많이 막힌 순
    .slice(0, left);
}
// 그 날 연습하기로 정해진 질문 (미래 날짜 미리보기용)
export const plannedOn = (questions, date) =>
  questions.filter(q => q.learnedAt && !q.graduated && q.nextDate === date);

export const practicedCount = (questions, today) =>
  questions.reduce((s, q) => s + q.history.filter(h => h.date === today).length, 0);

// 두 번 연속 막히면 연습 전에 답을 한 번 다시 보여줘요
export const needsReview = q => q.stuckStreak >= 2;

// 답변을 고치면 외울 내용이 바뀐 것 → 처음부터 다시
export function editAnswer(q, fields) {
  return { ...q, ...fields, ...blank() };
}

// 기억도(%) — 간격이 길수록 오래 기억하고 있다는 뜻
export function memoryPct(q) {
  if (q.graduated) return 100;
  if (!q.learnedAt) return 0;
  const base = ((Math.log2(Math.max(1, q.interval)) + 1) / 6) * 100;
  return Math.max(5, Math.min(95, Math.round(base - q.stuckStreak * 10)));
}
export const status = q => (q.graduated ? '졸업' : q.learnedAt ? '진행 중' : '학습 전');
