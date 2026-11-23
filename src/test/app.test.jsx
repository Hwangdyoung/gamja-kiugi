import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import App from '../App.jsx';

// 이 파일은 로그인 없는(기기 저장) 흐름을 본다. .env.local 에 Supabase 키가 있어도 로그인은 끈다
vi.mock('../lib/auth.js', () => ({
  authEnabled: () => false,
  currentUser: async () => null,
  onAuthChange: () => () => {},
  signInOrUp: async () => ({}),
  pullProgress: async () => null,
  pushProgress: async () => {},
  pushEvent: () => {},
  signOut: async () => {},
}));
import { messageFor, moodOf } from '../lib/growth.js';
import { buildItems, ddayLabel, isOpen } from '../lib/opportunities.js';
import { deadlineSchedule, notificationPlan, notificationSchedule, notifyDecision, openingSchedule, urgentSaved } from '../lib/notify.js';
import { resumeText } from '../lib/resume.js';
import { dailyWater, earn, emptyCare, give, isSleepTime, vitalOf } from '../lib/care.js';
import { MAJORS, TYPES } from '../lib/data.js';
import { migrateDone, progressOf, roadmap } from '../lib/roadmap.js';
import { BUNDLED, cachedData, fetchLatest, isValidData } from '../lib/opportunityData.js';
import { fetchWeather, timeOfDay, weatherKind } from '../lib/weather.js';
import { summary, track, trackOpen } from '../lib/metrics.js';
import { dayKey, monthEvents, monthGrid } from '../lib/calendar.js';

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
  it('주어는 늘 감자이고, 다 기록해도 "취업 성공"이 아니라 "지원서 써 보자"로 끝난다', () => {
    const profile = { name: '하늘', school: '한림대학교', grade: 2, major: 'bio', track: 'res' };
    const none = progressOf(profile, {});
    const all = Object.fromEntries(none.stages.flatMap((s) => s.tasks).map((t) => [t.id, { note: '함', at: null }]));
    expect(messageFor('happy', { progress: none })).toBe('감자가 오늘도 성장 중!');
    expect(messageFor('annoyed', { progress: none })).toBe('2학년 할 일 아직이야? 이대로 졸업할 거야?');
    expect(messageFor('angry', { progress: progressOf(profile, all) })).toBe('감자가 화났다. 새 기회 확인하러 와.');
    expect(messageFor('happy', { progress: progressOf(profile, all) })).toBe('감자가 다 컸다. 이 기록으로 지원서 써 보자.');
  });
  it('학년별 로드맵: 학년마다 할 일 3개(내 직무 1 + 공통 2), 지금 학년부터 다음 할 일을 고른다', () => {
    const profile = { name: 'a', school: '강원대학교', grade: 3, major: 'dmc', track: 'mkt' };
    const stages = roadmap(profile);
    expect(stages.map((s) => s.tasks.length)).toEqual([3, 3, 3, 3]);
    expect(stages.map((s) => s.tasks.filter((t) => t.own).length)).toEqual([1, 1, 1, 1]);
    const p = progressOf(profile, {});
    expect([p.current, p.next.stage, p.next.task.id]).toEqual([2, 2, 'dmc.mkt.g3']);
    // 지금 학년과 뒤 학년을 다 하면, 지나간 학년의 안 한 일로 돌아간다
    const log = Object.fromEntries([...stages[2].tasks, ...stages[3].tasks].map((t) => [t.id, { note: 'x', at: null }]));
    expect(progressOf(profile, log).next.stage).toBe(0);
    expect(progressOf(profile, log).grow).toBe(2);
    // 이력서 초안: 남긴 기록만, 학년 순서로
    const text = resumeText(profile, progressOf(profile, { 'dmc.mkt.g1': { note: '카드뉴스 3편', at: '2026-06-20T03:00:00Z' } }), { 'dmc.mkt.g1': { note: '카드뉴스 3편', at: '2026-06-20T03:00:00Z' } });
    expect(text).toContain('■ 1학년 · 탐색\n- (서포터즈) 지역 기관 SNS 서포터즈: 카드뉴스 3편 (2026.6)');
    expect(text).not.toContain('2학년');
    // 예전 4단계 체크는 내 직무 할 일 기록으로 옮긴다
    expect(Object.keys(migrateDone(profile, [true, false, true, false]))).toEqual(['dmc.mkt.g1', 'dmc.mkt.g3']);
  });
  it('표정이 바뀌는 날과, 분노 이후 주 1회만 알림을 보낸다', () => {
    const sendDays = Array.from({ length: 22 }, (_, d) => d).filter((d) => notifyDecision(d, true).send);
    expect(sendDays).toEqual([2, 4, 7, 14, 21]);
    expect(notifyDecision(4, false).send).toBe(false);
  });
  it('iPhone 앱이 예약할 4주 치 알림: 날짜·표정·문구', () => {
    const plan = notificationSchedule({ progress: progressOf({ name: 'a', grade: 2, major: 'dmc', track: 'mkt' }, {}) });
    expect(plan.map((p) => [p.day, p.mood])).toEqual([
      [2, 'neutral'], [4, 'annoyed'], [7, 'angry'], [14, 'angry'], [21, 'angry'], [28, 'angry'],
    ]);
    expect(plan[1].body).toBe('2학년 할 일 아직이야? 이대로 졸업할 거야?');
    expect(plan[2].body).toBe('감자가 화났다. 새 기회 확인하러 와.');
  });
});

