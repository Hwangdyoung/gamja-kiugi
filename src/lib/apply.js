/* 지원 기록 (11/26): 스크랩에서 끝나지 않고 실제로 지원하게 밀어 준다.
   - 기회 상세에서 '지원했어요'를 누르면 지원함 → 결과(합격·불합격)를 남긴다. 이 기기에만 저장.
   - 지원하면 감자에게 줄 거름 1개 (기회마다 한 번).
   - 스크랩만 하고 지원 안 한 기회가 마감 7일 안으로 오면 홈 감자가 그 기회를 콕 집어 조른다.
   applied = { [기회 id]: { s: 'applied' | 'pass' | 'fail', at: ISO 날짜 } } */
export const APPLY_LABEL = { applied: '지원함', pass: '합격', fail: '불합격' };
export const NAG_DAYS = 7;
const DAY_MS = 86400000;

/* 스크랩했지만 아직 지원 안 한 것만 남긴 스크랩 표 (마감 알림·홈 마감 임박에 쓴다: 지원한 건 그만 조른다) */
export function savedToApply(saved, applied) {
  return Object.fromEntries(Object.entries(saved).filter(([id, on]) => on && !applied[id]));
}

/* 홈 감자가 조를 기회 하나: 스크랩 + 미지원 + 마감 7일 안, 가장 급한 것 */
export function nagTarget(items, saved, applied, today) {
  let best = null;
  for (const it of items) {
    if (!saved[it.id] || applied[it.id] || !it.deadline) continue;
    const left = Math.round((it.deadline - today) / DAY_MS);
    if (left < 0 || left > NAG_DAYS) continue;
    if (!best || left < best.left) best = { item: it, left };
  }
  return best;
}

const short = (t, n = 14) => (t.length > n ? `${t.slice(0, n)}…` : t);

/* 감자 말투(반말 B급, 기획안 9장) */
export function nagLine({ item, left }) {
  const t = `'${short(item.title)}'`;
  if (left === 0) return `${t} 오늘 마감이야! 지금 내면 돼.`;
  if (left === 1) return `${t} 내일 마감! 지원서 5분이면 써.`;
  if (left <= 3) return `${t} ${left}일 남았어. 스크랩만 하고 끝낼 거야?`;
  return `${t} 찜만 해 둔 거 아니지? ${left}일 남았어.`;
}

export function applyStats(applied) {
  const all = Object.values(applied);
  return { count: all.length, pass: all.filter((a) => a.s === 'pass').length };
}
