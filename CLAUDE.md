# CLAUDE.md — NeuPo 프로젝트 안내 (개발자 & Claude Code용)

이 파일은 Claude Code가 저장소를 열 때 자동으로 읽는 프로젝트 컨텍스트이자, 새 개발자가
처음 봐도 전체 그림을 잡을 수 있게 쓴 온보딩 문서입니다. **코드를 수정하기 전에 이 문서의
"핵심 함정" 섹션을 먼저 읽으세요.** 이 프로젝트는 GoDaddy Airo에서 추출된 코드라 일반적인
Vite 앱과 다른 관례가 몇 가지 있습니다.

---

## 1. 이 앱이 뭔가

**NeuPo** — 미국 정부의 Social / Political / Economic 3개 축(pillar) 아래 목표(Objectives) ·
정책(Policies) · 프로젝트(Projects)의 진행 상황을 보여주는 공개 웹사이트입니다.
현재는 읽기 전용 콘텐츠 사이트 + 대기자 이메일 수집 기능이 있습니다. (로그인/계정 기능은 아직 없음.)

- **호스팅**: Render.com (무료 웹 서비스) — GoDaddy가 아니라 우리가 직접 배포.
- **DB**: Supabase (Postgres). 미설정 시 번들된 JSON으로 자동 폴백.
- **원래 출처**: GoDaddy Airo export. `vite.config.ts` / `tsconfig.json` / `tailwind.config.js`
  등 빌드 설정은 export에 없어서 나중에 복구한 것 (자세히는 4번).

---

## 2. 기술 스택

- **React 19** + **TypeScript** + **Vite 6**
- **SSR**: 커스텀. 클라이언트 번들 + Express 서버 번들을 따로 빌드 (`src/server/entry.ts`).
- **라우팅**: React Router v7 (data router: `loader` 사용)
- **데이터 패칭**: React Router loader (+ TanStack React Query 설치돼 있음)
- **스타일**: Tailwind CSS v3 + shadcn/ui 컴포넌트 (`src/components/ui/`), CSS 변수 테마
- **애니메이션**: `motion` (framer-motion)
- **메타/SEO**: `@dr.pogodin/react-helmet` v3
- **서버**: Express 5
- Node **>= 22** 필요.

---

## 3. 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (Vite) — SSR + /api 라우트까지 동작 (vite.config.ts의 커스텀 미들웨어)
npm run build        # 프로덕션 빌드: 클라이언트 + SSR 서버 번들 (dist/server/)
node dist/server/entry.js   # 빌드된 서버 실행 (Render의 start command)
npm run type-check   # tsc --noEmit (타입 검사)
npm run lint         # ESLint
npm test             # Vitest
```

- **빌드 산출물**: 클라이언트는 `dist/server/client/`, 서버는 `dist/server/entry.js`.
  (서버가 `dist/server/client`를 정적 파일로 서빙하고 SSR 렌더링함.)
- **Render 설정**: Build = `npm install && npm run build`, Start = `node dist/server/entry.js`.

---

## 4. 저장소 구조

```
website/
├─ CLAUDE.md                 ← 이 문서
├─ index.html                ← SSR 마커 <!--app-head--> / <!--app-html--> 포함 (건드리지 말 것)
├─ vite.config.ts            ← 복구됨. 클라/SSR 분리 빌드 + dev SSR·API 미들웨어
├─ tailwind.config.js        ← 복구됨. shadcn HSL 토큰 매핑
├─ tsconfig.json             ← 복구됨. @ alias, resolveJsonModule
├─ package.json              ← (원본은 pakage.json 오타였음 → 수정됨)
├─ supabase/                 ← DB 자산 (앱 런타임과 무관, 수동 실행용)
│  ├─ schema.sql             ← pillars/projects 테이블 + RLS
│  ├─ seed.sql               ← JSON에서 생성된 시드 (generate-seed.mjs로 재생성)
│  ├─ signups.sql            ← 대기자 이메일 테이블 + RLS
│  └─ generate-seed.mjs      ← content.json → seed.sql 생성기
├─ docs/DATABASE-SETUP.md    ← 비개발자용 Supabase/Render 설정 가이드
├─ dev-tools/                ← 복구된 스텁 (AiroErrorBoundary, PageNotFound) — dev 전용
└─ src/
   ├─ main.tsx               ← 클라이언트 진입점 (hydrate)
   ├─ App.tsx                ← 클라이언트 라우터 (createBrowserRouter + hydrationData)
   ├─ entry-server.tsx       ← SSR 렌더 함수 (renderToString + Helmet 추출)
   ├─ routes.tsx             ← 라우트 정의 (여기에 loader 연결) ★자주 수정
   ├─ pages/                 ← 페이지 컴포넌트 (index, social, political, economic, register, _404)
   ├─ components/            ← 섹션 컴포넌트 + components/ui (shadcn)
   ├─ layouts/               ← RootLayout, Website, parts/Header, parts/Footer
   ├─ data/
   │  ├─ pillars.content.json ← ★데이터 단일 원본 (직렬화 가능, 아이콘 없음)
   │  └─ pillars.ts           ← 타입 + statusColors + pillarMeta(아이콘·색) + mock 폴백
   ├─ lib/
   │  ├─ pillars-loader.ts    ← isomorphic 로더 (SSR=DB 직접, 클라=API fetch)
   │  └─ api-client.ts        ← 클라이언트 fetch 헬퍼 (submitSignup 등)
   └─ server/
      ├─ entry.ts             ← Express 앱 + 프로덕션 SSR. ★API 라우트 등록 위치
      ├─ data/pillars-repo.ts ← 서버 전용 Supabase 읽기 (+ mock 폴백, 60초 캐시)
      └─ api/                 ← 파일 기반 API 핸들러
         ├─ health/GET.ts
         ├─ contact/[formName]/POST.ts
         ├─ pillars/GET.ts
         ├─ pillars/[slug]/GET.ts
         └─ signup/POST.ts
