# 데이터베이스 연결 & 자체 호스팅 가이드

이 문서는 지금까지 mock 데이터로 돌던 NeuPo 사이트를 **Supabase 데이터베이스**에 연결하고, **Render.com(무료)** 에 우리가 직접 배포하는 전체 과정을 비개발자 기준으로 설명합니다.

---

## 0. 먼저 알아둘 것 — 지금 코드가 어떻게 동작하나

- 사이트의 pillar/project 데이터는 이제 **DB에서 읽어오도록** 바뀌었습니다.
- 단, `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 환경변수가 **없으면 자동으로 기존 JSON 데이터로 폴백**합니다. 즉, DB를 아직 안 붙여도 사이트는 지금과 똑같이 보입니다. DB를 붙이는 순간부터 DB 값을 씁니다.
- 데이터의 "단일 원본"은 `src/data/pillars.content.json` 입니다. 이 파일에서 폴백용 데이터와 DB 시드(seed) SQL이 모두 나옵니다.

> ⚠️ **선행 조건(중요)**: 이 코드는 GoDaddy에서 추출된 것이라 빌드 설정 파일이 빠져 있습니다 — `vite.config.ts`, `tsconfig.json`이 없고 `package.json`이 `pakage.json`으로 잘못 이름이 붙어 있습니다. **로컬 실행이나 Render 배포를 하려면 이 세 가지를 먼저 복구해야 합니다.** (원하시면 이 복구도 이어서 해드릴 수 있습니다 — 아래 6번 참고.)

---

## 1. Supabase 계정 & 프로젝트 만들기 (약 5분, 무료)

1. https://supabase.com 접속 → **Start your project** → GitHub 또는 이메일로 가입.
2. 로그인 후 **New project** 클릭.
   - **Name**: `neupo` (아무거나)
   - **Database Password**: 강한 비밀번호 생성 후 **어딘가 저장**(나중에 쓸 일은 드물지만 분실 주의).
   - **Region**: 방문자와 가까운 곳(한국이면 `Northeast Asia (Seoul)` 또는 `Tokyo`).
   - **Create new project** 클릭 → 1~2분 기다리면 준비됨.

---

## 2. 테이블 만들기 (스키마 실행)

1. 왼쪽 메뉴에서 **SQL Editor** → **New query**.
2. 이 저장소의 `supabase/schema.sql` 파일 내용을 **전부 복사해 붙여넣기**.
3. 오른쪽 아래 **Run** 클릭. "Success" 나오면 완료 (pillars, projects 두 테이블 생성됨).

---

## 3. 데이터 채우기 (시드 실행)

1. 같은 **SQL Editor**에서 **New query**.
2. `supabase/seed.sql` 파일 내용을 **전부 복사해 붙여넣기** → **Run**.
3. 왼쪽 **Table Editor** → `projects` 테이블을 열어 29개 행이 들어갔는지 확인.

---

## 4. 접속 키 복사해서 사이트에 알려주기

1. Supabase 왼쪽 하단 **Project Settings**(톱니바퀴) → **API** 메뉴.
2. 두 값을 복사:
   - **Project URL** → `https://xxxx.supabase.co` 형태
   - **Project API keys → `anon` `public`** 키 (긴 문자열)
3. 이 두 값을 환경변수로 넣습니다. 넣는 위치는 두 곳:
   - **로컬 테스트용**: 프로젝트 루트에 `.env` 파일을 만들어(아래처럼) 저장.
   - **실서비스용**: Render 대시보드(5번)에 입력.

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi... (복사한 anon public 키)
```

> `anon public` 키는 공개돼도 되는 키입니다. 우리 DB는 "읽기만 허용(RLS)"으로 설정돼 있어서 이 키로는 데이터를 볼 수만 있고 고칠 수 없습니다. `service_role` 키는 절대 코드나 프런트에 넣지 마세요.

이 시점에서 로컬로 사이트를 띄우면(6번 이후) 카테고리 페이지가 **DB에서** 데이터를 읽어옵니다.

---

## 5. Render.com에 무료로 배포하기

전제: 코드가 **GitHub 저장소**에 올라가 있어야 합니다. (아직이면 GitHub에 새 repo를 만들어 이 `website` 폴더를 올리세요. 이 부분도 도와드릴 수 있습니다.)

1. https://render.com 접속 → GitHub로 가입/로그인.
2. **New +** → **Web Service** → 우리 GitHub 저장소 선택(**Connect**).
3. 설정값 입력:
   - **Name**: `neupo` (무료 주소 `neupo.onrender.com`이 됨)
   - **Region**: Singapore 등 가까운 곳
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server/entry.js`
   - **Instance Type**: **Free**
4. 아래 **Advanced** → **Add Environment Variable**로 4번에서 복사한 두 값 추가:
   - `SUPABASE_URL` = `https://xxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...`
   - (참고) `NODE_ENV` = `production`
