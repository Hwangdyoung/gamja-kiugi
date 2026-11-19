import { MAJORS } from './data.js';
import { josa } from './text.js';

/* 프로필({ name, major, track })에 해당하는 직무 경로 */
export function getTrack(profile) {
  return profile ? MAJORS[profile.major]?.tracks[profile.track] ?? null : null;
}

/* 미접속 일수 → 표정 (기획안 7장). 0~1 웃음, 2~3 무표정, 4~6 짜증, 7 이상 분노 */
export function moodOf(days) {
  if (days <= 1) return 'happy';
  if (days <= 3) return 'neutral';
  if (days <= 6) return 'annoyed';
  return 'angry';
}

/* 말풍선·알림 문구. 캐릭터는 반말 B급 톤(기획안 9장)
   주어는 사용자 이름이 아니라 늘 "감자" (서비스 이름 감자 키우기). 이름은 홈 인사에서만 부른다 */
export const CHARACTER = '감자';

/* progress = roadmap.js progressOf() 결과 ({ count, total, next }) */
export function messageFor(mood, { progress }) {
  const name = CHARACTER;
  const i = josa(name, '이', '가');
  const full = progress.count >= progress.total;
  if (mood === 'happy') return full ? `${name}${i} 다 컸다. 이 기록으로 지원서 써 보자.` : `${name}${i} 오늘도 성장 중!`;
  if (mood === 'neutral') return `${name}${i} 멈춰 있어요.`;
  if (mood === 'annoyed') {
    return full ? '다 해놓고 지원 안 할 거야?' : `${progress.next.stage + 1}학년 할 일 아직이야? 이대로 졸업할 거야?`;
  }
  return `${name}${i} 화났다. 새 기회 확인하러 와.`;
}
