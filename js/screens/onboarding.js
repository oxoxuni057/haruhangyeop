// 0. 시작 — 소개, 로그인, 기본 정보, 튜토리얼
import { sb, bk, ic, ch, esc, toast } from '../ui.js';
import { go, refresh } from '../router.js';
import * as store from '../data/store.js';

const INTRO = [
  ['happy', '하루한겹', '대학 생활의 경험을 하루에 한 겹씩.<br>쌓인 경험이 면접에서 말할<br>내 이야기가 돼요.'],
  ['front', '어제 한 일을 물어봐요', '달력에 적은 수업·동아리·활동을<br>다음 날 한 질문으로 꺼내 드려요.'],
  ['jump', '말로 연습해요', '답변을 익히고, 잊을 때쯤 다시 말해 보며<br>내 이야기를 오래 기억해요.'],
];
const dots = (n, i) => `<div class="dots">${Array.from({ length: n }, (_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>`;

export const intro = {
  render: ({ i = 0 }) => {
    const [c, t, s] = INTRO[i];
    return `${sb()}<div class="ct" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding-bottom:60px">
    ${ch(c, 230)}
    <div style="font-size:${i ? 26 : 30}px;font-weight:800;margin-top:40px">${t}</div>
    <div style="font-size:16px;color:var(--g2);line-height:1.7;margin-top:14px">${s}</div></div>
    <div style="padding:0 24px 40px;display:flex;justify-content:space-between;align-items:center">${dots(3, i)}
    <button class="circ p" style="width:58px;height:58px" data-next aria-label="다음">${ic('arrow', 26)}</button></div>`;
  },
  bind: (app, { i = 0 }) => {
    app.querySelector('[data-next]').onclick = () => (i < 2 ? refresh({ i: i + 1 }) : go('login'));
  },
};

export const login = {
  render: () => `${sb()}<div class="ct" style="padding-top:90px">
    <div style="font-size:28px;font-weight:800;text-align:center;margin-bottom:44px">로그인</div>
    <div style="border:1px solid var(--line);border-radius:14px;overflow:hidden">
      <input class="inp" style="border:0;border-bottom:1px solid var(--line);border-radius:0;height:56px" placeholder="아이디 (이메일)" autocomplete="username">
      <input class="inp" style="border:0;border-radius:0;height:56px" type="password" placeholder="비밀번호" autocomplete="current-password"></div>
    <button class="btn p" style="margin-top:20px" data-login>로그인</button>
    <div class="row" style="justify-content:center;gap:16px;margin-top:22px;font-size:14px;color:var(--g2)">
      <button data-soon>아이디 찾기</button><span style="color:var(--g4)">|</span><button data-soon>비밀번호 찾기</button><span style="color:var(--g4)">|</span>
      <button style="color:var(--k);font-weight:600" data-join>회원가입</button></div>
    <div class="mute" style="text-align:center;margin-top:30px;line-height:1.6">시연용 앱이라 아무 값이나 넣어도 들어가져요.</div>
  </div>`,
  bind: app => {
    const s = store.get();
    app.querySelector('[data-login]').onclick = () => {
      if (!s.profile) return go('profileForm');
      s.loggedIn = true; store.save(); go('home', {}, { reset: true });
    };
    app.querySelector('[data-join]').onclick = () => go('profileForm');
    app.querySelectorAll('[data-soon]').forEach(b => (b.onclick = () => toast('시연용 앱에서는 아직 준비 중이에요')));
  },
};

