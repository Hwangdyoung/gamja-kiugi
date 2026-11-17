import { MAJORS } from './data.js';
import { josa } from './text.js';

/* 프로필({ name, major, track })에 해당하는 직무 경로 */
export function getTrack(profile) {
  return profile ? MAJORS[profile.major]?.tracks[profile.track] ?? null : null;
}

export const doneCount = (done) => done.filter(Boolean).length;
/* 아직 안 한 첫 단계(모두 했으면 -1) */
export const nextIndex = (done) => done.indexOf(false);

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

export function messageFor(mood, { done, track }) {
  const name = CHARACTER;
  const i = josa(name, '이', '가');
  const full = doneCount(done) >= 4;
  if (mood === 'happy') {
    return full
      ? `축하합니다! ${name}${josa(name, '은', '는')} ${track.goal || '춘천에서 직장인이 되었습니다.'}`
      : `${name}${i} 오늘도 성장 중!`;
  }
  if (mood === 'neutral') return `${name}${i} 멈춰 있어요.`;
  if (mood === 'annoyed') {
    return full ? '4단계까지 와놓고 서울 갈 거야?' : `${nextIndex(done) + 1}단계 아직이야? 서울 갈 거야?`;
  }
  return `${name}${i} 화났다. 춘천 공고 확인하러 와.`;
}
