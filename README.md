# 하루한겹 앱 (피그마 디자인 기준, v2)

HTML + CSS + 순수 JavaScript로 만든 웹앱이에요. 서버와 진짜 로그인은 없고, 기록은 브라우저(localStorage)에만 저장돼요.

## 1. 맥에서 바로 열어 보기

`index.html`을 두 번 클릭하면 **안 열려요** (이 앱은 파일 여러 개를 나눠 불러오는 방식이라, 브라우저가 보안 때문에 막아요). 아래처럼 열어 주세요.

1. `Cmd + Space` → `터미널` 입력 → Enter
2. 아래 두 줄을 그대로 붙여 넣고 Enter (폴더 위치가 다르면 첫 줄의 경로만 바꿔 주세요)
   ```
   cd ~/Downloads/하루한겹_앱
   python3 -m http.server 8000
   ```
3. 크롬이나 사파리 주소창에 `http://localhost:8000` 입력
4. 끝낼 때는 터미널에서 `Ctrl + C`

## 2. 휴대폰에서 쓰기 (GitHub Pages)

1. github.com에서 새 저장소(Repository)를 만들어요. (Public)
2. 저장소 화면의 **Add file → Upload files**에 이 폴더 안의 파일·폴더를 전부 끌어다 놓고 **Commit changes**
3. **Settings → Pages → Branch: main / (root) → Save**
4. 1~2분 뒤 나오는 주소(`https://아이디.github.io/저장소이름/`)를 휴대폰으로 열고, 공유 버튼 → **홈 화면에 추가**

녹음과 말로 입력하기는 https 주소(GitHub Pages)나 localhost에서만 돼요.

## 3. 시연용 예시 데이터

설정 → 앱 정보의 **버전(1.0.0)을 5번** 누르면 테스트 메뉴가 열려요.

- **예시 데이터 불러오기**: 김하루(경영학과 2학년) 기록으로 바뀌고, 앱 속 오늘이 2026년 11월 20일이 돼요.
- **하루 넘기기**: 앱 속 날짜를 하루 뒤로. 다음 날 한 질문, 다음 연습이 바로 보여요.
- **실제 날짜로 / 처음 상태로**

예시 면접 질문 6개는 단계가 다 달라요. 새 질문 1개(오늘 학습하기), 오늘 연습할 질문 3개, 두 번 연속 막힌 질문 1개(하루 넘기면 '답 먼저 보기'로 나와요), 졸업한 질문 1개.

## 4. 파일 구조

```
index.html
css/style.css            디자인 (흑백, Pretendard)
fonts/                   Pretendard 글꼴
img/char/                캐릭터 한겹 8장
js/main.js               시작점 (화면 등록)
js/router.js             화면 전환
js/ui.js                 아이콘·탭바·버튼 같은 공통 조각
js/core/                 화면과 상관없는 규칙
   schedule.js             복습 간격 규칙 (잘 말함 ×2, 막힘 ÷2, 32일 넘으면 졸업)
   daily.js                한 질문 만들기, 대화 흐름, 키워드 뽑기, AI tip 문장
   date.js, recorder.js    날짜 계산, 녹음
js/data/                 저장 (store.js), 예시 데이터 (sample.js)
js/screens/              화면들 (시작, 홈, 한 질문, 면접 연습, 기록, 포트폴리오·설정)
```

규칙(core)과 저장(data)을 화면(screens)과 나눠 두어서, 나중에 React로 옮길 때 core와 data는 그대로 쓰고 화면만 바꾸면 돼요.

## 5. 아직 껍데기인 것

- '한겹 AI'는 진짜 AI가 아니라 정해 둔 문장으로 대화해요 (`js/core/daily.js`).
- 로그인은 아무 값이나 넣어도 들어가져요.
- 이력서·포트폴리오는 보기만 돼요 (편집은 다음 버전).
- 녹음은 앱을 닫으면 사라져요.
