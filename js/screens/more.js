// 4. 포트폴리오 · 5. 설정 (테스트 메뉴 포함)
import { sb, hd, bk, ic, ch, esc, tabs, toast, confirmBox } from '../ui.js';
import { go, refresh } from '../router.js';
import * as store from '../data/store.js';
import { sync } from '../data/sync.js';
import { sampleState } from '../data/sample.js';
import { addDays, md, dot, mdw, timeKo } from '../core/date.js';

const soon = () => toast('편집은 다음 버전에서 열려요');
const pcard = (go_, t, s, c) => `<button class="card row" style="padding:18px;gap:14px" data-go="${go_}"><div style="width:76px;display:flex;justify-content:center;flex:none"><img src="img/char/${c}.png" alt="" style="height:74px"></div>
  <div style="flex:1"><div style="font-size:17px;font-weight:700">${t}</div><div class="sub" style="margin-top:5px;line-height:1.5">${s}</div></div>${ic('arrow', 20, 2)}</button>`;

export const portfolio = {
  render: () => {
    const s = store.get();
    const nExp = (s.portfolio?.main.length || 0) + (s.portfolio?.etc.length || 0);
    return `${sb()}${hd('doc', '이력서 · 포트폴리오')}<div class="ct">
    <div class="h2" style="margin:8px 0 12px">나의 이력서</div>${pcard('resume', '이력서', `이름, 나이, 학력, 경력 등<br>${s.resume ? '마지막 수정 ' + md(s.resume.updated) : '아직 비어 있어요'}`, 'front')}
    <div class="h2" style="margin:28px 0 12px">나의 포트폴리오</div>${pcard('folio', '포트폴리오', `자기소개, 경험 사항 등<br>${nExp ? `경험 ${nExp}개 정리됨` : '아직 비어 있어요'}`, 'happy')}
    <div class="card" style="margin-top:28px;background:var(--bg3);padding:16px"><div style="font-size:14px;font-weight:600">정리한 경험은 한 질문과 면접 연습으로 이어져요</div><div class="sub" style="margin-top:6px">경험을 하나 더하면 관련 질문을 만들어 드려요.</div></div>
    </div>${tabs(3)}`;
  },
};

const sec = (t, body, first) => `<div style="margin-top:${first ? 4 : 22}px"><div class="row between"><div style="font-size:15px;font-weight:700">${t}</div><button class="mute" data-soon>편집</button></div><div style="margin-top:10px">${body}</div></div>`;
const kv = (k, v) => `<div class="row" style="font-size:14px;padding:4px 0;gap:0"><span style="width:62px;color:var(--g3);flex:none">${k}</span><span>${esc(v)}</span></div>`;
const item = x => `<div class="card" style="padding:13px 14px;margin-bottom:8px"><div class="row between"><b style="font-size:14.5px">${esc(x.t)}</b><span class="mute">${esc(x.d)}</span></div><div class="sub" style="margin-top:4px">${esc(x.s)}</div></div>`;
const emptyBox = '<div class="sub" style="padding:8px 0">아직 비어 있어요.</div>';

export const resume = {
  render: () => {
    const s = store.get(); const p = s.profile || {}; const r = s.resume;
    return `${sb()}${bk('이력서', `<button data-soon>${ic('more')}</button>`)}<div class="ct">
    <div class="row" style="gap:16px;align-items:flex-start"><div class="ph" style="width:96px;height:124px">${ic('user', 36, 1.4)}</div><div style="flex:1;min-width:0">
      <div style="font-size:20px;font-weight:800;margin-bottom:6px">${esc(p.name)}</div>${kv('생년월일', dot(p.birth || ''))}${r ? kv('이메일', r.email) + kv('연락처', r.phone) + kv('주소', r.address) : ''}</div></div>
    ${sec('학력', r ? r.education.map(item).join('') : item({ t: `${p.school || ''} ${p.major || ''}`, s: `${p.grade || ''} 재학`, d: '' }))}
    ${sec('경력 · 경험 사항', r ? r.experience.map(item).join('') : emptyBox)}
    ${sec('자격 · 수상 · 어학', r ? `<div class="row" style="gap:6px;flex-wrap:wrap">${r.certs.map(c => `<span class="tag line" style="font-size:13px;padding:6px 10px">${esc(c)}</span>`).join('')}</div>` : emptyBox)}
    ${sec('보유 스킬', r ? `<div class="row" style="gap:6px;flex-wrap:wrap">${r.skills.map(c => `<span class="tag" style="font-size:13px;padding:6px 10px">${esc(c)}</span>`).join('')}</div>` : emptyBox)}
    </div>`;
  },
  bind: app => app.querySelectorAll('[data-soon]').forEach(b => (b.onclick = soon)),
};

