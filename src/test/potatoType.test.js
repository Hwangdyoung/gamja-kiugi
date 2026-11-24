import { describe, expect, it } from 'vitest';
import { POTATO_ORDER, POTATO_TYPES, QUIZ, potatoOf } from '../lib/potatoType.js';
import { TYPES } from '../lib/data.js';

describe('감자 유형 테스트', () => {
  it('8문항, 문항마다 다섯 유형이 하나씩', () => {
    expect(QUIZ).toHaveLength(8);
    for (const q of QUIZ) expect(q.choices.map((c) => c.type)).toEqual(POTATO_ORDER);
  });
  it('가장 많이 고른 유형, 같으면 나중에 고른 유형', () => {
    expect(potatoOf(['calm', 'calm', 'creative', 'creative', 'cheerful', 'calm', 'x', null])).toBe('calm');
    expect(potatoOf(['calm', 'creative', 'calm', 'creative', null, null, null, null])).toBe('creative');
  });
  it('잘 맞는 기회 유형은 앱의 기회 유형 안에서', () => {
    for (const t of POTATO_ORDER) for (const f of POTATO_TYPES[t].fits) expect(TYPES).toContain(f);
  });
});
