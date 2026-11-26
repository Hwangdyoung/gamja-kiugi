import { MOODS } from '../lib/data.js';
import happy from '../assets/mascot/happy.webp';
import neutral from '../assets/mascot/neutral.webp';
import annoyed from '../assets/mascot/annoyed.webp';
import angry from '../assets/mascot/angry.webp';
import hatSearching from '../assets/potato-types/hat-searching.webp';
import hatCreative from '../assets/potato-types/hat-creative.webp';

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

function Sprout({ grow, lift = 0 }) {
  if (!grow) return null;
  const top = STEM_TOP[grow];
  return (
    <svg className="sprout" viewBox="0 0 300 348" aria-hidden="true" data-grow={grow}>
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" transform={lift ? `translate(0 ${-lift})` : undefined}>
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

/* 눈꺼풀: 웃음·무표정 그림의 눈 위에 살색 타원 + 감은 눈 선을 덮는다.
   blink면 가끔 깜빡이고, sleeping이면 계속 감고 있다. (짜증·분노 그림은 눈 모양이 달라 깜빡이지 않는다) */
const SKIN = '#e0ba7e';
const EYES = [
  [111, 240],
  [181, 239],
];
function Eyelids({ sleeping }) {
  return (
    <svg className={`eyelids${sleeping ? ' closed' : ''}`} viewBox="0 0 300 348" aria-hidden="true">
      {EYES.map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="10" ry="12" fill={SKIN} />
          <path d={`M${x - 8} ${y + 1} Q${x} ${y + 7} ${x + 8} ${y + 1}`} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/* 감자 유형 소품 (유형 테스트 결과): 내 감자가 그 유형의 포인트 하나를 받아 쓴다.
   그림 좌표(300×348): 머리 꼭대기 (150,134), 눈 (111,240)·(181,239), 몸통 폭 대략 40~262 */
// [그림, x, y, 너비, 높이] (그림 좌표 300×348)
// 모자는 팀원 그림에서 기울어진 채로 오려서, 수평이 맞게 돌려 저장해 두었다
const HAT = { searching: [hatSearching, 40, 70, 220, 150], creative: [hatCreative, 70, 78, 160, 120] };
const HAT_LIFT = { searching: 44, creative: 40 };
export const OUTFIT_LABELS = { calm: '동그란 안경', cheerful: '노란 머리띠', searching: '탐험 모자', creative: '빨간 베레모', dependable: '네모 안경' };
function Outfit({ type }) {
  if (!type) return null;
  const st = { stroke: INK, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  let art = null;
  if (type === 'cheerful') {
    art = (
      <g {...st}>
        <path d="M232 196 L278 176 L272 206 Z" fill="#ffd23f" />
        <path d="M234 204 L270 226 L250 236 Z" fill="#ffd23f" />
        <path d="M54 194 Q150 154 246 194 L252 216 Q150 178 48 216 Z" fill="#ffd23f" />
        <circle cx="240" cy="204" r="9" fill="#ffd23f" />
      </g>
    );
  } else if (type === 'calm') {
    // 안경알은 눈보다 조금 위에(눈이 알 아래쪽에 오게) 두고, 코받침 다리는 입에 닿지 않게 알 윗부분에서 잇는다
    art = (
      <g {...st} fill="none">
        <circle cx="111" cy="236" r="27" fill="#ffffff" fillOpacity="0.16" />
        <circle cx="181" cy="235" r="27" fill="#ffffff" fillOpacity="0.16" />
        <path d="M137 227 Q146 221 155 227" />
        <path d="M85 227 L61 221" />
        <path d="M207 227 L233 220" />
      </g>
    );
  } else if (type === 'dependable') {
    // 네모 안경 + 힘준 눈썹 (팀원 그림의 든든한 감자처럼)
    art = (
      <g {...st} fill="none">
        <rect x="87" y="219" width="48" height="34" rx="6" fill="#ffffff" fillOpacity="0.16" />
        <rect x="157" y="218" width="48" height="34" rx="6" fill="#ffffff" fillOpacity="0.16" />
        <path d="M134 229 Q146 223 158 229" />
        <path d="M88 229 L63 223" />
        <path d="M204 229 L231 222" />
        <path d="M92 203 L128 212" strokeWidth="7" />
        <path d="M164 211 L200 202" strokeWidth="7" />
      </g>
    );
  } else if (type === 'searching' || type === 'creative') {
    // 모자 둘은 팀원 유형 그림에서 모자만 오려 그대로 씌운다
    const [src, x, y, w, h] = HAT[type];
    art = <image href={src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
  }
  return (
    <svg className="outfit" viewBox="0 0 300 348" aria-hidden="true" data-outfit={type}>
      {art}
    </svg>
  );
}

export default function Mascot({ mood = 'happy', size = 120, grow = 0, blink = false, sleeping = false, outfit = null }) {
  const lids = (blink || sleeping) && (mood === 'happy' || mood === 'neutral');
  return (
    <span className="mascot-wrap" data-mood={mood} style={{ width: size, height: Math.round(size * 1.16) }}>
      <img
        className="mascot"
        data-mood={mood}
        src={MASCOT_SRC[mood]}
        width={size}
        height={Math.round(size * 1.16)}
        alt={`감자 캐릭터, 표정 ${MOODS[mood]}${grow ? `, ${GROW_LABELS[grow]}` : ''}${outfit && OUTFIT_LABELS[outfit] ? `, ${OUTFIT_LABELS[outfit]}` : ''}`}
        draggable="false"
      />
      {lids && <Eyelids sleeping={sleeping} />}
      <Outfit type={outfit} />
      {/* 모자를 쓰면 싹은 모자 꼭대기에서 난다 */}
      <Sprout grow={grow} lift={HAT_LIFT[outfit] ?? 0} />
    </span>
  );
}
