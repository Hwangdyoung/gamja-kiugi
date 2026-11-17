import { moodOf } from './growth.js';

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
