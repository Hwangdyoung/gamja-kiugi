/* 커뮤니티 글·댓글·공감·신고 (Supabase, 표: supabase/community.sql)
   - 읽기는 누구나: post_feed · comment_feed 보기 (글쓴이 계정은 보이지 않고, 내 글인지 mine만)
   - 쓰기는 로그인한 사람만: create_post · add_comment · toggle_like · report_content · delete_* 함수
   - 글쓴이는 익명. 학교·계열·학년(author)만 같이 저장한다. 이름·이메일은 넣지 않는다. */
import { supabase } from './auth.js';
import { MAJORS } from './data.js';

export const BOARDS = [
  { id: 'advice', label: '선배 조언', hint: '먼저 해 본 사람이 알려 주는 것' },
  { id: 'question', label: '질문', hint: '모르는 건 편하게 물어보기' },
  { id: 'review', label: '후기', hint: '서포터즈·인턴·공모전 해 본 이야기' },
  { id: 'free', label: '자유', hint: '아무 얘기나' },
];
export const BOARD_LABEL = Object.fromEntries(BOARDS.map((b) => [b.id, b.label]));
export const TITLE_MAX = 60;
export const BODY_MAX = 1000;
export const COMMENT_MAX = 300;

/* 글쓴이 표시: 이름 대신 학교 줄임 · 계열 · 학년 */
export const authorOf = (profile) => ({ school: profile.school ?? null, major: profile.major, grade: profile.grade ?? null });
export function authorLine(a = {}) {
  const school = a.school ? a.school.replace(/대학교$/, '대') : null;
  const major = a.major && MAJORS[a.major] ? MAJORS[a.major].label.split('·')[0] : null;
  return ['익명 감자', school, major, a.grade ? `${a.grade}학년` : null].filter(Boolean).join(' · ');
}

export function timeAgo(iso, now = new Date()) {
  const m = Math.floor((now - new Date(iso)) / 60000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  const t = new Date(iso);
  return `${t.getMonth() + 1}.${t.getDate()}`;
}

const ko = (error) => {
  const m = error?.message || '';
  if (/로그인/.test(m) || /JWT|not authenticated|permission denied for function/i.test(m)) return '로그인이 필요해요.';
  if (/relation .* does not exist|Could not find|schema cache/i.test(m)) return '커뮤니티가 아직 준비되지 않았어요.';
  if (/check constraint/i.test(m)) return '글이 너무 길거나 비어 있어요.';
  return '잠시 문제가 생겼어요. 다시 해 주세요.';
};
const run = async (q) => {
  const { data, error } = await q;
  if (error) throw new Error(ko(error));
  return data;
};

export const communityEnabled = () => !!supabase;

/* 글 목록. board 'all'이면 전부, major를 주면 그 계열 글만, sort 'new' | 'hot' */
export async function listPosts({ board = 'all', major = null, sort = 'new', limit = 50 } = {}) {
  let q = supabase.from('post_feed').select('*');
  if (board !== 'all') q = q.eq('board', board);
  if (major) q = q.eq('author->>major', major);
  q = sort === 'hot' ? q.order('like_count', { ascending: false }).order('created_at', { ascending: false }) : q.order('created_at', { ascending: false });
  return run(q.limit(limit));
}

export async function getPost(id) {
  const [post, comments] = await Promise.all([
    run(supabase.from('post_feed').select('*').eq('id', id).maybeSingle()),
    run(supabase.from('comment_feed').select('*').eq('post_id', id).order('created_at')),
  ]);
  return post ? { post, comments } : null;
}

export const createPost = ({ board, title, body, author }) => run(supabase.rpc('create_post', { p_board: board, p_title: title, p_body: body, p_author: author }));
export const deletePost = (id) => run(supabase.rpc('delete_post', { p_id: id }));
export const addComment = (postId, body, author) => run(supabase.rpc('add_comment', { p_post: postId, p_body: body, p_author: author }));
export const deleteComment = (id) => run(supabase.rpc('delete_comment', { p_id: id }));
export const toggleLike = (postId) => run(supabase.rpc('toggle_like', { p_post: postId }));
export const report = (postId, commentId = null) => run(supabase.rpc('report_content', { p_post: postId, p_comment: commentId }));
