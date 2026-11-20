-- 감자 키우기 커뮤니티 (11/20). Supabase 대시보드 → SQL Editor에 이 파일 전체를 붙여 넣고 Run.
-- 여러 번 실행해도 괜찮다.
-- 글쓴이 이름·이메일은 저장하지 않는다. 익명 + 학교·계열·학년(author)만 보인다.
-- 읽기: 누구나(로그인 없이 둘러보기 포함). 쓰기·공감·댓글·신고: 로그인한 사람. 지우기: 내 것만.
-- 앱은 표를 직접 만지지 않고 보기(post_feed·comment_feed)와 함수(create_post 등)만 쓴다.
-- 신고가 3건 쌓이면 글·댓글이 자동으로 숨겨진다.

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  board text not null check (board in ('advice', 'question', 'review', 'free')),
  title text not null check (char_length(title) between 1 and 60),
  body text not null check (char_length(body) between 1 and 1000),
  author jsonb not null default '{}', -- { school, major, grade } (이름 없음)
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 300),
  author jsonb not null default '{}',
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.likes (
  post_id bigint not null references public.posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (post_id, user_id)
);
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  post_id bigint references public.posts (id) on delete cascade,
  comment_id bigint references public.comments (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, comment_id, user_id)
);
create index if not exists posts_board_created on public.posts (board, created_at desc);
create index if not exists comments_post on public.comments (post_id, created_at);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.reports enable row level security;
-- 표는 앱에서 직접 읽고 쓰지 못하게 막는다(누가 쓴 글인지 user_id가 새지 않게).
-- 읽기는 아래 두 보기(post_feed·comment_feed)로, 쓰기는 아래 함수로만.
revoke all on public.posts, public.comments, public.likes, public.reports from anon, authenticated;

-- 목록용 글: 공감 수·댓글 수, 내 글인지(mine), 내가 공감했는지(liked)
create or replace view public.post_feed as
select p.id, p.board, p.title, p.body, p.author, p.created_at,
  (select count(*) from public.likes l where l.post_id = p.id)::int as like_count,
  (select count(*) from public.comments c where c.post_id = p.id and not c.hidden)::int as comment_count,
  coalesce(p.user_id = auth.uid(), false) as mine,
  exists (select 1 from public.likes l where l.post_id = p.id and l.user_id = auth.uid()) as liked
from public.posts p
where not p.hidden;
create or replace view public.comment_feed as
select c.id, c.post_id, c.body, c.author, c.created_at, coalesce(c.user_id = auth.uid(), false) as mine
from public.comments c
where not c.hidden;
grant select on public.post_feed, public.comment_feed to anon, authenticated;

-- 쓰기 함수 (로그인한 사람만)
create or replace function public.need_login() returns uuid language plpgsql stable as $$
begin
  if auth.uid() is null then raise exception '로그인이 필요해요'; end if;
  return auth.uid();
end $$;

create or replace function public.create_post(p_board text, p_title text, p_body text, p_author jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare new_id bigint;
begin
  insert into posts (user_id, board, title, body, author)
  values (need_login(), p_board, trim(p_title), trim(p_body), coalesce(p_author, '{}'))
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.delete_post(p_id bigint) returns void
language sql security definer set search_path = public as $$
  delete from posts where id = p_id and user_id = need_login();
$$;

create or replace function public.add_comment(p_post bigint, p_body text, p_author jsonb) returns bigint
language plpgsql security definer set search_path = public as $$
declare new_id bigint;
begin
  insert into comments (post_id, user_id, body, author)
  values (p_post, need_login(), trim(p_body), coalesce(p_author, '{}'))
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.delete_comment(p_id bigint) returns void
language sql security definer set search_path = public as $$
  delete from comments where id = p_id and user_id = need_login();
$$;

-- 공감 켜기/끄기. 켜졌으면 true
create or replace function public.toggle_like(p_post bigint) returns boolean
language plpgsql security definer set search_path = public as $$
declare me uuid := need_login();
begin
  if exists (select 1 from likes where post_id = p_post and user_id = me) then
    delete from likes where post_id = p_post and user_id = me;
    return false;
  end if;
  insert into likes (post_id, user_id) values (p_post, me);
  return true;
end $$;

-- 신고 (같은 사람이 같은 걸 두 번 신고해도 한 번). 3건이면 숨김
create or replace function public.report_content(p_post bigint, p_comment bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into reports (post_id, comment_id, user_id) values (p_post, p_comment, need_login())
  on conflict do nothing;
  if p_comment is null and (select count(*) from reports where post_id = p_post and comment_id is null) >= 3 then
    update posts set hidden = true where id = p_post;
  end if;
  if p_comment is not null and (select count(*) from reports where comment_id = p_comment) >= 3 then
    update comments set hidden = true where id = p_comment;
  end if;
end $$;

revoke execute on function public.create_post, public.delete_post, public.add_comment, public.delete_comment, public.toggle_like, public.report_content from public, anon;
grant execute on function public.create_post, public.delete_post, public.add_comment, public.delete_comment, public.toggle_like, public.report_content to authenticated;
