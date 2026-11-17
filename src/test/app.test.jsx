import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import App from '../App.jsx';
import { messageFor, moodOf } from '../lib/growth.js';
import { buildItems, ddayLabel, isOpen } from '../lib/opportunities.js';
import { notifyDecision } from '../lib/notify.js';
import { MAJORS, TYPES } from '../lib/data.js';

// 최신 Node의 내장 localStorage가 jsdom 것을 가려서, 테스트용 메모리 저장소를 쓴다
const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
  clear: () => memory.clear(),
};

beforeEach(() => {
  cleanup();
  localStorage.clear();
});

describe('표정·문구·알림 규칙', () => {
  it('미접속 일수에 따라 표정이 바뀐다', () => {
    expect([0, 1, 2, 3, 4, 6, 7, 14].map(moodOf)).toEqual([
      'happy', 'happy', 'neutral', 'neutral', 'annoyed', 'annoyed', 'angry', 'angry',
    ]);
  });
  it('받침에 맞춰 조사를 붙이고, 4단계를 마치면 직무별 축하 문구를 보여준다', () => {
    const track = MAJORS.bio.tracks.res;
    const all = [true, true, true, true];
    expect(messageFor('happy', { name: '하늘', done: [false, false, false, false], track })).toBe('하늘이 오늘도 성장 중!');
    expect(messageFor('angry', { name: '지수', done: all, track })).toBe('지수가 화났다. 춘천 공고 확인하러 와.');
    expect(messageFor('happy', { name: '하늘', done: all, track })).toContain('연구자의 길');
  });
  it('표정이 바뀌는 날과, 분노 이후 주 1회만 알림을 보낸다', () => {
    const sendDays = Array.from({ length: 22 }, (_, d) => d).filter((d) => notifyDecision(d, true).send);
    expect(sendDays).toEqual([2, 4, 7, 14, 21]);
    expect(notifyDecision(4, false).send).toBe(false);
  });
});

describe('기회 데이터', () => {
  it('모든 기회 유형은 기획안의 6가지 칩 중 하나다', () => {
    Object.values(MAJORS).forEach((m) =>
      Object.values(m.tracks).forEach((t) =>
        t.levels.forEach((l) => l.o.forEach((o) => expect(TYPES).toContain(o.type))),
      ),
    );
  });
  it('마감 지난 기회는 열린 기회에서 빠진다', () => {
    const today = new Date(2026, 10, 16);
    const items = buildItems({ name: 'a', major: 'dmc', track: 'mkt' }, today);
    const contest = items.find((it) => it.title === '지역 상권 홍보 공모전');
    expect(ddayLabel(contest, today)).toBe('마감');
    expect(isOpen(contest, today)).toBe(false);
  });
});

describe('화면 흐름', () => {
  const start = (name = '하늘') => {
    render(<App />);
    fireEvent.click(screen.getByText('내 경로 만들기'));
    expect(screen.getByRole('alert').textContent).toBe('이름을 입력해 주세요.');
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: name } });
    expect(document.querySelector('.brand-lg .nm').textContent).toBe(name);
    fireEvent.click(screen.getByLabelText(/디지털미디어콘텐츠/));
    fireEvent.click(screen.getByLabelText('마케팅형'));
    fireEvent.click(screen.getByText('내 경로 만들기'));
  };

  it('시작 설정 → 홈 → 기회 상세 → 스크랩', () => {
    start();
    expect(document.querySelector('.brand').textContent).toBe('하늘 키우기');
    expect(screen.getByText('하늘이 오늘도 성장 중!')).toBeTruthy();
    expect(screen.getByText('다음 단계 추천 기회')).toBeTruthy();

    // 시연 도구: 7일 → 분노, 알림 발송
    fireEvent.change(document.getElementById('days'), { target: { value: '7' } });
    expect(document.querySelector('.phone .mascot').getAttribute('data-mood')).toBe('angry');
    expect(document.querySelector('.push')).toBeTruthy();

    // 추천 기회 → 상세
    fireEvent.click(screen.getByText('지역 축제 SNS 서포터즈 모집'));
    expect(screen.getByText('기회 상세')).toBeTruthy();
    expect(screen.getByText('지역 축제 사무국')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^스크랩$/ }));
    expect(screen.getByText('스크랩됨')).toBeTruthy();
  });

  it('기회 탭: 마감 숨김, 칩, 검색, 빠른 필터', () => {
    start();
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('기회'));
    expect(screen.getByText(/마감 지난 1건은 숨겼어요/)).toBeTruthy();
    expect(screen.queryByText('지역 상권 홍보 공모전')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '인턴' }));
    expect(document.querySelectorAll('.opp')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '전체' }));
    fireEvent.change(screen.getByLabelText('기회 검색'), { target: { value: '재단' } });
    expect(document.querySelectorAll('.opp')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('기회 검색'), { target: { value: '' } });
    fireEvent.click(screen.getByText('경험부터 쌓고 싶어요'));
    const types = [...document.querySelectorAll('.opp .tag')].map((e) => e.textContent);
    types.forEach((t) => expect(['서포터즈', '공모전', '프로젝트']).toContain(t));
  });

  it('내 경로 완료 → 설정에서 전공 변경 경고 → 초기화, 기기 저장', () => {
    start();
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('내 경로'));
    const boxes = screen.getAllByLabelText('완료로 표시');
    fireEvent.click(boxes[0]);
    fireEvent.click(boxes[1]);
    expect(screen.getByText('2 / 4단계 완료')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('oo-kiugi:v2')).done).toEqual([true, true, false, false]);

    fireEvent.click(screen.getByLabelText('설정'));
    fireEvent.click(screen.getByLabelText(/바이오메디컬/));
    expect(screen.getByText(/완료한 단계 2개가 초기화/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('연구형'));
    fireEvent.click(screen.getByText('저장'));
    expect(screen.getByText('0 / 4단계 완료')).toBeTruthy();

    // 다시 열어도 저장된 프로필로 시작
    cleanup();
    render(<App />);
    expect(document.querySelector('.brand').textContent).toBe('하늘 키우기');
  });
});