```

---

## 5. 데이터 아키텍처 (가장 중요)

**원칙: 데이터(직렬화 가능)와 표현(아이콘·색)을 분리한다.**

- **데이터 단일 원본**: `src/data/pillars.content.json`.
  이 파일 하나가 (a) DB 미설정 시 폴백 콘텐츠, (b) `supabase/seed.sql`의 원본입니다.
- **표현 메타**: `src/data/pillars.ts`의 `pillarMeta` (slug → 아이콘 컴포넌트 + accent 색).
  아이콘은 React 컴포넌트라 직렬화 불가 → **절대 DB/API/loader 데이터에 넣지 말 것.**
  컴포넌트에서 `pillarMeta[slug]`로 조회.

**런타임 데이터 흐름**:

```
방문자가 /social 요청
  → routes.tsx의 loader: loadPillarOrThrow('social')
      · SSR일 때 (import.meta.env.SSR): server/data/pillars-repo.ts를 직접 호출
          - SUPABASE_URL/ANON_KEY 있으면 Supabase REST 읽기, 없으면 mock JSON
      · 클라이언트일 때: fetch('/api/pillars/social')
  → 페이지 컴포넌트가 useLoaderData()로 받음 → CategoryPage에 전달
```

`import.meta.env.SSR` 분기는 Vite가 빌드 시 정적으로 치환 → 브라우저 번들에는 서버 코드/DB
접속 정보가 **포함되지 않음**. (이 패턴 유지할 것.)

**데이터를 바꾸려면** 두 가지 방법:
1. Supabase Table Editor에서 행 직접 수정 (최대 60초 캐시 후 반영, 재배포 불필요).
2. `pillars.content.json` 수정 → `node supabase/generate-seed.mjs` → 나온 `seed.sql`을
   Supabase SQL Editor에서 실행.

---

## 6. 자주 하는 작업 (레시피)

### 새 API 라우트 추가
1. `src/server/api/<경로>/GET.ts` (또는 `POST.ts`) 생성. 시그니처: `export default async function handler(req, res)`.
2. **`src/server/entry.ts`의 마커 안에 두 곳 등록** (이거 빼먹으면 프로덕션에서 404):
   - `// <api-imports>` 블록에 `import x from "./api/<경로>/GET";`
   - `// <api-registrations>` 블록에 `app.get("/api/<경로>", x);`
   - 동적 세그먼트는 `[slug]` 폴더 → `:slug` 라우트.

### 새 페이지 추가
1. `src/pages/<name>.tsx` 생성 (Helmet으로 title/description/canonical 포함).
2. `src/routes.tsx`에 `{ path: '/<name>', element: <NamePage /> }` 추가.
3. SSR에서 데이터가 필요하면 `loader` 추가하고 컴포넌트에서 `useLoaderData()` 사용
   (동기 `renderToString`이라 컴포넌트 내부 async fetch는 SSR HTML에 안 잡힘 → 반드시 loader).

