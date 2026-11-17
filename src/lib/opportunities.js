import { MAJORS } from './data.js';
import { getTrack } from './growth.js';

const DAY = 86400000;

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* 기회 카드 목록. 내 경로의 기회를 단계 순서대로, 같은 기회는 한 번만 모은다.
   각 기회에 실제 마감일(deadline)과 몇 단계인지(step)를 붙인다. */
export function buildItems(profile, today = startOfToday()) {
  const track = getTrack(profile);
  if (!track) return [];
  const seen = new Set();
  const out = [];
  track.levels.forEach((level, i) => {
    level.o.forEach((x) => {
      const id = `${x.type}|${x.t}`;
      if (seen.has(id)) return;
      seen.add(id);
      out.push({
        id,
        title: x.t,
        type: x.type,
        org: x.org,
        target: x.target,
        deadline: x.due == null ? null : new Date(today.getTime() + x.due * DAY),
        step: i,
        stepTitle: level.t,
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
  if (left === null) return '상시';
  if (left < 0) return '마감';
  return left === 0 ? 'D-DAY' : `D-${left}`;
}

export function formatDate(d) {
  if (!d) return '상시 모집';
  const w = '일월화수목금토'[d.getDay()];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${w})`;
}

export const majorLabel = (profile) => MAJORS[profile.major].label;
