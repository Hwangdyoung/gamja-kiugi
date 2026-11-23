/* 나 → 일정(달력)에 올릴 것
   - 마감: 스크랩한 기회의 마감일 (마감이 지난 것도 그날에 남겨 둔다)
   - 모집 열림: 내 경로의 정기 프로그램이 모집을 여는 달의 1일 (알림 규칙과 같은 날)
   - 기록: 로드맵 할 일에 한 줄 기록을 남긴 날
   날짜는 기기 시간대 기준 'YYYY-MM-DD' 글자로 묶는다. */

export const KIND_LABEL = { due: '마감', open: '모집 열림', rec: '기록' };
const ORDER = { due: 0, open: 1, rec: 2 };

const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* 그 달 달력 칸: 일요일부터 시작하는 주 단위. 앞뒤 빈 칸은 null */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/* 그 달 일정 → { 'YYYY-MM-DD': [{ kind, id, title, sub }] }
   all = 내 경로 기회 전부(마감 지난 것 포함), saved = { id: true }, log = { 할 일 id: { note, at } }, stages = 로드맵 */
export function monthEvents({ year, month, all = [], saved = {}, log = {}, stages = [] }) {
  const out = {};
  const add = (date, ev) => {
    if (date.getFullYear() !== year || date.getMonth() !== month) return;
    const k = dayKey(date);
    (out[k] ??= []).push(ev);
  };

  all.forEach((it) => {
    if (saved[it.id] && it.deadline) add(it.deadline, { kind: 'due', id: it.id, title: it.title, sub: `${it.org} · ${it.type}` });
    if (!it.deadline && it.months?.includes(month + 1)) {
      add(new Date(year, month, 1), { kind: 'open', id: it.id, title: it.title, sub: it.when ?? `${it.org} · ${it.type}` });
    }
  });

  const tasks = new Map(stages.flatMap((s) => s.tasks.map((t) => [t.id, { ...t, grade: s.grade }])));
  Object.entries(log).forEach(([id, rec]) => {
    const t = tasks.get(id);
    if (!t || !rec?.at) return;
    add(new Date(rec.at), { kind: 'rec', id, title: t.t, sub: rec.note ? `${t.grade}학년 · ${rec.note}` : `${t.grade}학년` });
  });

  Object.values(out).forEach((list) => list.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]));
  return out;
}
