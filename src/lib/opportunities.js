import { MAJORS } from './data.js';
import { getTrack } from './growth.js';
import { STAGES } from './roadmap.js';
import { BUNDLED } from './opportunityData.js';

const DAY = 86400000;

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* 'YYYY-MM-DD' → 그날 0시(기기 시간). 없으면 null */
export function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/* 기회 카드 목록. 내 경로의 기회를 학년 순서대로, 같은 기회는 한 번만 모은다.
   각 기회에 실제 마감일(deadline)과 몇 학년 할 일인지(step: 0~3)를 붙인다.
   학교 재학생 전용 기회(school)는 내 학교일 때만 넣고 "우리 학교"로 표시한다. 학교를 모르면(예전 프로필) 그대로 둔다.
   data = 기회 데이터(src/data/opportunities.json 모양). 안 넘기면 앱에 넣은 기본값 */
export function buildItems(profile, today = startOfToday(), data = BUNDLED) {
  const track = getTrack(profile);
  if (!track) return [];
  const byId = new Map(data.opportunities.map((x) => [x.id, x]));
  const levels = data.paths[`${profile.major}.${profile.track}`] ?? [];
  const seen = new Set();
  const out = [];
  levels.forEach((ids, i) => {
    ids.forEach((id) => {
      const x = byId.get(id);
      if (!x || seen.has(id)) return;
      if (x.school && profile.school && x.school !== profile.school) return;
      seen.add(id);
      out.push({
        id,
        title: x.title,
        type: x.type,
        org: x.org,
        target: x.target,
        deadline: parseDate(x.due),
        src: x.src,
        when: x.when ?? null,
        months: x.months ?? [],
        online: x.where === '온라인',
        ours: !!x.school && x.school === profile.school,
        step: i,
        stepTitle: `${STAGES[i].grade}학년 · ${track.levels[i]?.t ?? ''}`,
      });
    });
  });
  return out;
}

/* 남은 일수. 상시 모집이면 null */
export function daysLeft(item, today = startOfToday()) {
  if (!item.deadline) return null;
  return Math.round((item.deadline - today) / DAY);
}

export const isOpen = (item, today) => {
  const left = daysLeft(item, today);
  return left === null || left >= 0;
};

export function ddayLabel(item, today) {
  const left = daysLeft(item, today);
  if (left === null) {
    const soon = opensIn(item, today ?? startOfToday());
    if (soon !== null) return soon === 0 ? '이번 달 열림' : '다음 달 열림';
    return item.when ? '정기·수시' : '상시';
  }
  if (left < 0) return '마감';
  return left === 0 ? 'D-DAY' : `D-${left}`;
}

export function formatDate(d) {
  if (!d) return '지금 열린 마감일 없음';
  const w = '일월화수목금토'[d.getDay()];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${w})`;
}

export const majorLabel = (profile) => MAJORS[profile.major].label;

/* 정기 모집이 곧 열리는지: 이번 달이면 0, 다음 달이면 1, 아니면 null.
   마감일이 있는(지금 모집 중인) 기회는 빼고, 모집 달(months)을 아는 정기 프로그램만 본다 */
export function opensIn(item, today = startOfToday()) {
  if (item.deadline || !item.months?.length) return null;
  const m = today.getMonth() + 1;
  if (item.months.includes(m)) return 0;
  if (item.months.includes((m % 12) + 1)) return 1;
  return null;
}
