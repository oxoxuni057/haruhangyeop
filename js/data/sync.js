// js/data/sync.js — 화면을 열 때마다 '오늘'에 맞게 한 질문·알림을 채워요.
import * as store from './store.js';
import { ensureDaily } from '../core/daily.js';

export function sync() {
  const s = store.get();
  ensureDaily(s, store.today());
  store.save();
}
