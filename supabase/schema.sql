-- 감자 키우기 Supabase 테이블 (Supabase 대시보드 → SQL Editor에 붙여 넣고 Run)
-- 로그인한 사람은 자기 줄만 읽고 쓸 수 있다(RLS).

-- 1) 진행 상황: 프로필(이름·학교·학과·계열·직무), 완료한 단계, 스크랩, 알림 설정
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null,
  done jsonb not null default '[false,false,false,false]',
  saved jsonb not null default '{}',
  notify_on boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
create policy "progress: 내 줄 읽기" on public.progress for select using (auth.uid() = user_id);
create policy "progress: 내 줄 만들기" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: 내 줄 고치기" on public.progress for update using (auth.uid() = user_id);

-- 2) 테스트 지표 이벤트 (기획안 11장). 이름·학과는 넣지 않는다.
create table if not exists public.events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  data jsonb not null default '{}',
  ts timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "events: 내 이벤트 넣기" on public.events for insert with check (auth.uid() = user_id);
create policy "events: 내 이벤트 읽기" on public.events for select using (auth.uid() = user_id);
-- 팀은 대시보드의 Table Editor 또는 SQL Editor(관리자 권한)에서 전체 이벤트를 본다.
