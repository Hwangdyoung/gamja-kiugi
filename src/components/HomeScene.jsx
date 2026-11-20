/* 홈 배경 그림: 춘천 호숫가 언덕
   하늘 → 먼 산 → 호수 → 가까운 언덕 → 감자 밭. 구름은 천천히 흘러간다.
   - 시각(time): 새벽·낮·노을·밤. 실제 시계를 따른다(시연 도구로 바꿀 수 있음)
   - 날씨(weather): 맑음·흐림·비·눈. 춘천 지금 날씨를 따른다. 비·눈은 그림 위로 내린다
   - 표정: 짜증이면 하늘이 누렇게, 화나면 붉게 (맑은 낮에만, 색은 styles.css의 --sc-* 토큰)
   글자가 올라가는 자리라 색은 옅고 대비는 낮게 그렸다. 화면 비율이 달라도 아래(땅)에 맞춰 잘린다. */
const STARS = [
  [60, 90, 1.8],
  [120, 170, 1.3],
  [210, 70, 1.6],
  [250, 210, 1.2],
  [40, 250, 1.4],
  [370, 230, 1.5],
  [170, 120, 1],
  [90, 40, 1.1],
];
// 빗줄기·눈송이 자리 (매번 같은 자리에 그려지게 미리 정해 둔다)
const DROPS = Array.from({ length: 36 }, (_, i) => ({ x: (i * 37) % 100, d: ((i * 53) % 100) / 100, s: 0.55 + ((i * 29) % 40) / 100 }));
const FLAKES = Array.from({ length: 30 }, (_, i) => ({ x: (i * 41) % 100, d: ((i * 61) % 100) / 10, s: 6 + ((i * 17) % 50) / 10, r: 2 + (i % 3) }));

export default function HomeScene({ time = 'day', weather = 'clear' }) {
  return (
    <div className={`home-scene t-${time} w-${weather}`} aria-hidden="true">
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="sc-sky1" />
            <stop offset="0.75" className="sc-sky2" />
          </linearGradient>
          <linearGradient id="sc-lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="sc-lake1" />
            <stop offset="1" className="sc-lake2" />
          </linearGradient>
          {/* 초승달: 둥근 달에서 옆 동그라미만큼 가려 낸다 */}
          <mask id="sc-crescent">
            <rect width="400" height="400" fill="#fff" />
            <circle cx="326" cy="112" r="22" fill="#000" />
          </mask>
        </defs>
        <rect width="400" height="800" fill="url(#sc-sky)" />

        <g className="sc-sun">
          <circle cx="318" cy="120" r="58" className="sc-glow" />
          <circle cx="318" cy="120" r="30" className="sc-orb" />
        </g>
        <g className="sc-moon">
          <circle cx="314" cy="120" r="24" className="sc-orb" mask="url(#sc-crescent)" />
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} className="sc-star" style={{ animationDelay: `${i * 0.37}s` }} />
          ))}
        </g>

        {/* 구름 (흐림·비·눈이면 두 덩이 더, 짙게) */}
        <g className="sc-cloud c1">
          <path d="M30 170 a22 22 0 0 1 36 -16 a28 28 0 0 1 52 6 a18 18 0 0 1 10 34 h-90 a16 16 0 0 1 -8 -24 z" />
        </g>
        <g className="sc-cloud c2">
          <path d="M250 245 a16 16 0 0 1 26 -12 a20 20 0 0 1 38 4 a13 13 0 0 1 8 25 h-66 a12 12 0 0 1 -6 -17 z" />
        </g>
        <g className="sc-cloud c3 sc-extra">
          <path d="M150 90 a30 30 0 0 1 50 -20 a36 36 0 0 1 68 10 a24 24 0 0 1 12 44 h-120 a20 20 0 0 1 -10 -34 z" />
        </g>
        <g className="sc-cloud c4 sc-extra">
          <path d="M-10 70 a26 26 0 0 1 42 -16 a30 30 0 0 1 58 8 a20 20 0 0 1 10 38 h-104 a18 18 0 0 1 -6 -30 z" />
        </g>

        {/* 먼 산 두 겹 (춘천을 둘러싼 산). 눈 오면 봉우리에 눈 */}
        <path className="sc-far" d="M0 345 L40 300 L85 324 L140 262 L200 312 L250 280 L300 318 L350 268 L400 300 V400 H0 Z" />
        <path className="sc-snowcap" d="M140 262 L126 278 L134 276 L141 284 L148 276 L156 279 Z M350 268 L337 283 L345 281 L351 288 L358 281 L365 283 Z" />
        <path className="sc-mid" d="M0 365 C 50 335, 95 343, 130 353 C 180 323, 230 325, 270 349 C 320 329, 365 335, 400 353 V410 H0 Z" />

        {/* 호수 */}
        <rect x="0" y="380" width="400" height="60" fill="url(#sc-lake)" />
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

      {weather === 'rain' && (
        <div className="sc-fall rain">
          {DROPS.map((p, i) => (
            <i key={i} style={{ left: `${p.x}%`, animationDelay: `${-p.d * 1.2}s`, animationDuration: `${p.s}s` }} />
          ))}
        </div>
      )}
      {weather === 'snow' && (
        <div className="sc-fall snow">
          {FLAKES.map((p, i) => (
            <i key={i} style={{ left: `${p.x}%`, width: p.r * 2, height: p.r * 2, animationDelay: `${-p.d}s`, animationDuration: `${p.s}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
