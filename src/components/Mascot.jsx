import { MOODS } from '../lib/data.js';
import happy from '../assets/mascot/happy.webp';
import neutral from '../assets/mascot/neutral.webp';
import annoyed from '../assets/mascot/annoyed.webp';
import angry from '../assets/mascot/angry.webp';

/* 감자 캐릭터 1종, 표정 4종 (기획안 9장).
   원본 일러스트에서 웃음·짜증·분노를 잘라 쓰고, 무표정은 웃음 그림의 입을 일자로 바꿔 만들었다. */
export const MASCOT_SRC = { happy, neutral, annoyed, angry };

export default function Mascot({ mood = 'happy', size = 120 }) {
  return (
    <img
      className="mascot"
      data-mood={mood}
      src={MASCOT_SRC[mood]}
      width={size}
      height={Math.round(size * 1.16)}
      alt={`감자 캐릭터, 표정 ${MOODS[mood]}`}
      draggable="false"
    />
  );
}
