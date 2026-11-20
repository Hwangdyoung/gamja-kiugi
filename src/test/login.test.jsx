import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';

// Supabase 대신 가짜 로그인: 비밀번호 potato1이면 통과, 계정에는 저장된 감자가 있다
const remote = {
  profile: { name: '하늘', school: '한림대학교', dept: '바이오메디컬학과', major: 'bio', track: 'qa' },
  done: [true, true, false, false],
  saved: {},
  notifyOn: true,
};
const pushed = [];
vi.mock('../lib/auth.js', () => ({
  authEnabled: () => true,
  currentUser: async () => null,
  onAuthChange: () => () => {},
  supabase: null,
  signIn: async (_email, password) => {
    if (password !== 'potato1') throw new Error('이메일이나 비밀번호가 맞지 않아요. 처음이면 아래에서 가입해 주세요.');
    return { id: 'u1', email: 'test@example.com' };
  },
  signUp: async (email) => ({ id: 'u2', email }),
  pullProgress: async (id) => (id === 'u1' ? remote : null),
  pushProgress: async (...a) => pushed.push(a),
  pushEvent: () => {},
  signOut: async () => {},
}));

// 커뮤니티도 가짜 서버로: 글 목록·글쓰기·댓글·공감
const board = { posts: [], comments: [] };
vi.mock('../lib/community.js', async (orig) => {
  const real = await orig();
  const feed = (p) => ({ ...p, like_count: p.likes, comment_count: board.comments.filter((c) => c.post_id === p.id).length, liked: p.likes > 0, mine: true });
  return {
    ...real,
    communityEnabled: () => true,
    listPosts: async ({ board: b }) => board.posts.filter((p) => b === 'all' || p.board === b).map(feed),
    getPost: async (id) => {
      const p = board.posts.find((x) => x.id === id);
      return p ? { post: feed(p), comments: board.comments.filter((c) => c.post_id === id).map((c) => ({ ...c, mine: true })) } : null;
    },
    createPost: async ({ board: b, title, body, author }) => {
      const id = board.posts.length + 1;
      board.posts.unshift({ id, board: b, title, body, author, likes: 0, created_at: new Date().toISOString() });
      return id;
    },
    addComment: async (post_id, body, author) => board.comments.push({ id: board.comments.length + 1, post_id, body, author, created_at: new Date().toISOString() }),
    toggleLike: async (id) => {
      const p = board.posts.find((x) => x.id === id);
      p.likes = p.likes ? 0 : 1;
      return !!p.likes;
    },
  };
});

const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
  clear: () => memory.clear(),
};

const { default: App } = await import('../App.jsx');

beforeEach(() => {
  cleanup();
  localStorage.clear();
});

describe('로그인 (이메일·비밀번호)', () => {
  it('처음 열면 로그인 화면 → 이메일·비밀번호 → 계정에 저장된 감자로 이어서 시작', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('시작하기')); // 감자 얼굴 시작 화면
    await screen.findByLabelText('이메일');
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    // 로그인 화면 아래에는 가입하기와 로그인 없이 둘러보기 두 개
    expect(screen.getByText('처음이에요 · 가입하기')).toBeTruthy();
    expect(screen.getByText('로그인 없이 둘러보기')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(screen.getByRole('alert').textContent).toBe('비밀번호는 6자 이상으로 해 주세요.');

    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrong12' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect((await screen.findByRole('alert')).textContent).toContain('맞지 않아요');

    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'potato1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByText('저장된 감자를 불러왔어요.');
    // 예전 4단계 체크(1·2단계)는 내 직무 할 일 기록 2개로 옮겨진다
    expect(screen.getByText('기록 2 / 12')).toBeTruthy();
  });

  it('로그인 없이 둘러보기 → 예전처럼 시작 설정', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('시작하기'));
    fireEvent.click(await screen.findByText('로그인 없이 둘러보기'));
    await waitFor(() => expect(screen.getByText('춘천이라 할 게 없다며?', { exact: false })).toBeTruthy());
    expect(localStorage.getItem('gamja:guest')).toBe('1');
  });

  it('가입하기: 비밀번호 확인이 다르면 막고, 맞으면 가입 후 시작 설정', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('시작하기'));
    fireEvent.click(await screen.findByText('처음이에요 · 가입하기'));
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'potato1' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'potato2' } });
    fireEvent.click(screen.getByText('가입하고 시작하기'));
    expect(screen.getByRole('alert').textContent).toBe('비밀번호가 서로 달라요.');
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'potato1' } });
    fireEvent.click(screen.getByText('가입하고 시작하기'));
    await screen.findByText('춘천이라 할 게 없다며?', { exact: false });
  });

  it('커뮤니티: 로그인하고 익명으로 글쓰기 → 공감 → 댓글, 선배 조언 탭에 선배 이야기', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('시작하기'));
    fireEvent.change(await screen.findByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'potato1' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));
    await screen.findByText('저장된 감자를 불러왔어요.');
    const skip = screen.queryByText('건너뛰기');
    if (skip) fireEvent.click(skip);

    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('커뮤니티'));
    await screen.findByText('아직 글이 없어요.', { exact: false });
    fireEvent.click(screen.getByText('글쓰기'));
    fireEvent.click(screen.getByRole('radio', { name: '질문' }));
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '서포터즈 처음인데요' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: '1학년도 붙나요?' } });
    // 이름 대신 익명 + 학교·계열
    expect(document.querySelector('.notice-soft b').textContent).toBe('익명 감자 · 한림대 · 바이오');
    fireEvent.click(screen.getByText('올리기'));
    await screen.findByText('1학년도 붙나요?');
    fireEvent.click(screen.getByRole('button', { name: /공감 0/ }));
    await screen.findByRole('button', { name: /공감 1/ });
    fireEvent.change(screen.getByLabelText('댓글'), { target: { value: '저 1학년 때 붙었어요' } });
    fireEvent.click(screen.getByText('등록'));
    await screen.findByText('저 1학년 때 붙었어요');

    fireEvent.click(screen.getByText('← 커뮤니티'));
    await screen.findByText('서포터즈 처음인데요');
    fireEvent.click(screen.getByRole('tab', { name: '선배 조언' }));
    expect(screen.getByRole('region', { name: '선배 이야기' })).toBeTruthy();
    expect(document.querySelectorAll('.senior-row').length).toBeGreaterThan(0);
  });
});
