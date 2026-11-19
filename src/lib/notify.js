import { messageFor, moodOf } from './growth.js';

/* 기획안 7장 알림 규칙(가정)
   - 표정이 바뀌는 날(2·4·7일째)에만 보낸다. 하루 한 번까지.
   - 분노 단계 이후(7일 넘게)에는 주 1회(14·21…일째)로 줄인다.
   - 밤 9시~아침 9시에는 보내지 않는다 → 오전 10시에 보낸다.
   - 사용자가 알림을 끄면 보내지 않는다. */
export const SEND_TIME = '오전 10시';

export function notifyDecision(days, enabled) {
  if (!enabled) return { send: false, reason: '사용자가 알림을 껐어요.' };
  if (days === 0) return { send: false, reason: '오늘 접속했어요.' };
  if (days > 7) {
    return (days - 7) % 7 === 0
      ? { send: true, reason: '분노 단계 이후 주 1회 알림이에요.' }
      : { send: false, reason: '분노 단계 이후에는 주 1회만 보내요.' };
  }
  const changed = moodOf(days) !== moodOf(days - 1);
  return changed
    ? { send: true, reason: '표정이 바뀐 날이에요.' }
    : { send: false, reason: '표정이 바뀌는 날에만 보내요.' };
}

/* iPhone 앱이 기기 안에 미리 예약할 알림 목록 (마지막 접속 후 며칠째, 표정, 문구).
   위 규칙으로 보내는 날만 골라 4주 치를 만든다: 2·4·7·14·21·28일째 */
const PLAN_DAYS = 28;

export function notificationSchedule({ progress }) {
  const out = [];
  for (let day = 1; day <= PLAN_DAYS; day++) {
    if (!notifyDecision(day, true).send) continue;
    const mood = moodOf(day);
    out.push({ day, mood, body: messageFor(mood, { progress }) });
  }
  return out;
}

/* 기획안 5장 P1 마감 임박 알림
   스크랩한 기회의 마감 3일 전·하루 전 오전 10시에 알린다. 상시 모집이나 이미 지난 날은 뺀다. */
export const DEADLINE_BEFORE = [3, 1];
const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const SEND_HOUR = 10;
/* 설정에서 고르는 알림 시간 (밤 9시~아침 9시는 고를 수 없다) */
export const SEND_HOURS = [
  { value: 9, label: '아침 9시' },
  { value: 10, label: '오전 10시' },
  { value: 12, label: '낮 12시' },
  { value: 19, label: '저녁 7시' },
];
/* 알림 설정 기본값: 미접속 알림, 마감·모집 알림, 보내는 시각 */
export const DEFAULT_PREFS = { away: true, due: true, hour: SEND_HOUR };

export function deadlineMessage(item, before) {
  return before === 1
    ? `내일 마감이야! '${item.title}' 지금 확인해.`
    : `감자가 조마조마해. '${item.title}' 마감 ${before}일 남았어.`;
}

export function deadlineSchedule(items, saved, now = new Date(), hour = SEND_HOUR) {
  const out = [];
  items.forEach((item) => {
    if (!saved[item.id] || !item.deadline) return;
    DEADLINE_BEFORE.forEach((before) => {
      const at = item.deadline.getTime() - before * DAY_MS + hour * HOUR_MS;
      if (at <= now.getTime()) return;
      out.push({ at, kind: 'due', id: item.id, target: `opp:${item.id}`, mood: before === 1 ? 'annoyed' : 'neutral', body: deadlineMessage(item, before) });
    });
  });
  return out;
}

/* 스크랩한 정기 프로그램이 모집을 여는 달 1일에 알린다 (12개월 안의 다음 한 번) */
export function openingSchedule(items, saved, now = new Date(), hour = SEND_HOUR) {
  const out = [];
  items.forEach((item) => {
    if (!saved[item.id] || item.deadline || !item.months?.length) return;
    for (let k = 0; k < 12; k++) {
      const d = new Date(now.getFullYear(), now.getMonth() + k, 1, hour);
      if (!item.months.includes(d.getMonth() + 1) || d.getTime() <= now.getTime()) continue;
      out.push({ at: d.getTime(), kind: 'open', id: item.id, target: `opp:${item.id}`, mood: 'neutral', body: `감자가 챙겨 왔어. '${item.title}' 이번 달에 모집이 열려.` });
      break;
    }
  });
  return out;
}

/* iPhone 앱이 예약할 알림 전체: 미접속 알림 + 마감 임박 알림 + 정기 모집 열림 알림.
   하루에 한 번을 넘기지 않는다(기획안 7장) → 같은 날 겹치면 마감 > 모집 열림 > 미접속 순으로 남긴다(할 일이 분명한 것).
   prefs: 설정의 알림 세부 설정 { away, due, hour } */
const RANK = { due: 3, open: 2, away: 1 };
export function notificationPlan({ progress, items, saved, now = new Date(), prefs = DEFAULT_PREFS }) {
  const hour = prefs.hour ?? SEND_HOUR;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const away = (prefs.away === false ? [] : notificationSchedule({ progress })).map((p) => ({
    at: start.getTime() + p.day * DAY_MS + hour * HOUR_MS,
    kind: 'away',
    target: 'home',
    mood: p.mood,
    body: p.body,
  }));
  const byDay = new Map();
  const dated = prefs.due === false ? [] : [...deadlineSchedule(items, saved, now, hour), ...openingSchedule(items, saved, now, hour)];
  [...away, ...dated].forEach((n) => {
    const key = new Date(n.at).toDateString();
    const prev = byDay.get(key);
    if (!prev || RANK[n.kind] > RANK[prev.kind]) byDay.set(key, n);
  });
  return [...byDay.values()].sort((a, b) => a.at - b.at);
}

/* 홈 화면용: 스크랩한 기회 중 마감이 3일 이내로 남은 것 */
export function urgentSaved(items, saved, today) {
  return items
    .filter((it) => saved[it.id] && it.deadline)
    .filter((it) => {
      const left = Math.round((it.deadline - today) / DAY_MS);
      return left >= 0 && left <= DEADLINE_BEFORE[0];
    })
    .sort((a, b) => a.deadline - b.deadline);
}
