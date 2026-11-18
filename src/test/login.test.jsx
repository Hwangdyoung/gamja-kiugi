import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

// Supabase 대신 가짜 로그인: 코드 123456이면 통과, 계정에는 저장된 감자가 있다
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
  sendCode: async () => {},
  verifyCode: async (_email, code) => {
    if (code !== '123456') throw new Error('코드가 맞지 않거나 시간이 지났어요. 새 코드를 받아 주세요.');
    return { id: 'u1', email: 'test@example.com' };
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

describe('로그인 (이메일 코드)', () => {
  it('처음 열면 로그인 화면 → 코드 확인 → 계정에 저장된 감자로 이어서 시작', async () => {
    render(<App />);
    await screen.findByText('로그인 코드 받기');
    fireEvent.change(screen.getByLabelText('이메일'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('로그인 코드 받기'));
    await screen.findByText('확인하고 시작하기');

    fireEvent.change(screen.getByLabelText(/로 보낸 코드/), { target: { value: '000000' } });
    fireEvent.click(screen.getByText('확인하고 시작하기'));
    expect((await screen.findByRole('alert')).textContent).toContain('코드가 맞지 않거나');

    fireEvent.change(screen.getByLabelText(/로 보낸 코드/), { target: { value: '123456' } });
    fireEvent.click(screen.getByText('확인하고 시작하기'));
    await screen.findByText('저장된 감자를 불러왔어요.');
    expect(screen.getByText('2 / 4단계 완료')).toBeTruthy();
  });

  it('로그인 없이 둘러보기 → 예전처럼 시작 설정', async () => {
    render(<App />);
    fireEvent.click(await screen.findByText('로그인 없이 둘러보기'));
    await waitFor(() => expect(screen.getByText('감자 키우기 시작')).toBeTruthy());
    expect(localStorage.getItem('gamja:guest')).toBe('1');
  });
});
