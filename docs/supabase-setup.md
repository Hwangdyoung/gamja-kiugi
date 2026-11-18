# 로그인 켜기 (Supabase, 무료)

앱에는 이메일 코드 로그인이 들어 있지만, Supabase 주소와 키를 넣기 전까지는 꺼져 있습니다(예전처럼 기기에만 저장).
아래를 한 번만 하면 켜집니다.

## 1. 프로젝트 만들기
1. https://supabase.com 에 가입 → **New project** → 이름 `gamja-kiugi`, 지역 **Northeast Asia (Seoul)**, DB 암호는 아무거나(따로 보관).
2. 만들어지면 **Project Settings → API**에서 두 값을 복사합니다.
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public** 키 (공개해도 되는 키. `service_role` 키는 절대 쓰지 않기)

## 2. 테이블 만들기
**SQL Editor → New query**에 [`supabase/schema.sql`](../supabase/schema.sql) 내용을 붙여 넣고 **Run**.
(진행 상황 `progress`, 테스트 지표 `events` 두 표가 생기고, 각자 자기 줄만 읽고 쓸 수 있게 잠깁니다.)

## 3. 메일로 6자리 코드가 가게 하기
**Authentication → Emails → Magic Link** 템플릿 본문을 아래처럼 바꿉니다(링크 대신 숫자 코드).

```html
<h2>감자 키우기 로그인 코드</h2>
<p>아래 6자리 숫자를 앱에 넣어 주세요. 10분 동안 쓸 수 있어요.</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
```

- 무료 요금제의 기본 메일 서버는 **시간당 몇 통**만 보냅니다. 사용자 테스트(10~20명) 전에는
  **Authentication → Emails → SMTP Settings**에 Gmail 등 메일 서버를 연결하는 걸 권합니다.

## 4. 앱에 값 넣기
- **로컬**: 프로젝트 폴더에 `.env.local` 파일을 만들고(깃에 올라가지 않음)
  ```
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=복사한 anon 키
  ```
- **Vercel**: 프로젝트 → Settings → Environment Variables에 같은 두 값을 넣고 **Redeploy**.
- **iPhone 앱**: `.env.local`이 있는 상태로 `npm run build && npx cap sync ios` 후 다시 설치.

## 동작
- 처음 열면 로그인 화면 → 이메일 → 메일로 온 6자리 코드 → 시작. "로그인 없이 둘러보기"도 남아 있습니다.
- 로그인하면 진행 상황이 계정에 저장되고, 다른 폰에서 로그인하면 이어서 키웁니다.
- 테스트 지표 이벤트가 `events` 표에 쌓여, 팀은 대시보드 **Table Editor**에서 한 번에 봅니다.
- 설정(톱니)에서 로그인·로그아웃.
