import { MAJORS } from './data.js';

/* 학년별 로드맵 (11/19 개편)
   "4단계 체크하면 직장인"이 아니라, 학교 다니는 4년 동안 학년마다 할 만한 일을 보여 준다.
   - 학년(단계)마다 할 일 3개: 내 직무에 맞춘 활동 1개(data.js의 levels) + 누구나 해야 할 공통 2개
   - 할 일을 끝내면 "뭘 했고 뭐가 남았는지" 한 줄을 남긴다. 이 기록이 4학년 때 이력서의 재료가 된다
   - 마지막은 "취업 성공"이 아니라 "이 기록으로 지원서를 쓴다". 붙는 건 그다음 이야기 */
export const STAGES = [
  { grade: 1, label: '탐색', goal: '어떤 일이 있고, 그 일에 뭐가 필요한지 알아봐요.' },
  { grade: 2, label: '첫 경험', goal: '작게라도 직접 해 보고, 보여줄 결과물을 하나 남겨요.' },
  { grade: 3, label: '실무', goal: '현장에서 일해 보고, 공고가 요구하는 역량을 채워요.' },
  { grade: 4, label: '정리·지원', goal: '남긴 기록으로 지원서를 쓰고 지원해요. 붙는 건 그다음 이야기예요.' },
];

const C = (key, tag, t, d) => ({ key, tag, t, d });
const COMMON = {
  1: [
    C('counsel', '상담', '진로·직무 상담 받기', '학교 대학일자리플러스센터나 학과 상담에서 내 계열로 갈 수 있는 직무를 물어봐요.'),
    C('posts', '공고 읽기', '관심 직무 채용 공고 3개 읽기', '실제 공고가 뭘 요구하는지(전공, 경험, 자격) 적어 봐요. 지역은 상관없어요.'),
  ],
  2: [
    C('output', '결과물', '보여줄 결과물 하나 만들기', '글, 영상, 보고서, 코드 무엇이든 남에게 보여줄 수 있는 걸 하나 남겨요.'),
    C('campus', '비교과', '학교 비교과 프로그램 하나 참여', '진로 캠프, 특강, 멘토링 중 하나를 골라 해 봐요.'),
  ],
  3: [
    C('skill', '역량', '공고에 자주 나온 도구·자격 하나 익히기', '1학년 때 읽은 공고를 다시 보고, 자주 나온 것 하나를 시작해요.'),
    C('senior', '선배', '현직 선배 한 명에게 묻기', '선배 이야기나 학과 동문에게 실제로 하는 일과 준비할 것을 물어봐요.'),
  ],
  4: [
    C('resume', '정리', '기록 모아 이력서·포트폴리오 쓰기', '지금까지 남긴 한 줄 기록이 이력서의 재료예요.'),
    C('where', '지원 전략', '지원할 곳 정하기', '강원 공고와 다른 지역 공고를 비교해 어디에 낼지 정해요.'),
  ],
};

/* 프로필의 로드맵: [{ grade, label, goal, tasks: [{ id, tag, t, d, own }] }] */
export function roadmap(profile) {
  const track = profile ? MAJORS[profile.major]?.tracks[profile.track] : null;
  if (!track) return [];
  return STAGES.map((s, i) => {
    const own = { ...track.levels[i], id: `${profile.major}.${profile.track}.g${s.grade}`, own: true };
    const common = COMMON[s.grade].map((c) => ({ id: `g${s.grade}-${c.key}`, tag: c.tag, t: c.t, d: c.d, own: false }));
    // 4학년은 기록 정리 → 직무 지원 → 지원할 곳 순서
    const tasks = s.grade === 4 ? [common[0], own, common[1]] : [own, ...common];
    return { ...s, tasks };
  });
}

export const GRADES = [
  { value: 1, label: '1학년' },
  { value: 2, label: '2학년' },
  { value: 3, label: '3학년' },
  { value: 4, label: '4학년 이상' },
];

/* 진행 상황. log = { [할 일 id]: { note, at } }
   - current: 지금 학년의 단계(학년을 모르면 아직 덜 한 첫 단계)
   - next: 다음에 할 일. 지금 학년 → 그 뒤 학년 → 지나간 학년에서 안 한 것 순서로 찾는다 */
export function progressOf(profile, log = {}) {
  const stages = roadmap(profile);
  const isDone = (t) => !!log[t.id];
  const total = stages.reduce((n, s) => n + s.tasks.length, 0);
  const count = stages.reduce((n, s) => n + s.tasks.filter(isDone).length, 0);
  const firstOpen = stages.findIndex((s) => s.tasks.some((t) => !isDone(t)));
  const current = profile?.grade ? Math.min(profile.grade, 4) - 1 : Math.max(firstOpen, 0);
  const order = [...stages.keys()].filter((i) => i >= current).concat([...stages.keys()].filter((i) => i < current));
  let next = null;
  for (const i of order) {
    const task = stages[i].tasks.find((t) => !isDone(t));
    if (task) {
      next = { stage: i, task };
      break;
    }
  }
  return { stages, total, count, current, next, isDone, grow: Math.min(4, Math.floor(count / 3)) };
}

/* 예전 4단계 체크(done: [bool x4])를 기록으로 옮긴다. 기록 내용은 비어 있다 */
export function migrateDone(profile, done) {
  const log = {};
  if (!profile || !Array.isArray(done)) return log;
  done.forEach((v, i) => {
    if (v) log[`${profile.major}.${profile.track}.g${i + 1}`] = { note: '', at: null };
  });
  return log;
}