describe('감자 돌보기: 물·햇빛·거름은 진로 행동으로만 생긴다', () => {
  it('물은 하루 한 번, 햇빛·거름은 같은 행동에 한 번만, 주면 기운이 오르고 하루마다 빠진다', () => {
    const d1 = new Date(2026, 10, 20, 12);
    let c = dailyWater(emptyCare(), d1);
    expect(dailyWater(c, new Date(2026, 10, 20, 18)).stock.water).toBe(1);
    c = earn(c, 'sun', 'src:a').care;
    const again = earn(c, 'sun', 'src:a');
    expect([c.stock.sun, again.got]).toEqual([1, false]);
    c = earn(c, 'compost', 'rec:x').care;
    c = give(c, 'compost', d1);
    expect([c.stock.compost, c.vital]).toEqual([0, 95]);
    expect(give(c, 'compost', d1)).toBeNull();
    expect(vitalOf(c, new Date(2026, 10, 23, 12))).toBe(59);
    expect([isSleepTime(new Date(2026, 10, 20, 23, 30)), isSleepTime(new Date(2026, 10, 20, 12))]).toEqual([true, false]);
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
    const progress = progressOf({ name: 'a', grade: 1, major: 'dmc', track: 'mkt' }, {});
    const plan = notificationPlan({ progress, items, saved: { A: true, 지난: true }, now });
    const days = plan.map((p) => Math.round((p.at - today.getTime()) / 86400000 - 10 / 24));
    expect(days).toEqual([1, 2, 4, 7, 14, 21, 28]);
    expect(plan.filter((p) => p.kind === 'due').map((p) => p.body)).toEqual([
      "내일 마감이야! '지난' 지금 확인해.",
      "감자가 조마조마해. 'A' 마감 3일 남았어.",
      "내일 마감이야! 'A' 지금 확인해.",
    ]);
  });

  it('알림 세부 설정: 미접속 알림만 끄기, 보내는 시각 바꾸기, 정기 모집이 열리는 달 1일 알림', () => {
    const progress = progressOf({ name: 'a', grade: 1, major: 'dmc', track: 'mkt' }, {});
    const items = [item('A', 5)];
    const noAway = notificationPlan({ progress, items, saved: { A: true }, now, prefs: { away: false, due: true, hour: 19 } });
    expect(noAway.map((p) => [p.kind, new Date(p.at).getHours()])).toEqual([['due', 19], ['due', 19]]);
    expect(notificationPlan({ progress, items, saved: { A: true }, now, prefs: { away: true, due: false, hour: 10 } }).every((p) => p.kind === 'away')).toBe(true);
    const periodic = { id: 'P', title: '간호사 공채', deadline: null, months: [12] };
    const open = openingSchedule([periodic], { P: true }, now);
    expect(open.map((p) => [new Date(p.at), p.body])).toEqual([[new Date(2026, 11, 1, 10), "감자가 챙겨 왔어. '간호사 공채' 이번 달에 모집이 열려."]]);
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
  it('학교 재학생 전용 기회는 내 학교일 때만 보이고 "우리 학교"로 표시한다', () => {
    const at = new Date(2026, 10, 18);
    const knu = buildItems({ name: 'a', school: '강원대학교', major: 'dmc', track: 'mkt' }, at);
    const hallym = buildItems({ name: 'a', school: '한림대학교', major: 'dmc', track: 'mkt' }, at);
    expect(knu.find((it) => it.id === 'knu-rise-supporters').ours).toBe(true);
    expect(hallym.find((it) => it.id === 'knu-rise-supporters')).toBeUndefined();
    expect(hallym.find((it) => it.id === 'cc-talent-supporters').stepTitle).toBe('1학년 · 지역 기관 SNS 서포터즈');
  });
  it('마감 지난 기회는 열린 기회에서 빠진다', () => {
    const today = new Date(2026, 10, 16);
    const contest = { id: 'x', title: '지난 공모전', deadline: new Date(2026, 7, 31) };
    expect(ddayLabel(contest, today)).toBe('마감');
    expect(isOpen(contest, today)).toBe(false);
    expect(isOpen({ ...contest, deadline: new Date(2026, 10, 16) }, today)).toBe(true);
    expect(isOpen({ ...contest, deadline: null }, today)).toBe(true);
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

describe('홈 배경: 시각·날씨', () => {
  it('시각은 새벽·낮·노을·밤, 날씨 코드는 맑음·흐림·비·눈으로', () => {
    const at = (h) => new Date(2026, 10, 20, h, 30);
    expect([at(6), at(12), at(18), at(21), at(2)].map(timeOfDay)).toEqual(['dawn', 'day', 'dusk', 'night', 'night']);
    expect([0, 2, 3, 45, 61, 81, 95, 71, 86].map(weatherKind)).toEqual(['clear', 'clear', 'cloudy', 'cloudy', 'rain', 'rain', 'rain', 'snow', 'snow']);
  });
  it('춘천 날씨를 받아 30분 저장, 못 받으면 null', async () => {
    localStorage.clear();
    let calls = 0;
    const ok = async (url) => {
      calls++;
      expect(url).toContain('latitude=37.88');
      return { ok: true, json: async () => ({ current: { weather_code: 63, temperature_2m: 4.6 } }) };
    };
    expect(await fetchWeather(ok)).toEqual({ kind: 'rain', temp: 5 });
    expect(await fetchWeather(ok)).toEqual({ kind: 'rain', temp: 5 });
    expect(calls).toBe(1);
    localStorage.clear();
    expect(await fetchWeather(async () => { throw new Error('offline'); })).toBeNull();
  });
});

describe('나 → 일정(달력)', () => {
  it('달 칸은 일요일부터, 앞뒤는 빈칸으로 7칸씩 채운다', () => {
    const cells = monthGrid(2026, 10); // 2026년 11월 1일은 일요일
    expect(cells.length % 7).toBe(0);
    expect(dayKey(cells[0])).toBe('2026-11-01');
    expect(cells.filter(Boolean)).toHaveLength(30);
    const feb = monthGrid(2027, 1); // 2027년 2월 1일은 월요일
    expect(feb[0]).toBeNull();
    expect(dayKey(feb[1])).toBe('2027-02-01');
  });

  it('스크랩한 기회의 마감일, 정기 모집이 열리는 달 1일, 기록한 날을 그 달에만 올린다', () => {
    const all = [
      { id: 'a', title: '스크랩한 공모전', org: '춘천시', type: '공모전', deadline: new Date(2026, 10, 20) },
      { id: 'b', title: '스크랩 안 한 공모전', org: '춘천시', type: '공모전', deadline: new Date(2026, 10, 21) },
      { id: 'c', title: '1월 정기 기자단', org: '부처', type: '서포터즈', deadline: null, months: [1], when: '매년 1월 모집' },
    ];
    const stages = [{ grade: 1, tasks: [{ id: 't1', t: '진로·직무 상담 받기' }] }];
    const log = { t1: { note: '상담 받음', at: new Date(2026, 10, 18, 15).toISOString() }, gone: { at: new Date(2026, 10, 18).toISOString() } };
    const nov = monthEvents({ year: 2026, month: 10, all, saved: { a: true }, log, stages });
    expect(Object.keys(nov).sort()).toEqual(['2026-11-18', '2026-11-20']);
    expect(nov['2026-11-20']).toEqual([{ kind: 'due', id: 'a', title: '스크랩한 공모전', sub: '춘천시 · 공모전' }]);
    expect(nov['2026-11-18'][0]).toMatchObject({ kind: 'rec', title: '진로·직무 상담 받기', sub: '1학년 · 상담 받음' });
    const jan = monthEvents({ year: 2027, month: 0, all, saved: { a: true }, log, stages });
    expect(jan).toEqual({ '2027-01-01': [{ kind: 'open', id: 'c', title: '1월 정기 기자단', sub: '매년 1월 모집' }] });
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
    // 감자 얼굴 시작 화면(처음이라 자기소개) → 1쪽 소개 → 시작하기 → 2쪽 나를 알려줘
    expect(screen.getByText('안녕, 나는 감자!')).toBeTruthy();
    fireEvent.click(screen.getByText('시작하기'));
    fireEvent.click(screen.getByText('시작하기'));
    fireEvent.click(screen.getByText('감자 키우기 시작'));
    expect(screen.getByRole('alert').textContent).toBe('이름을 입력해 주세요.');
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: name } });
    expect(document.querySelector('.hero-bubble').textContent).toContain(`${name}, 춘천에서도 같이 커 보자.`);
    fireEvent.change(screen.getByLabelText('학교'), { target: { value: '한림대학교' } });
    fireEvent.click(screen.getByText('감자 키우기 시작'));
    expect(screen.getByRole('alert').textContent).toBe('학년을 선택해 주세요.');
    fireEvent.change(screen.getByLabelText('학년'), { target: { value: '1' } });
    // 계열 12개 중 고르기
    expect(screen.getByLabelText('계열').querySelectorAll('option')).toHaveLength(13);
    fireEvent.change(screen.getByLabelText('계열'), { target: { value: 'dmc' } });
    fireEvent.click(screen.getByLabelText('마케팅형'));
    fireEvent.click(screen.getByText('감자 키우기 시작'));
    // 처음 홈에 오면 감자 사용법 안내가 하나씩 나온다 (건너뛰면 다시 안 나옴)
    expect(screen.getByRole('dialog', { name: '감자 사용법' })).toBeTruthy();
    expect(screen.getByText('나를 눌러 봐!')).toBeTruthy();
    fireEvent.click(screen.getByText('그냥 넘기기'));
    expect(screen.getByText('물 · 햇빛 · 거름')).toBeTruthy();
    fireEvent.click(screen.getByText('건너뛰기'));
    expect(screen.queryByRole('dialog', { name: '감자 사용법' })).toBeNull();
  };

  it('시작 설정 → 홈 → 기회 상세 → 스크랩', () => {
    start();
    expect(document.querySelector('.brand').textContent).toBe('감자 키우기');
    expect(screen.getByText('감자가 오늘도 성장 중!')).toBeTruthy();
    expect(document.querySelector('.float-title').textContent).toBe('지역 기관 SNS 서포터즈');
    expect(document.querySelector('.home-hi').textContent).toBe('하늘, 1학년엔 이것부터 해 볼까?');

    // 살아 있는 감자: 누르면 한마디, 첫 접속 물 1개를 주면 고마워한다, 햇빛이 없으면 얻는 법을 알려준다
    fireEvent.click(screen.getByLabelText('감자 쓰다듬기'));
    expect(document.querySelector('.home-bubble').textContent).toBe('왜 불러?');
    fireEvent.click(screen.getByLabelText('물 주기, 1개 있음'));
    expect(document.querySelector('.home-bubble').textContent).toBe('물 맛 좋다~');
    expect(screen.getByLabelText('물 주기, 0개 있음')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('햇빛 주기, 0개 있음'));
    expect(document.querySelector('.home-bubble').textContent).toBe('햇빛은 기회 원문을 열거나 스크랩하면 생겨.');

    // 시연 도구: 7일 → 분노, 알림 발송
    fireEvent.change(document.getElementById('days'), { target: { value: '7' } });
    expect(document.querySelector('.phone .mascot').getAttribute('data-mood')).toBe('angry');
    expect(document.querySelector('.push')).toBeTruthy();

    // 기회 탭 → 상세
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('기회'));
    fireEvent.click(screen.getByText('춘천인재육성장학재단 서포터즈'));
    expect(screen.getByText('기회 상세')).toBeTruthy();
    expect(screen.getByText('(재)춘천인재육성장학재단')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^스크랩$/ }));
    expect(screen.getByText('스크랩됨')).toBeTruthy();
    // 처음 스크랩하면 햇빛 1개
    expect(screen.getByText('햇빛 1개를 받았어요. 홈에서 감자에게 줘 보세요.')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('oo-kiugi:v2')).care.stock).toMatchObject({ water: 0, sun: 1 });
  });

  it('기회 탭: 마감 숨김, 칩, 검색, 빠른 필터', () => {
    start();
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('기회'));
    // 지금 데이터엔 마감 지난 기회가 없어서 숨김 안내도 없다 (숨기는 규칙은 위 '마감 지난 기회' 테스트)
    expect(screen.queryByText(/마감 지난 \d+건은 숨겼어요/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '인턴' }));
    expect(document.querySelectorAll('.opp')).toHaveLength(2);
    // 유형은 여러 개 같이: 인턴 + 서포터즈
    fireEvent.click(screen.getByRole('button', { name: '서포터즈' }));
    const both = [...document.querySelectorAll('.opp .tag:not(.online)')].map((e) => e.textContent);
    expect(both.length).toBeGreaterThan(2);
    both.forEach((t) => expect(['인턴', '서포터즈']).toContain(t));
    expect(screen.getByRole('button', { name: '전체' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: '전체' }));
    fireEvent.change(screen.getByLabelText('기회 검색'), { target: { value: '재단' } });
    expect(document.querySelectorAll('.opp')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('기회 검색'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('tab', { name: '경험 쌓기' }));
    expect(screen.queryByRole('button', { name: '인턴' })).toBeNull();
    const types = [...document.querySelectorAll('.opp .tag:not(.online)')].map((e) => e.textContent);
    types.forEach((t) => expect(['서포터즈', '공모전', '프로젝트']).toContain(t));
  });

  it('로드맵: 할 일에 한 줄 기록 → 감자 성장, 계열을 바꿔도 공통 기록은 남는다, 기기 저장', () => {
    start();
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('로드맵'));
    expect(screen.getByRole('tab', { name: /로드맵/ }).textContent).toBe('로드맵0/12');
    // 1~4학년 정류장이 흙길로 이어진 지도. 지금 학년(1학년) 정류장이 골라져 있고 감자가 서 있다. 할 일은 지도 아래
    expect(screen.getByRole('button', { name: /^1학년 탐색, 0\/3, 지금 학년/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /^2학년 첫 경험/ }).getAttribute('aria-pressed')).toBe('false');
    expect(document.querySelector('.rmap-potato .mascot-wrap')).toBeTruthy();
    expect(screen.getByText('지원서 쓰기')).toBeTruthy();
    ['지역 기관 SNS 서포터즈', '진로·직무 상담 받기', '관심 직무 채용 공고 3개 읽기'].forEach((title, k) => {
      if (k > 0) fireEvent.click(screen.getByText(title));
      fireEvent.click(screen.getByText('했어요 · 한 줄 남기기'));
      const input = screen.getByPlaceholderText(/뭘 했고 뭐가 남았나요/);
      fireEvent.change(input, { target: { value: `기록 ${k + 1}` } });
      fireEvent.click(screen.getByText('기록하기'));
    });
    expect(screen.getByRole('tab', { name: /로드맵/ }).textContent).toBe('로드맵3/12');
    expect(screen.getByRole('button', { name: /^1학년 탐색, 3\/3/ }).classList.contains('done')).toBe(true);
    // 다른 학년 정류장을 누르면 지도 아래가 그 학년 할 일로 바뀐다
    fireEvent.click(screen.getByRole('button', { name: /^2학년 첫 경험/ }));
    expect(screen.getByText('보여줄 결과물 하나 만들기')).toBeTruthy();
    // 내 기록 탭: 학년별로 모아 본다
    fireEvent.click(screen.getByRole('tab', { name: /내 기록/ }));
    expect(screen.getByText('기록 1')).toBeTruthy();
    expect(screen.getByText('이력서 초안으로 복사')).toBeTruthy();
    expect(Object.keys(JSON.parse(localStorage.getItem('oo-kiugi:v2')).log)).toEqual(['dmc.mkt.g1', 'g1-counsel', 'g1-posts']);
    // 기록 3개마다 감자 머리 위 싹이 한 칸 자란다
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByLabelText('홈'));
    expect(document.querySelector('.phone .sprout').getAttribute('data-grow')).toBe('1');
    expect(screen.getByText('새싹 감자')).toBeTruthy();

    // 나 탭: 감자·이름 머리 · 성장 카드 · 스크랩/일정, 설정은 톱니
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByText('나'));
    expect(document.querySelector('.me-name h2').textContent).toBe('하늘');
    expect(screen.getByRole('progressbar', { name: '내 기록' }).getAttribute('aria-valuenow')).toBe('3');
    expect(screen.getByText('새싹 감자', { selector: '.me-stage' })).toBeTruthy();
    // 다음 할 일 카드와 최근 기록 두 줄
    expect(screen.getByRole('region', { name: '다음 할 일' })).toBeTruthy();
    expect(document.querySelectorAll('.me-recent li')).toHaveLength(2);
    // 스크랩·일정·설정은 오른쪽 위 아이콘으로 연다
    fireEvent.click(screen.getByLabelText('스크랩 0개'));
    expect(screen.getByText('아직 스크랩한 기회가 없어요.', { exact: false })).toBeTruthy();
    fireEvent.click(screen.getByLabelText('나로 돌아가기'));
    // 일정: 이 달 달력에 오늘(11/18) 남긴 기록 3개가 찍히고, 날짜를 누르면 그날 것만
    fireEvent.click(screen.getByLabelText('일정'));
    expect(screen.getByText('2026년 11월')).toBeTruthy();
    expect(screen.getByLabelText('11월 18일, 기록 3개')).toBeTruthy();
    expect(document.querySelectorAll('.cal-item')).toHaveLength(3);
    fireEvent.click(screen.getByLabelText('11월 17일'));
    expect(screen.getByText('이날은 일정이 없어요.', { exact: false })).toBeTruthy();
    // 두 달 뒤 1월: 내 경로의 정기 모집(1월)이 1일에 열린다
    fireEvent.click(screen.getByLabelText('다음 달'));
    fireEvent.click(screen.getByLabelText('다음 달'));
    expect(screen.getByText('2027년 1월')).toBeTruthy();
    expect(screen.getByLabelText('1월 1일, 모집 열림 2개')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('나로 돌아가기'));
    fireEvent.click(screen.getByLabelText('설정'));
    // 알림 세부 설정·화면 모드
    fireEvent.click(screen.getByRole('radio', { name: '어둡게' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByLabelText('미접속 알림'));
    expect(JSON.parse(localStorage.getItem('oo-kiugi:v2')).prefs).toMatchObject({ away: false, due: true, theme: 'dark' });
    fireEvent.click(screen.getByLabelText('나로 돌아가기'));
    fireEvent.click(screen.getByLabelText('내 정보 수정'));
    fireEvent.change(screen.getByLabelText('계열'), { target: { value: 'bio' } });
    fireEvent.click(screen.getByLabelText('연구형'));
    fireEvent.click(screen.getByText('저장'));
    fireEvent.click(within(screen.getByLabelText('하단 탭')).getByLabelText('홈'));
    expect(screen.getByText('기록 2 / 12')).toBeTruthy();

    // 다시 열면 감자가 이름을 불러 반기고, 시작하기를 누르면 저장된 프로필로 시작
    cleanup();
    render(<App />);
    expect(screen.getByText('반가워, 하늘!')).toBeTruthy();
    fireEvent.click(screen.getByText('시작하기'));
    expect(document.querySelector('.brand').textContent).toBe('감자 키우기');
  });
});
