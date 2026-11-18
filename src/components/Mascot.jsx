import { MOODS } from '../lib/data.js';
import happy from '../assets/mascot/happy.webp';
import neutral from '../assets/mascot/neutral.webp';
import annoyed from '../assets/mascot/annoyed.webp';
import angry from '../assets/mascot/angry.webp';

/* 감자 캐릭터 1종, 표정 4종 (기획안 9장).
   원본 일러스트에서 웃음·짜증·분노를 잘라 쓰고, 무표정은 웃음 그림의 입을 일자로 바꿔 만들었다.
   grow(0~4)를 주면 내 경로에서 마친 단계 수만큼 머리 위에서 싹이 자란다:
   0 씨감자 → 1 새싹 → 2 잎 두 장 → 3 꽃봉오리 → 4 감자꽃.
   표정(접속)과 성장(단계 완료)은 따로 움직인다. 레벨·경험치 같은 숫자는 두지 않는다(기획안 5장). */
export const MASCOT_SRC = { happy, neutral, annoyed, angry };
export const GROW_LABELS = ['씨감자', '새싹 감자', '잎 난 감자', '꽃봉오리 감자', '꽃 핀 감자'];

const INK = '#3a2a20';
const LEAF = '#6cc070';

// 그림 좌표(원본 300×348) 기준. 머리 꼭대기 가운데가 (150, 134)
const STEM_TOP = [134, 110, 98, 84, 76];
const leafR = 'M150 118 C 164 100, 188 99, 198 109 C 188 124, 166 127, 150 118 Z';
const leafL = 'M150 110 C 136 92, 112 92, 102 102 C 112 117, 134 119, 150 110 Z';

function Sprout({ grow }) {
  if (!grow) return null;
  const top = STEM_TOP[grow];
  return (
    <svg className="sprout" viewBox="0 0 300 348" aria-hidden="true" data-grow={grow}>
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M150 136 L150 ${top}`} fill="none" />
        <path d={leafR} fill={LEAF} />
        {grow >= 2 && <path d={leafL} fill={LEAF} />}
        {grow === 3 && <ellipse cx="150" cy={top - 8} rx="9" ry="12" fill="#c9b6f2" />}
        {grow === 4 && (
          <g>
            {[0, 72, 144, 216, 288].map((a) => (
              <circle
                key={a}
                cx={150 + 14 * Math.sin((a * Math.PI) / 180)}
                cy={top - 12 - 14 * Math.cos((a * Math.PI) / 180)}
                r="11"
                fill="#f1ebff"
              />
            ))}
            <circle cx="150" cy={top - 12} r="7" fill="#ffd23f" />
          </g>
        )}
      </g>
    </svg>
  );
}

export default function Mascot({ mood = 'happy', size = 120, grow = 0 }) {
  return (
    <span className="mascot-wrap" data-mood={mood} style={{ width: size, height: Math.round(size * 1.16) }}>
      <img
        className="mascot"
        data-mood={mood}
        src={MASCOT_SRC[mood]}
        width={size}
        height={Math.round(size * 1.16)}
        alt={`감자 캐릭터, 표정 ${MOODS[mood]}${grow ? `, ${GROW_LABELS[grow]}` : ''}`}
        draggable="false"
      />
      <Sprout grow={grow} />
    </span>
  );
}
