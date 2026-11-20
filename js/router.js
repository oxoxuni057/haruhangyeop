// js/router.js — 화면 전환. go('화면이름', {값}) 으로 이동, back() 으로 뒤로.
const screens = {};
let stack = [];
let cur = null;

export function register(map) { Object.assign(screens, map); }

export function go(name, props = {}, opt = {}) {
  if (!screens[name]) { console.error('없는 화면:', name); return; }
  if (opt.reset) stack = [];
  else if (cur && !opt.replace) stack.push(cur);
  show({ name, props });
}
export function back(fallback = 'home') {
  show(stack.pop() || { name: fallback, props: {} });
}
// 같은 화면을 값만 바꿔 다시 그리기
export function refresh(props = {}) {
  cur.props = { ...cur.props, ...props };
  show(cur, true);
}
export const current = () => cur;

function show(next, same = false) {
  const prev = cur && screens[cur.name];
  if (prev?.leave && !same) prev.leave();
  cur = next;
  const s = screens[cur.name];
  const app = document.getElementById('app');
  const keep = same ? app.querySelector('.ct')?.scrollTop : 0;
  app.innerHTML = s.render(cur.props);
  if (same && keep) { const ct = app.querySelector('.ct'); if (ct) ct.scrollTop = keep; }
  s.bind?.(app, cur.props);
}
