// js/data/store.js — 저장은 이 파일만 담당해요 (브라우저 localStorage).
// 나중에 서버나 React로 바꿀 때 이 파일만 고치면 되도록 나눠 두었어요.
import { toStr } from '../core/date.js';

const KEY = 'hhg2';
export const DEFAULT_SETTINGS = {
  maxPerDay: 3,          // 하루 최대 연습 개수
  dailyQ: true,          // 오늘의 한 질문 받기
  nextDayQ: true,        // 일정 다음 날 그 일정으로 질문 받기
  practiceTime: '20:00', // 연습 알림 시간
  todayOverride: null,   // 테스트용 '오늘' 날짜
  testMenu: false,       // 테스트 메뉴 보이기
  hideCursor: false,     // 녹화용: 앱 위에서 마우스 숨기기
};
const empty = () => ({
  loggedIn: false, profile: null,
  events: [], records: [], questions: [], notis: [],
  resume: null, portfolio: null,
  settings: { ...DEFAULT_SETTINGS },
});

let state = null;
export function get() {
  if (!state) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
    state = { ...empty(), ...saved };
    state.settings = { ...DEFAULT_SETTINGS, ...saved.settings };
  }
  return state;
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장 공간이 막힌 경우 */ }
}
export function replace(next) { state = next; save(); }
export function reset() { state = empty(); save(); }

export const today = () => get().settings.todayOverride || toStr(new Date());
export const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// 자주 쓰는 찾기
export const question = id => get().questions.find(q => q.id === id);
export const record = id => get().records.find(r => r.id === id);
export function updateQuestion(q) {
  const s = get();
  s.questions = s.questions.map(x => (x.id === q.id ? q : x));
  save();
}
