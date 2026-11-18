import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import App from '../App.jsx';
import { messageFor, moodOf } from '../lib/growth.js';
import { buildItems, ddayLabel, isOpen } from '../lib/opportunities.js';
import { deadlineSchedule, notificationPlan, notificationSchedule, notifyDecision, urgentSaved } from '../lib/notify.js';
import { MAJORS, TYPES } from '../lib/data.js';
import { BUNDLED, cachedData, fetchLatest, isValidData } from '../lib/opportunityData.js';
import { summary, track, trackOpen } from '../lib/metrics.js';

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
  it('사용자 이름과 상관없이 주어는 감자이고, 4단계를 마치면 직무별 축하 문구를 보여준다', () => {
    const track = MAJORS.bio.tracks.res;
    const all = [true, true, true, true];
    expect(messageFor('happy', { name: '하늘', done: [false, false, false, false], track })).toBe('감자가 오늘도 성장 중!');
    expect(messageFor('angry', { name: '지수', done: all, track })).toBe('감자가 화났다. 춘천 공고 확인하러 와.');
    expect(messageFor('happy', { name: '하늘', done: all, track })).toContain('연구자의 길');
  });
  it('표정이 바뀌는 날과, 분노 이후 주 1회만 알림을 보낸다', () => {
    const sendDays = Array.from({ length: 22 }, (_, d) => d).filter((d) => notifyDecision(d, true).send);
    expect(sendDays).toEqual([2, 4, 7, 14, 21]);
    expect(notifyDecision(4, false).send).toBe(false);
  });
  it('iPhone 앱이 예약할 4주 치 알림: 날짜·표정·문구', () => {
    const plan = notificationSchedule({ done: [true, false, false, false], track: MAJORS.dmc.tracks.mkt });
    expect(plan.map((p) => [p.day, p.mood])).toEqual([
      [2, 'neutral'], [4, 'annoyed'], [7, 'angry'], [14, 'angry'], [21, 'angry'], [28, 'angry'],
    ]);
    expect(plan[1].body).toBe('2단계 아직이야? 서울 갈 거야?');
    expect(plan[2].body).toBe('감자가 화났다. 춘천 공고 확인하러 와.');
  });
});

describe('마감 임박 알림 (P1)', () => {
  const now = new Date(2026, 10, 16, 12, 0);
  const today = new Date(2026, 10, 16);
  const item = (id, dueDays) => ({ id, title: id, deadline: dueDays == null ? null : new Date(2026, 10, 16 + dueDays) });

  it('스크랩한 기회만, 마감 3일 전·하루 전 오전 10시에 알린다', () => {
    const items = [item('A', 10), item('B', 10), item('상시', null)];
    const plan = deadlineSchedule(items, { A: true, 상시: true }, now);
    expect(plan.map((p) => new Date(p.at))).toEqual([new Date(2026, 10, 23, 10), new Date(2026, 10, 25, 10)]);
    expect(plan[1].body).toBe("내일 마감이야! 'A' 지금 확인해.");
  });

  it('이미 지난 알림 시각은 빼고, 미접속 알림과 같은 날이면 하루 한 번만 (마감 알림 우선)', () => {
    // 마감 5일 뒤 → 3일 전 = 2일째(미접속 무표정 알림과 같은 날), 하루 전 = 4일째(짜증 알림과 같은 날)
    const items = [item('A', 5), item('지난', 2)];
    const plan = notificationPlan({ done: [false, false, false, false], track: MAJORS.dmc.tracks.mkt, items, saved: { A: true, 지난: true }, now });
    const days = plan.map((p) => Math.round((p.at - today.getTime()) / 86400000 - 10 / 24));
    expect(days).toEqual([1, 2, 4, 7, 14, 21, 28]);
    expect(plan.filter((p) => p.kind === 'due').map((p) => p.body)).toEqual([
      "내일 마감이야! '지난' 지금 확인해.",
      "감자가 조마조마해. 'A' 마감 3일 남았어.",
      "내일 마감이야! 'A' 지금 확인해.",
    ]);
  });

  it('홈에는 스크랩한 기회 중 마감 3일 이내만 보인다', () => {
    const items = [item('A', 2), item('B', 5), item('C', 0)];
    expect(urgentSaved(items, { A: true, B: true, C: true }, today).map((i) => i.id)).toEqual(['C', 'A']);
  });
});