5. **Create Web Service** 클릭 → 첫 빌드가 몇 분 돌고, 끝나면 `https://neupo.onrender.com` 으로 접속됩니다.

**무료 티어 특징**: 15분간 아무도 안 들어오면 서버가 잠들고, 다음 첫 접속 때 30~50초 깨어나는 시간이 있습니다. 그 뒤로는 정상 속도. 프로젝트/데모용으론 충분합니다.

### 도메인 연결 (선택)
GoDaddy에서 산 도메인을 그대로 쓰려면: Render의 서비스 → **Settings → Custom Domains**에서 도메인 추가 → 안내되는 값(CNAME 등)을 GoDaddy DNS 관리에 입력하면 됩니다. 도메인은 GoDaddy에 그대로 두고 "가리키는 곳"만 Render로 바꾸는 것입니다.

---

## 6. 로컬에서 먼저 확인하고 싶다면 (빌드 설정 복구 필요)

앞서 말한 대로 이 export에는 `vite.config.ts` / `tsconfig.json`이 없고 `package.json`이 `pakage.json`으로 돼 있어, **지금 상태로는 `npm install`도 `npm run build`도 실행되지 않습니다.** 로컬 실행/배포 전에 아래가 필요합니다:

1. `pakage.json` → `package.json` 으로 이름 변경
2. `vite.config.ts` 복구 (SSR, `@` 경로 alias, API 라우트 플러그인, `index.html`의 `<!--app-html-->` 마커 처리 포함)
3. `tsconfig.json` 복구 (`resolveJsonModule: true` 포함 — JSON import를 위해 필요)

이건 별도 작업이라, 원하시면 이어서 제가 복구해 드리겠습니다. 복구되면:

```
npm install
npm run dev      # 개발 서버로 http://localhost:5173 확인
npm run build    # 배포용 빌드
node dist/server/entry.js   # 빌드 결과 실행
```

---

## 7. 나중에 데이터 교체하기 (근거링크 등)

두 가지 방법 중 편한 쪽:

**방법 A — Supabase 화면에서 직접 (가장 간편)**
Supabase → **Table Editor** → `projects` 테이블에서 셀을 엑셀처럼 클릭해 수정. 근거링크는 `source_url` 컬럼을 고치면 됩니다. 새 항목은 **Insert row**로 추가. 저장 즉시(캐시 최대 60초 후) 사이트에 반영됩니다.

**방법 B — JSON 원본을 고치고 다시 시드**
`src/data/pillars.content.json`을 수정 → 아래 실행 → 나온 `seed.sql`을 Supabase SQL Editor에 붙여 Run:

```
node supabase/generate-seed.mjs
```

> JSON을 고치면 (DB 미설정 시의) 폴백 데이터도 같이 갱신되므로, 원본을 JSON에 유지하는 것을 권장합니다.

---

## 8. 대기자 이메일 수집 (waitlist)

메인 히어로, 푸터 뉴스레터, `/register` 페이지에서 받은 이메일을 저장하는 기능입니다.

**한 번만 설정**: Supabase → **SQL Editor** → **New query**에 `supabase/signups.sql` 내용을 붙여넣고 **Run**. (`signups` 테이블 생성 + 익명 저장 허용/조회 차단 정책)

**동작 방식**: 방문자가 이메일을 넣으면 서버의 `/api/signup`이 Supabase에 저장합니다. Render에는 **추가 설정이 필요 없어요** — 이미 넣어둔 `SUPABASE_URL` / `SUPABASE_ANON_KEY`를 그대로 씁니다.

**모인 이메일 보기**: Supabase → **Table Editor** → `signups` 테이블. `source` 컬럼으로 어디서 들어왔는지(hero / footer / register) 구분됩니다. 보안을 위해 이 목록은 공개 API로는 못 읽고 대시보드에서만 보입니다.

> 로그인(계정) 기능은 아직 없습니다 — 지금은 이메일 수집만. 나중에 실제 로그인이 필요하면 Supabase Auth로 확장할 수 있어요.

## 문제 해결

- **카테고리 페이지가 비어 보임 / 옛날 데이터** → 환경변수(`SUPABASE_URL`, `SUPABASE_ANON_KEY`)가 제대로 들어갔는지, seed.sql을 Run 했는지 확인. 값이 틀리거나 DB 오류면 자동으로 JSON 폴백으로 뜹니다(사이트가 깨지진 않음).
- **Render 빌드 실패** → 6번의 빌드 설정 복구가 안 됐을 가능성이 큼.
- **`/api/pillars` 확인** → 배포 후 `https<도메인>/api/pillars` 를 열면 JSON이 보여야 합니다. DB 연결이 됐는지 빠르게 확인하는 방법입니다.
