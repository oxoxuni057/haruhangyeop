// js/core/date.js — 날짜 계산. 날짜는 '2026-11-20' 같은 글자로만 다뤄요.
export function toStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const parts = s => s.split('-').map(Number);

export function addDays(dateStr, n) {
  const [y, m, d] = parts(dateStr);
  return toStr(new Date(y, m - 1, d + n));
}
export function daysBetween(a, b) {
  const [y1, m1, d1] = parts(a), [y2, m2, d2] = parts(b);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
}
const WD = ['일', '월', '화', '수', '목', '금', '토'];
export const weekday = s => { const [y, m, d] = parts(s); return new Date(y, m - 1, d).getDay(); };
export const weekdayKo = s => WD[weekday(s)];
export const md = s => { const [, m, d] = parts(s); return `${m}월 ${d}일`; };          // 11월 20일
export const mdw = s => `${md(s)} ${weekdayKo(s)}요일`;                                 // 11월 20일 금요일
export const dot = s => s.replaceAll('-', '.');                                         // 2026.11.20
export const dotw = s => `${dot(s)} (${weekdayKo(s)})`;                                 // 2026.11.20 (금)
export const ymd = s => { const [y, m, d] = parts(s); return `${y}년 ${m}월 ${d}일`; };
export const monthOf = s => s.slice(0, 7);                                              // 2026-11
export const dayNum = s => parts(s)[2];

// '19:00' → '오후 7:00'
export function timeKo(t) {
  if (!t) return '하루 종일';
  const [h, m] = t.split(':').map(Number);
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
}
// 그 달의 모든 날 (앞뒤 빈칸은 null)
export function monthGrid(ym) {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const last = new Date(y, m, 0).getDate();
  const cells = Array(first).fill(null);
  for (let d = 1; d <= last; d++) cells.push(`${ym}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return toStr(d).slice(0, 7);
}
// 알림 시간 표시: 오늘이면 시각, 어제면 '어제', 그 전이면 '11월 17일'
export function when(dateStr, time, today) {
  if (dateStr === today) return timeKo(time);
  if (dateStr === addDays(today, -1)) return '어제';
  return md(dateStr);
}