### 이미지/정적 파일
`public/`에 두고 `/파일명`으로 참조. **`/airo-assets/...` 나 `/assets/screenshot-...` 같은
GoDaddy 전용 경로는 Render에 없어서 깨짐** — `public/`에 실제 파일을 두거나 CSS로 대체.

### 환경변수
- 서버 전용: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (process.env로 읽음).
- 클라이언트 노출이 필요하면 `VITE_` 접두사 필요 (예: 향후 Supabase Auth).
- 로컬은 `.env` (git 무시됨), 프로덕션은 Render 대시보드 Environment.

---

## 7. 배포 흐름

```
코드 수정 → git commit → git push (origin main)
  → Render가 push 감지 → npm install && npm run build → node dist/server/entry.js 재시작
```

- **데이터만** 바꾸는 거면 배포 불필요 (Supabase Table Editor에서 수정).
- Render 무료 티어: 15분 미접속 시 슬립 → 첫 요청 콜드스타트 30~50초.
- Supabase 무료: 7일 미사용 시 일시정지 가능 → 그동안 사이트는 mock 폴백으로 유지됨.

---

## 8. 핵심 함정 (반드시 숙지)

1. **API 라우트는 `src/server/entry.ts` 마커에 수동 등록해야 함.** 파일만 만들면 dev에선
   될 수 있어도 프로덕션에서 404. (`<api-imports>` + `<api-registrations>` 둘 다.)
2. **SSR 데이터는 loader로.** 컴포넌트 안에서 fetch하면 SSR HTML엔 안 들어가고 hydration
   후에만 보임 (SEO 손해). 홈처럼 정적 콘텐츠는 상관없지만 DB 데이터는 loader 필수.
3. **아이콘/색은 데이터에 넣지 말 것.** 직렬화 불가 → API/SSR 깨짐. `pillarMeta`로 분리.
4. **Helmet SSR은 `onServerState` 콜백으로 추출** (entry-server.tsx). v3에서 옛 `context`
   prop은 빈 head를 반환 → title/meta/canonical 사라짐. 이미 고쳐둠, 되돌리지 말 것.
5. **`index.html`의 `<!--app-head-->` / `<!--app-html-->` 마커 유지.** 없으면 서버가
   부팅 시 죽음(fail fast).
6. **`.env` / Supabase 키는 절대 커밋 금지.** `.gitignore`에 이미 있음.
7. **파일명 오타 주의.** export에서 넘어온 잔재로 `from.tsx`, `progess.tsx`, `togggle.tsx`,
   `contact-from.config.json`, `llms-tst.test.ts` 등 오타 파일명이 있음. import가 그 오타를
   그대로 참조하므로, 정리할 땐 파일과 import를 함께 바꿔야 함.
8. **DB는 항상 안전 폴백.** `pillars-repo.ts`는 실패/미설정 시 mock을 반환 → 사이트가 절대
   빈 화면이 되지 않게 설계됨. 이 폴백 동작을 유지할 것.

---

## 9. Supabase 스키마 요약

- `pillars(slug PK, label, description, sort_order)`
- `projects(id PK, pillar_slug FK, category['Objectives'|'Policies'|'Projects'], title, agency,
  status['On Track'|'Delayed'|'Completed'|'At Risk'], progress 0-100, budget, description,
  source, source_url, sort_order)`
- `signups(email PK, source, created_at)` — 익명 INSERT만 허용(RLS), SELECT 차단.
- RLS: pillars/projects는 공개 읽기, signups는 대시보드에서만 조회.

---

## 10. 현재 라우트 / API 목록

**페이지**: `/`, `/social`, `/political`, `/economic`, `/register`, `/military`(→ `/` 리다이렉트), `*`(404)
**API**: `GET /api/health`, `POST /api/contact/:formName`, `GET /api/pillars`,
`GET /api/pillars/:slug`, `POST /api/signup`

---

## 11. 작업 스타일 제안 (Claude Code용)

- 변경 후에는 `npm run build`로 클라이언트+SSR 둘 다 빌드되는지 확인 (SSR 빌드가 타입 외적
  런타임 문제를 자주 드러냄).
- API/데이터를 만졌으면 `node dist/server/entry.js`로 띄워 `curl /api/...`와 페이지 HTML을
  스모크 테스트.
- 커밋 메시지는 Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `style:`) 사용 중.
- 큰 기능(예: 로그인)은 Supabase Auth를 우선 검토 (직접 인증 구현 금지).
