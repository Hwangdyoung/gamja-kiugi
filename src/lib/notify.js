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

export function deadlineMessage(item, before) {
  return before === 1
    ? `내일 마감이야! '${item.title}' 지금 확인해.`
    : `감자가 조마조마해. '${item.title}' 마감 ${before}일 남았어.`;
}

export function deadlineSchedule(items, saved, now = new Date()) {
  const out = [];
  items.forEach((item) => {
    if (!saved[item.id] || !item.deadline) return;
    DEADLINE_BEFORE.forEach((before) => {
      const at = item.deadline.getTime() - before * DAY_MS + SEND_HOUR * HOUR_MS;
      if (at <= now.getTime()) return;
      out.push({ at, kind: 'due', id: item.id, target: `opp:${item.id}`, mood: before === 1 ? 'annoyed' : 'neutral', body: deadlineMessage(item, before) });
    });
  });
  return out;
}

/* iPhone 앱이 예약할 알림 전체: 미접속 알림 + 마감 임박 알림.
   하루에 한 번을 넘기지 않는다(기획안 7장) → 같은 날 겹치면 마감 알림을 남긴다(할 일이 분명해서). */
export function notificationPlan({ progress, items, saved, now = new Date() }) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const away = notificationSchedule({ progress }).map((p) => ({
    at: start.getTime() + p.day * DAY_MS + SEND_HOUR * HOUR_MS,
    kind: 'away',
    target: 'home',
    mood: p.mood,
    body: p.body,
  }));
  const byDay = new Map();
  [...away, ...deadlineSchedule(items, saved, now)].forEach((n) => {
    const key = new Date(n.at).toDateString();
    const prev = byDay.get(key);
    if (!prev || (prev.kind === 'away' && n.kind === 'due')) byDay.set(key, n);
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