export const folio = {
  render: () => {
    const f = store.get().portfolio;
    return `${sb()}${bk('포트폴리오', `<button data-soon>${ic('more')}</button>`)}<div class="ct">
    ${sec('자기소개', `<div class="row" style="gap:14px;align-items:flex-start"><div class="ph" style="width:64px;height:64px;border-radius:50%">${ic('user', 28, 1.4)}</div><div style="flex:1;font-size:14.5px;line-height:1.65;color:var(--g1)">${f ? esc(f.intro) : '아직 비어 있어요.'}</div></div>`, true)}
    ${sec('주요 경험', f ? f.main.map(item).join('') : emptyBox)}
    ${sec('기타 활동', f ? f.etc.map(item).join('') : emptyBox)}
    ${sec('사진', `<div class="row" style="gap:8px">${[0, 1, 2].map(() => `<div class="ph" style="flex:1;height:90px">${ic('img', 26, 1.4)}</div>`).join('')}</div>`)}
    </div>`;
  },
  bind: app => app.querySelectorAll('[data-soon]').forEach(b => (b.onclick = soon)),
};

// 설정
let taps = 0;
const srow = (t, r, last) => `<div class="row between" style="padding:15px 0;${last ? '' : 'border-bottom:1px solid var(--line);'}font-size:15px"><span>${t}</span>${r}</div>`;
const tg = (key, on) => `<button class="toggle ${on ? '' : 'off'}" data-tg="${key}" aria-label="켜기/끄기"></button>`;

