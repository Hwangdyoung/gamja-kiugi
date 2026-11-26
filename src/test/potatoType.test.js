import { describe, expect, it } from 'vitest';
import { POTATO_ORDER, POTATO_TYPES, QUIZ, VOICE, potatoOf } from '../lib/potatoType.js';
import { messageFor } from '../lib/growth.js';
import { pokeLine, tickleLine } from '../lib/care.js';
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
  it('유형 말투: 기분 좋음·멈춤만 바뀌고 짜증·화남은 그대로', () => {
    const progress = { count: 1, total: 5, next: { stage: 0 } };
    for (const t of POTATO_ORDER) {
      expect(messageFor('happy', { progress, type: t })).toBe(VOICE[t].happy);
      expect(messageFor('neutral', { progress, type: t })).toBe(VOICE[t].neutral);
      expect(messageFor('angry', { progress, type: t })).toBe(messageFor('angry', { progress }));
      expect(VOICE[t].poke.happy).toContain(pokeLine('happy', 0, VOICE[t]));
      expect(pokeLine('annoyed', 0, VOICE[t])).toBe(pokeLine('annoyed', 0));
      expect(VOICE[t].tickle).toContain(tickleLine(0, VOICE[t]));
    }
    expect(messageFor('happy', { progress })).toBe('감자가 오늘도 성장 중!');
  });
});
