// js/main.js — 앱 시작점. 화면을 등록하고 첫 화면을 띄워요.
import { register, go, back } from './router.js';
import * as store from './data/store.js';
import { sync } from './data/sync.js';
import * as onboarding from './screens/onboarding.js';
import * as home from './screens/home.js';
import * as oneq from './screens/oneq.js';
import * as practice from './screens/practice.js';
import * as records from './screens/records.js';
import * as more from './screens/more.js';

const { prow, ...practiceScreens } = practice;
const { catStyle, allCats, ...homeScreens } = home;
register({ ...onboarding, ...homeScreens, ...oneq, ...practiceScreens, ...records, ...more });

// 여러 화면에서 같이 쓰는 버튼: data-back(뒤로), data-tab(아래 탭), data-go(화면 이동)
document.getElementById('app').addEventListener('click', e => {
  const el = e.target.closest('[data-back],[data-tab],[data-go]');
  if (!el) return;
  if (el.hasAttribute('data-back')) back();
  else if (el.dataset.tab) go(el.dataset.tab, {}, { reset: true });
  else go(el.dataset.go);
});

const s = store.get();
document.body.classList.toggle('nocursor', !!s.settings.hideCursor);
if (s.loggedIn) { sync(); go('home', {}, { reset: true }); }
else go(s.profile ? 'login' : 'intro', {}, { reset: true });