// 기본 정보 입력 (처음 가입할 때, 설정에서 수정할 때 같이 써요)
const GRADES = ['1학년', '2학년', '3학년', '4학년', '졸업 유예'];
const INTERESTS = ['마케팅', '경영·기획', '회계·재무', '인사', '영업', 'IT·개발', '디자인', '공공·교육', '아직 모르겠어요'];
let draftGender = null;
export const profileForm = {
  render: ({ edit }) => {
    const p = store.get().profile || {};
    const g = draftGender ?? p.gender ?? '선택 안 함';
    const opt = (list, v, ph) => `<option value="" ${v ? '' : 'selected'} disabled>${ph}</option>` + list.map(x => `<option ${x === v ? 'selected' : ''}>${x}</option>`).join('');
    return `${sb()}${bk('')}<div class="ct" style="padding-top:0">
    <div style="font-size:24px;font-weight:800;line-height:1.35">${edit ? '내 정보를<br>고쳐 주세요' : '기본 정보를<br>알려 주세요'}</div>
    <div class="sub" style="margin-top:8px">한 질문을 고를 때 참고해요.</div>
    <div class="lab">이름</div><input class="inp" name="name" placeholder="이름을 입력해 주세요" value="${esc(p.name)}">
    <div class="lab">생년월일</div><input class="inp" name="birth" type="date" value="${esc(p.birth || '2006-03-14')}">
    <div class="lab">성별</div><div class="row" style="gap:8px">${['여성', '남성', '선택 안 함'].map(x =>
      `<button class="chip ${x === g ? 'on' : ''}" data-g="${x}" style="flex:1;justify-content:center;height:46px;border-radius:12px">${x}</button>`).join('')}</div>
    <div class="row" style="gap:10px;align-items:flex-end"><div style="flex:1.4"><div class="lab">학교</div><input class="inp" name="school" placeholder="학교" value="${esc(p.school)}"></div>
      <div style="flex:1"><div class="lab">학년</div><select class="inp" name="grade">${opt(GRADES, p.grade, '학년')}</select></div></div>
    <div class="lab">전공</div><input class="inp" name="major" placeholder="전공을 입력해 주세요" value="${esc(p.major)}">
    <div class="lab">관심 분야</div><select class="inp" name="interest">${opt(INTERESTS, p.interest, '선택해 주세요 (나중에 바꿀 수 있어요)')}</select>
    </div><div class="bottom"><button class="btn p" data-save>${edit ? '저장' : '다음'}</button></div>`;
  },
  bind: (app, { edit }) => {
    app.querySelectorAll('[data-g]').forEach(b => (b.onclick = () => {
      draftGender = b.dataset.g;
      app.querySelectorAll('[data-g]').forEach(x => x.classList.toggle('on', x === b));
    }));
    app.querySelector('[data-save]').onclick = () => {
      const v = n => app.querySelector(`[name=${n}]`).value.trim();
      if (!v('name')) return toast('이름을 입력해 주세요');
      const s = store.get();
      s.profile = { name: v('name'), birth: v('birth'), gender: draftGender ?? s.profile?.gender ?? '선택 안 함', school: v('school'), grade: v('grade'), major: v('major'), interest: v('interest') };
      draftGender = null;
      store.save();
      if (edit) { toast('저장했어요'); go('settings', {}, { reset: true }); } else go('tutorial');
    };
  },
  leave: () => { draftGender = null; },
};

const TUT = [
  ['happy', '안녕하세요, 저는 한겹이에요', '홈 달력에 수업·동아리·활동을 적어 두면<br>다음 날 그 경험에 대해 물어봐요.', 'cal'],
  ['front', '하루에 한 질문', '어제 있었던 일을 대화하듯 답하면<br>면접 질문으로 만들어 드려요.'],
  ['study', '학습하기', '하루에 새 질문 1개를 익혀요.<br>답을 읽고, 가리고 말해 봐요.'],
  ['jump', '연습하기', '잊을 때쯤 다시 말해요. 잘 말하면 간격이 길어지고,<br>막히면 더 빨리 다시 나와요.'],
  ['wow', '포트폴리오', '쌓인 경험은 이력서와 포트폴리오로<br>정리할 수 있어요.'],
];
export const tutorial = {
  render: ({ i = 0 }) => {
    const [c, t, s, extra] = TUT[i];
    const cal = extra ? `<div class="card" style="width:100%;padding:20px;text-align:left;background:var(--bg3)">
      <div class="row between"><b style="font-size:15px">2026.11</b><span class="mute">홈 · 달력</span></div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px 0;margin-top:14px;font-size:12px;text-align:center;color:var(--g2)">${Array.from({ length: 14 }, (_, k) =>
        `<div>${k + 15}${[2, 5, 9].includes(k) ? '<div style="height:3px;width:16px;background:var(--k);margin:4px auto 0;border-radius:2px"></div>' : ''}</div>`).join('')}</div></div>` : '';
    return `${sb()}<div class="row between" style="padding:6px 24px 0">${dots(5, i)}<span class="mute">${i + 1} / 5</span></div>
    <div class="ct" style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:${extra ? 40 : 90}px">${cal}
    <div style="margin-top:${extra ? 36 : 0}px">${ch(c, 170)}</div>
    <div style="font-size:22px;font-weight:800;margin-top:20px">${t}</div>
    <div style="font-size:15px;color:var(--g2);line-height:1.65;margin-top:10px">${s}</div></div>
    <div style="padding:0 24px 40px;display:flex;justify-content:space-between;align-items:center">
    <button style="font-size:15px;color:var(--g2);font-weight:500" data-skip>건너뛰기</button>
    <button class="circ p" style="width:58px;height:58px" data-next aria-label="다음">${ic(i === 4 ? 'check' : 'arrow', 26)}</button></div>`;
  },
  bind: (app, { i = 0 }) => {
    const finish = () => { const s = store.get(); s.loggedIn = true; store.save(); go('home', {}, { reset: true }); };
    app.querySelector('[data-skip]').onclick = finish;
    app.querySelector('[data-next]').onclick = () => (i < 4 ? refresh({ i: i + 1 }) : finish());
  },
};
