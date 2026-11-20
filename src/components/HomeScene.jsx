/* 홈 배경 그림: 춘천 호숫가 언덕
   하늘 → 먼 산 → 호수 → 가까운 언덕 → 감자 밭. 구름은 천천히 흘러간다.
   - 낮/밤: 밤(감자가 자는 시간)이나 어두운 화면 모드면 달·별이 뜬 밤 하늘
   - 표정: 짜증이면 하늘이 누렇게, 화나면 노을처럼 붉게 (색은 styles.css의 --sc-* 토큰)
   글자가 올라가는 자리라 색은 옅고 대비는 낮게 그렸다. 화면 비율이 달라도 아래(땅)에 맞춰 잘린다. */
export default function HomeScene({ night = false }) {
  return (
    <svg className={`home-scene${night ? ' night' : ''}`} viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="sc-sky1" />
          <stop offset="0.75" className="sc-sky2" />
        </linearGradient>
        <linearGradient id="sc-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="sc-lake1" />
          <stop offset="1" className="sc-lake2" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#sc-sky)" />

      {/* 해 또는 달·별 */}
      <g className="sc-sun">
        <circle cx="318" cy="120" r="58" className="sc-glow" />
        <circle cx="318" cy="120" r="30" className="sc-orb" />
      </g>
      <g className="sc-moon">
        {/* 초승달: 둥근 달에서 옆 동그라미만큼 가려 낸다 */}
        <mask id="sc-crescent">
          <rect width="400" height="400" fill="#fff" />
          <circle cx="326" cy="132" r="22" fill="#000" />
        </mask>
        <circle cx="314" cy="140" r="24" className="sc-orb" mask="url(#sc-crescent)" />
        {[
          [60, 90, 1.8],
          [120, 170, 1.3],
          [210, 70, 1.6],
          [250, 210, 1.2],
          [40, 250, 1.4],
          [370, 260, 1.5],
          [170, 120, 1],
          [90, 330, 1.1],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} className="sc-star" style={{ animationDelay: `${i * 0.37}s` }} />
        ))}
      </g>

      {/* 구름 */}
      <g className="sc-cloud c1">
        <path d="M30 170 a22 22 0 0 1 36 -16 a28 28 0 0 1 52 6 a18 18 0 0 1 10 34 h-90 a16 16 0 0 1 -8 -24 z" />
      </g>
      <g className="sc-cloud c2">
        <path d="M250 245 a16 16 0 0 1 26 -12 a20 20 0 0 1 38 4 a13 13 0 0 1 8 25 h-66 a12 12 0 0 1 -6 -17 z" />
      </g>

      {/* 먼 산 두 겹 (춘천을 둘러싼 산) */}
      <path className="sc-far" d="M0 345 L40 300 L85 324 L140 262 L200 312 L250 280 L300 318 L350 268 L400 300 V400 H0 Z" />
      <path className="sc-mid" d="M0 365 C 50 335, 95 343, 130 353 C 180 323, 230 325, 270 349 C 320 329, 365 335, 400 353 V410 H0 Z" />

      {/* 호수 */}
      <rect className="sc-lake" x="0" y="380" width="400" height="60" fill="url(#sc-lake)" />
      <g className="sc-ripple">
        <path d="M60 398 h40 M150 414 h28 M260 396 h46 M320 420 h24" />
      </g>

      {/* 가까운 언덕과 감자 밭 */}
      <path className="sc-hill" d="M0 430 C 80 410, 160 418, 210 426 C 280 412, 350 414, 400 426 V800 H0 Z" />
      <path className="sc-field" d="M-20 560 C 100 530, 300 530, 420 560 V800 H-20 Z" />
      <g className="sc-rows">
        <path d="M-10 610 C 110 582, 290 582, 410 610" />
        <path d="M-10 670 C 110 642, 290 642, 410 670" />
        <path d="M-10 735 C 110 707, 290 707, 410 735" />
      </g>
      {/* 밭 가장자리 감자 잎 몇 포기 */}
      <g className="sc-plant">
        {[
          [30, 500],
          [372, 498],
          [64, 470],
          [340, 468],
        ].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C -10 -10, -14 -20, -6 -26 C 0 -18, 2 -10, 0 0 Z" />
            <path d="M0 0 C 10 -8, 16 -16, 10 -24 C 2 -16, -1 -8, 0 0 Z" />
          </g>
        ))}
      </g>
    </svg>
  );
}