describe('기회 데이터', () => {
  it('모든 기회 유형은 기획안의 6가지 칩 중 하나다', () => {
    Object.values(MAJORS).forEach((m) =>
      Object.values(m.tracks).forEach((t) =>
        expect(t.levels).toHaveLength(4),
      ),
    );
    BUNDLED.opportunities.forEach((o) => expect(TYPES).toContain(o.type));
    expect(isValidData(BUNDLED)).toBe(true);
  });
  it('JSON 데이터: 모양이 틀린 파일은 버리고, 받은 최신 파일로 목록을 만든다', async () => {
    expect(isValidData({ opportunities: [], paths: {} })).toBe(false);
    expect(isValidData({ ...BUNDLED, opportunities: [{ ...BUNDLED.opportunities[0], type: '이상한유형' }] })).toBe(false);
    const fresh = structuredClone(BUNDLED);
    fresh.opportunities[0].title = '새로 바뀐 공고';
    const d = await fetchLatest({ fetchImpl: async () => ({ ok: true, json: async () => fresh }) });
    expect(d).toEqual(fresh);
    expect(cachedData()).toEqual(fresh);
    const first = fresh.opportunities[0].id;
    const items = buildItems({ name: 'a', major: 'dmc', track: 'mkt' }, new Date(2026, 10, 18), d);
    expect(items.find((it) => it.id === first).title).toBe('새로 바뀐 공고');
    expect(await fetchLatest({ fetchImpl: async () => { throw new Error('offline'); } })).toBeNull();
  });
  it('마감 지난 기회는 열린 기회에서 빠진다', () => {
    const today = new Date(2026, 10, 16);
    const items = buildItems({ name: 'a', major: 'dmc', track: 'mkt' }, today);
    const contest = items.find((it) => it.title === '2026 춘천 디카시 공모전');
    expect(ddayLabel(contest, today)).toBe('마감');
    expect(isOpen(contest, today)).toBe(false);
  });
});

describe('테스트 지표 (기획안 11장)', () => {
  it('원문 조회, 스크랩, 접속일, 7일 재방문, 마감 알림 뒤 원문 조회를 센다', () => {
    const d0 = new Date(2026, 10, 1, 12).getTime();
    const day = 86400000;
    trackOpen(d0);
    track('onboarding_done', {}, d0);
    track('save', { id: 'a', on: true }, d0);
    track('save', { id: 'b', on: true }, d0);
    track('save', { id: 'b', on: false }, d0);
    track('source_open', { id: 'a' }, d0);
    trackOpen(d0 + 3 * day);
    track('notification_open', { kind: 'due', id: 'a' }, d0 + 8 * day);
    trackOpen(d0 + 8 * day);
    track('source_open', { id: 'a' }, d0 + 8 * day + 60000);
    const m = summary();
    expect(m).toMatchObject({ onboardingDone: true, saved: 1, sourceOpens: 2, sourceOpenedItems: 1, openDays: 3, returnedAfter7Days: true, notificationOpens: 1, dueNotificationThenSource: 1 });
  });
});

describe('화면 흐름', () => {
  // 기회 마감일이 실제 날짜라서, 조사한 날(2026.11.18) 기준으로 화면을 확인한다
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 18, 12));
  });
  afterEach(() => vi.useRealTimers());

  const start = (name = '하늘') => {
    render(<App />);
    fireEvent.click(screen.getByText('감자 키우기 시작'));
    expect(screen.getByRole('alert').textContent).toBe('이름을 입력해 주세요.');
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: name } });
    expect(document.querySelector('.brand-lg').textContent).toBe('감자 키우기');
    expect(document.querySelector('.hero-bubble').textContent).toContain(`${name}, 같이 춘천에서 커 보자.`);
    fireEvent.click(screen.getByLabelText(/디지털미디어콘텐츠/));
    fireEvent.click(screen.getByLabelText('마케팅형'));
    fireEvent.click(screen.getByText('감자 키우기 시작'));
  };

  it('시작 설정 → 홈 → 기회 상세 → 스크랩', () => {
    start();
    expect(document.querySelector('.brand').textContent).toBe('감자 키우기');
    expect(screen.getByText('감자가 오늘도 성장 중!')).toBeTruthy();
    expect(screen.getByText('다음 단계 추천 기회')).toBeTruthy();

    // 시연 도구: 7일 → 분노, 알림 발송
    fireEvent.change(document.getElementById('days'), { target: { value: '7' } });
    expect(document.querySelector('.phone .mascot').getAttribute('data-mood')).toBe('angry');
    expect(document.querySelector('.push')).toBeTruthy();

    // 추천 기회 → 상세
    fireEvent.click(screen.getByText('춘천인재육성장학재단 서포터즈'));
    expect(screen.getByText('기회 상세')).toBeTruthy();
    expect(screen.getByText('(재)춘천인재육성장학재단')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^스크랩$/ }));
    expect(screen.getByText('스크랩됨')).toBeTruthy();
  });

  it('기회 탭: 마감 숨김, 칩, 검색, 빠른 필터', () => {
    start();
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('기회'));
    expect(screen.getByText(/마감 지난 1건은 숨겼어요/)).toBeTruthy();
    expect(screen.queryByText('2026 춘천 디카시 공모전')).toBeNull();
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
    // 단계를 마친 만큼 홈 감자 머리 위에 싹이 자란다
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('홈'));
    expect(document.querySelector('.phone .sprout').getAttribute('data-grow')).toBe('2');
    expect(screen.getByText('잎 난 감자')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('설정'));
    fireEvent.click(screen.getByLabelText(/바이오메디컬/));
    expect(screen.getByText(/완료한 단계 2개가 초기화/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText('연구형'));
    fireEvent.click(screen.getByText('저장'));
    expect(screen.getByText('0 / 4단계 완료')).toBeTruthy();

    // 다시 열어도 저장된 프로필로 시작
    cleanup();
    render(<App />);
    expect(document.querySelector('.brand').textContent).toBe('감자 키우기');
  });
});
