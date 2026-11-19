import { MAJORS } from './data.js';

const ym = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}`;
};

/* 남긴 기록 목록 (학년 순서). [{ grade, label, tag, t, note, at }] */
export function recordsOf(progress, log) {
  return progress.stages.flatMap((s) =>
    s.tasks.filter((t) => log[t.id]).map((t) => ({ grade: s.grade, label: s.label, tag: t.tag, t: t.t, own: t.own, note: log[t.id].note, at: log[t.id].at })),
  );
}

/* 이력서·자기소개서에 붙일 초안. 기록이 재료라 기록에 없는 말은 지어내지 않는다 */
export function resumeText(profile, progress, log) {
  const recs = recordsOf(progress, log);
  const major = MAJORS[profile.major];
  const head = `[경험 정리] ${profile.name} · ${profile.school ?? ''} · ${major.label} / ${major.tracks[profile.track].label}`;
  if (!recs.length) return `${head}\n\n아직 남긴 기록이 없어요.`;
  const lines = [head, ''];
  progress.stages.forEach((s) => {
    const mine = recs.filter((r) => r.grade === s.grade);
    if (!mine.length) return;
    lines.push(`■ ${s.grade}학년 · ${s.label}`);
    mine.forEach((r) => lines.push(`- (${r.tag}) ${r.t}: ${r.note || '완료'}${r.at ? ` (${ym(r.at)})` : ''}`));
    lines.push('');
  });
  lines.push('※ 감자 키우기에서 남긴 기록이에요. 지원하는 곳에 맞게 문장을 다듬어 쓰세요.');
  return lines.join('\n');
}
