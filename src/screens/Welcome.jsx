/* 앱을 열면 처음 보이는 화면: 화면 아래를 꽉 채운 큰 감자 얼굴 + 위쪽 인사 + 시작하기.
   - 처음 온 사람(이름 모름): 감자가 자기소개를 한다
   - 아는 사람(프로필 있음): 감자가 이름을 불러 반긴다
   감자 얼굴은 크게 보여도 깨지지 않게 SVG로 그렸다(앱 감자 그림과 같은 색·선). 아래는 화면 밖으로 잘린다. */
const INK = '#2e1d14';
const SKIN = '#e3bd80';

function BigPotato() {
  return (
    <svg className="big-potato" viewBox="0 0 400 330" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      {/* 머리 위 감자 털 두 가닥 */}
      <g stroke="#e0b27a" strokeWidth="14" strokeLinecap="round">
        <path d="M70 70 L92 98" />
        <path d="M104 52 L118 84" />
      </g>
      {/* 몸(위쪽만, 아래는 화면 밖) */}
      <path d="M-10 340 C -10 150, 80 62, 200 62 C 320 62, 410 150, 410 340 Z" fill={SKIN} stroke={INK} strokeWidth="11" strokeLinejoin="round" />
      {/* 볼 */}
      <ellipse cx="112" cy="226" rx="38" ry="24" fill="#cf9558" opacity="0.4" />
      <ellipse cx="288" cy="226" rx="38" ry="24" fill="#cf9558" opacity="0.4" />
      {/* 눈 (가끔 깜빡임). 흰 눈빛도 눈과 같이 감긴다 */}
      <g className="big-eyes">
        <g className="big-eye">
          <ellipse cx="150" cy="196" rx="14" ry="18" fill={INK} />
          <circle cx="145" cy="189" r="4.5" fill="#fff" />
        </g>
        <g className="big-eye">
          <ellipse cx="250" cy="196" rx="14" ry="18" fill={INK} />
          <circle cx="245" cy="189" r="4.5" fill="#fff" />
        </g>
      </g>
      {/* 입 */}
      <path d="M178 226 Q 200 246 222 226" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      {/* 감자 점 */}
      <ellipse cx="340" cy="250" rx="13" ry="19" fill="#7a4a2c" transform="rotate(20 340 250)" />
      <ellipse cx="312" cy="300" rx="12" ry="15" fill="#7a4a2c" transform="rotate(30 312 300)" />
    </svg>
  );
}

export default function Welcome({ name, onStart }) {
  return (
    <div className="welcome">
      <div className="welcome-top">
        {name ? (
          <>
            <h1>반가워, {name}!</h1>
            <p>오늘도 감자랑 같이 커 보자.</p>
          </>
        ) : (
          <>
            <h1>안녕, 나는 감자!</h1>
            <p>
              춘천에 있는 동안 전공 경험,
              <br />
              나랑 같이 키워 보자.
            </p>
          </>
        )}
      </div>
      <div className="welcome-potato">
        <BigPotato />
      </div>
      <button type="button" className="btn primary block welcome-start" onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}
