import { describe, expect, it } from 'vitest';
import { applyStats, nagLine, nagTarget, savedToApply } from '../lib/apply.js';

const today = new Date(2026, 10, 26);
const at = (d) => new Date(2026, 10, 26 + d);
const items = [
  { id: 'A', title: '춘천 서포터즈', deadline: at(5) },
  { id: 'B', title: '공모전', deadline: at(2) },
  { id: 'C', title: '멀리', deadline: at(20) },
  { id: 'D', title: '상시', deadline: null },
];

describe('지원 기록과 감자 조르기', () => {
  it('스크랩 + 미지원 + 마감 7일 안에서 가장 급한 것을 조른다', () => {
    const saved = { A: true, B: true, C: true, D: true };
    expect(nagTarget(items, saved, {}, today)).toMatchObject({ item: { id: 'B' }, left: 2 });
    expect(nagTarget(items, saved, { B: { s: 'applied' } }, today)).toMatchObject({ item: { id: 'A' }, left: 5 });
    expect(nagTarget(items, { C: true, D: true }, {}, today)).toBeNull();
  });
  it('감자 말투: 오늘·내일·며칠', () => {
    expect(nagLine({ item: items[1], left: 0 })).toContain('오늘 마감');
    expect(nagLine({ item: items[1], left: 1 })).toContain('내일 마감');
    expect(nagLine({ item: items[1], left: 2 })).toContain('2일 남았어');
  });
  it('지원한 기회는 마감 알림용 스크랩에서 빠지고, 지원·합격 수를 센다', () => {
    expect(savedToApply({ A: true, B: true, C: false }, { A: { s: 'applied' } })).toEqual({ B: true });
    expect(applyStats({ A: { s: 'applied' }, B: { s: 'pass' }, C: { s: 'fail' } })).toEqual({ count: 3, pass: 1 });
  });
});