export const settings = {
  render: () => {
    const s = store.get(); const p = s.profile || {}; const st = s.settings; const t = store.today();
    const test = st.testMenu ? `<div class="lab" style="margin-top:22px">테스트 메뉴 <span class="mute" style="font-weight:400">시연·확인용</span></div>
    <div class="card" style="padding:16px;background:var(--bg3)">
      <div class="sub">앱 속 오늘: <b style="color:var(--k)">${mdw(t)}</b>${st.todayOverride ? '' : ' (실제 날짜)'}</div>
      <div class="stack" style="margin-top:12px;gap:8px">
        <button class="btn p" style="height:46px;font-size:15px" data-t="sample">예시 데이터 불러오기 (김하루)</button>
        <div class="row" style="gap:8px"><button class="btn o" style="height:46px;font-size:15px;background:#fff" data-t="next">하루 넘기기</button><button class="btn o" style="height:46px;font-size:15px;background:#fff" data-t="real">실제 날짜로</button></div>
        <div class="row between" style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:0 14px;height:46px;font-size:15px"><span>녹화용 마우스 숨기기</span>${tg('hideCursor', st.hideCursor)}</div>
        <button class="btn s" style="height:46px;font-size:15px" data-t="reset">처음 상태로 (모두 지우기)</button>
        <button class="mute" style="margin-top:2px" data-t="hide">테스트 메뉴 숨기기</button></div></div>` : '';
    return `${sb()}${hd('gear', '설정')}<div class="ct">
    <div class="lab" style="margin-top:4px">내 정보</div>
    <div class="card row" style="gap:14px;padding:16px"><div style="width:62px;display:flex;justify-content:center;flex:none"><img src="img/char/front.png" alt="" style="height:66px"></div>
      <div style="flex:1;min-width:0"><div style="font-size:17px;font-weight:700">${esc(p.name || '이름 없음')}</div><div class="sub" style="margin-top:4px">${esc([p.school, [p.major, p.grade].filter(Boolean).join(' ')].filter(Boolean).join(' · '))}</div><div class="sub" style="margin-top:2px">관심 분야 · ${esc(p.interest || '아직 없음')}</div></div>
      <button class="chip" style="height:30px" data-edit>수정</button></div>
    <div class="lab" style="margin-top:22px">알림 설정</div>
    <div class="card" style="padding:0 16px">${srow('오늘의 한 질문', tg('dailyQ', st.dailyQ))}
      ${srow('연습 알림 시간', `<label class="row" style="gap:2px;color:var(--g2);position:relative;cursor:pointer">${timeKo(st.practiceTime)}${ic('right', 18)}<input type="time" data-time value="${st.practiceTime}" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>`)}
      ${srow('일정 다음 날 한 질문 받기', tg('nextDayQ', st.nextDayQ), true)}</div>
    <div class="lab" style="margin-top:22px">앱 정보</div>
    <div class="card" style="padding:0 16px">${srow('버전', '<button class="mute" style="font-size:14px" data-ver>1.0.0</button>')}${srow('이용약관 · 개인정보 처리방침', `<button data-soon2>${ic('right', 18)}</button>`, true)}</div>
    ${test}
    <div class="row" style="gap:18px;margin:22px 0 10px;font-size:14px;color:var(--g2);justify-content:center"><button data-soon2>계정 관리</button><span style="color:var(--g4)">|</span><button data-logout>로그아웃</button></div>
    </div>${tabs(4)}`;
  },
  bind: app => {
    const s = store.get();
    app.querySelector('[data-edit]').onclick = () => go('profileForm', { edit: true });
    app.querySelectorAll('[data-tg]').forEach(b => (b.onclick = () => {
      s.settings[b.dataset.tg] = !s.settings[b.dataset.tg]; store.save();
      document.body.classList.toggle('nocursor', !!s.settings.hideCursor);
      if (b.dataset.tg === 'hideCursor') toast(s.settings.hideCursor ? '앱 위에서는 마우스가 안 보여요' : '마우스가 다시 보여요');
      refresh();
    }));
    app.querySelector('[data-time]').onchange = e => { if (e.target.value) { s.settings.practiceTime = e.target.value; store.save(); refresh(); } };
    app.querySelectorAll('[data-soon2]').forEach(b => (b.onclick = () => toast('시연용 앱에서는 아직 준비 중이에요')));
    app.querySelector('[data-ver]').onclick = () => {
      if (++taps >= 5) { taps = 0; s.settings.testMenu = true; store.save(); refresh(); toast('테스트 메뉴가 열렸어요'); }
    };
    app.querySelector('[data-logout]').onclick = () => confirmBox('로그아웃할까요?', '기록은 이 기기에 그대로 남아 있어요.', '로그아웃', () => {
      s.loggedIn = false; store.save(); go('login', {}, { reset: true });
    });
    app.querySelectorAll('[data-t]').forEach(b => (b.onclick = () => {
      const k = b.dataset.t;
      if (k === 'sample') return confirmBox('예시 데이터를 불러올까요?', '지금 기록은 지워지고 김하루의 예시 기록으로 바뀌어요. 오늘은 2026년 11월 20일이 돼요.', '불러오기', () => {
        store.replace(sampleState()); sync(); toast('예시 데이터를 불러왔어요'); go('home', {}, { reset: true });
      });
      if (k === 'next') { s.settings.todayOverride = addDays(store.today(), 1); store.save(); sync(); toast(`오늘이 ${md(store.today())}이 됐어요`); return refresh(); }
      if (k === 'real') { s.settings.todayOverride = null; store.save(); sync(); toast('실제 날짜로 돌아왔어요'); return refresh(); }
      if (k === 'hide') { s.settings.testMenu = false; store.save(); toast('버전을 5번 누르면 다시 보여요'); return refresh(); }
      if (k === 'reset') return confirmBox('처음 상태로 돌릴까요?', '이 기기에 저장된 기록이 모두 지워져요.', '모두 지우기', () => {
        store.reset(); go('intro', {}, { reset: true });
      });
    }));
  },
};
