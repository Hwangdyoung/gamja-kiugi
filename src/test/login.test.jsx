import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

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
  signInOrUp: async (_email, password) => {
    if (password !== 'potato1') throw new Error('비밀번호가 맞지 않아요.');
    return { user: { id: 'u1', email: 'test@example.com' }, created: false };
  },
  pullProgress: async () => remote,
  pushProgress: async (...a) => pushed.push(a),
  pushEvent: () => {},
  signOut: async () => {},
}));

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
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: '123' } });
    fireEvent.click(screen.getByText('시작하기'));
    expect(screen.getByRole('alert').textContent).toBe('비밀번호는 6자 이상으로 해 주세요.');

    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'wrong12' } });
    fireEvent.click(screen.getByText('시작하기'));
    expect((await screen.findByRole('alert')).textContent).toBe('비밀번호가 맞지 않아요.');

    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'potato1' } });
    fireEvent.click(screen.getByText('시작하기'));
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
});
