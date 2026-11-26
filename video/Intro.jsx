import Mascot from '../src/components/Mascot.jsx';
import { TypePotato } from '../src/components/PotatoQuiz.jsx';
import shotRoadmap from './shots/roadmap.png';
import shotOpps from './shots/opps.png';
import shotHome from './shots/home.png';
import shotQuiz from './shots/quiz.png';
import shotApply from './shots/apply.png';

/* 감자 키우기 소개 영상. 모든 움직임은 시각 t(초)로만 정해진다 → 프레임마다 똑같이 다시 그릴 수 있다.
   종이 위에 오려 붙인 스티커처럼: 흰 테두리 + 그림자, 초당 8번 살짝 떨리는(스톱모션) 기울기 */
export const DURATION = 40;

const clamp = (x) => Math.max(0, Math.min(1, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const out3 = (x) => 1 - (1 - x) ** 3;
const back = (x) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
};
const pop = (t, a, d = 0.5) => back(prog(t, a, a + d));
const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
// 스톱모션 떨림: 초당 8번 바뀌는 작은 기울기
const wob = (t, seed, amp = 1.2) => amp * (hash(Math.floor(t * 8) + seed * 17.3) - 0.5) * 2;
const blinkAt = (t, seed = 0) => (t + seed) % 3.4 < 0.13;

/* 장면 안팎: 들어올 때 통, 나갈 때 쏙 */
function Scene({ t, from, to, children }) {
  if (t < from - 0.01 || t > to + 0.01) return null;
  const outP = prog(t, to - 0.35, to);
  return (
    <div className="scene" style={{ opacity: 1 - outP, transform: `scale(${1 - 0.06 * out3(outP)})` }}>
      {children}
    </div>
  );
}

/* 오려 붙인 것: (x, y)가 가운데 */
function Piece({ x, y, s = 1, r = 0, o = 1, className = '', children, style }) {
  return (
    <div className={`piece ${className}`} style={{ left: x, top: y, opacity: o, transform: `translate(-50%, -50%) rotate(${r}deg) scale(${s})`, ...style }}>
      {children}
    </div>
  );
}

function Potato({ t, x, y, size, s = 1, r = 0, seed = 0, mood = 'happy', grow = 0, outfit = null, bounce = 0 }) {
  return (
    <Piece x={x} y={y - bounce} s={s} r={r + wob(t, seed, 1.4)} className="sticker">
      <Mascot mood={mood} size={size} grow={grow} outfit={outfit} sleeping={blinkAt(t, seed)} />
    </Piece>
  );
}

function Bubble({ t, x, y, at, text, size = 46, r = -2, seed = 3, tail = 'down' }) {
  const s = pop(t, at, 0.45);
  if (s <= 0) return null;
  return (
    <Piece x={x} y={y} s={s} r={r + wob(t, seed, 0.8)}>
      <div className={`bubble tail-${tail}`} style={{ fontSize: size }}>
        {text}
      </div>
    </Piece>
  );
}

function Phone({ t, x, y, src, r = 0, at, from = 'right', seed = 5, w = 360 }) {
  const k = out3(prog(t, at, at + 0.7));
  const dx = (from === 'right' ? 1 : -1) * 900 * (1 - k);
  return (
    <Piece x={x + dx} y={y} r={r + (1 - k) * (from === 'right' ? 14 : -14) + wob(t, seed, 0.5)}>
      <div className="phone" style={{ width: w }}>
        <img src={src} alt="" width={w} />
        <i className="tape t1" />
        <i className="tape t2" />
      </div>
    </Piece>
  );
}

function Caption({ t, at, until, children }) {
  const inP = out3(prog(t, at, at + 0.4));
  const outP = prog(t, until - 0.3, until);
  if (t < at || t > until) return null;
  return (
    <div className="caption-wrap" style={{ opacity: inP * (1 - outP), transform: `translate(-50%, ${(1 - inP) * 30}px) rotate(${-0.6 + wob(t, 9, 0.25)}deg)` }}>
      <p className="caption">{children}</p>
    </div>
  );
}

function Title({ t, at, text, size, x, y, color = 'var(--ink)', gap = 0.07 }) {
  return (
    <div className="title" style={{ left: x, top: y, fontSize: size, color }}>
      {[...text].map((ch, i) => {
        const s = pop(t, at + i * gap, 0.4);
        return (
          <span key={i} style={{ transform: `translateY(${(1 - s) * -40}px) scale(${0.4 + 0.6 * s}) rotate(${wob(t, i + 40, 2)}deg)`, opacity: clamp(s * 3) }}>
            {ch === ' ' ? ' ' : ch}
          </span>
        );
      })}
    </div>
  );
}

/* 아이콘 (앱 아이콘과 같은 뜻: 물·햇빛·거름) */
const Drop = () => (
  <svg viewBox="0 0 64 64" width="84" height="84"><path d="M32 6C24 18 14 28 14 40a18 18 0 0 0 36 0C50 28 40 18 32 6Z" fill="#7cc4f0" stroke="#3a2a20" strokeWidth="4" strokeLinejoin="round" /><path d="M24 40a8 8 0 0 0 8 8" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>
);
const Sun = () => (
  <svg viewBox="0 0 64 64" width="88" height="88"><g stroke="#3a2a20" strokeWidth="4" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="32" y1="6" x2="32" y2="13" transform={`rotate(${a} 32 32)`} />)}</g><circle cx="32" cy="32" r="13" fill="#ffd35c" stroke="#3a2a20" strokeWidth="4" /></svg>
);
const Leaf = () => (
  <svg viewBox="0 0 64 64" width="84" height="84"><g stroke="#3a2a20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M32 58V30" /><path d="M32 36C32 24 23 18 12 19c1 11 9 17 20 17Z" fill="#7cc97a" /><path d="M32 31c0-11 8-17 19-16-1 11-8 16-19 16Z" fill="#9edb8a" /></g><path d="M18 58h28" stroke="#8a5a3b" strokeWidth="5" strokeLinecap="round" /></svg>
);
const Check = () => (
  <svg viewBox="0 0 40 40" width="46" height="46"><circle cx="20" cy="20" r="17" fill="#6cc070" stroke="#3a2a20" strokeWidth="3.5" /><path d="M12 20.5l5.5 5.5L28.5 14" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/* ── 장면들 ── */
const S = {
  open: [0, 4.4],
  title: [4.4, 8],
  road: [8, 14],
  opps: [14, 19.6],
  care: [19.6, 25.6],
  quiz: [25.6, 31.4],
  apply: [31.4, 36.2],
  end: [36.2, 40],
};

function Open({ t }) {
  const rise = back(prog(t, 0.3, 1.1));
  const second = t > 2.55;
  return (
    <Scene t={t} from={S.open[0]} to={S.open[1]}>
      <Piece x={960} y={650} s={pop(t, 0.15, 0.6)} r={-3}>
        <div className="blob" style={{ width: 760, height: 520, background: 'var(--wash-green)' }} />
      </Piece>
      <Potato t={t} x={960} y={1320 - 680 * rise} size={380} r={second ? 3 : -2} bounce={second ? 18 * Math.abs(Math.sin((t - 2.55) * 7)) * (1 - prog(t, 2.55, 3.4)) : 0} />
      {!second ? (
        <Bubble t={t} x={960} y={235} at={1.15} text="춘천엔 할 게 없다고?" size={64} />
      ) : (
        <Bubble t={t} x={960} y={235} at={2.55} text="있어! 나랑 같이 찾자." size={64} r={2} seed={4} />
      )}
    </Scene>
  );
}

function TitleCard({ t }) {
  return (
    <Scene t={t} from={S.title[0]} to={S.title[1]}>
      <Piece x={960} y={500} s={pop(t, 4.45, 0.55)} r={-2.5 + wob(t, 2, 0.4)}>
        <div className="paper-sheet" style={{ width: 1180, height: 400, background: 'var(--wash-sky)' }} />
      </Piece>
      <Title t={t} at={4.75} text="감자 키우기" size={190} x={1040} y={470} gap={0.1} />
      <Potato t={t} x={470} y={455} size={230} r={-8} s={pop(t, 4.6, 0.5)} seed={2} grow={1} />
      <Piece x={1010} y={760} o={out3(prog(t, 5.9, 6.4))} r={-1}>
        <p className="tagline">춘천 대학생이 감자랑 같이 크는 앱</p>
      </Piece>
    </Scene>
  );
}

const ROWS = [
  ['1학년', '탐색', 9.1],
  ['2학년', '첫 경험', 9.95],
  ['3학년', '실무', 10.8],
  ['4학년', '정리·지원', 11.65],
];

function Road({ t }) {
  const done = ROWS.filter(([, , at]) => t >= at + 0.15).length;
  return (
    <Scene t={t} from={S.road[0]} to={S.road[1]}>
      <Phone t={t} x={520} y={515} src={shotRoadmap} r={-4} at={8.05} from="left" />
      <Title t={t} at={8.4} text="학년마다 할 일, 하나씩" size={84} x={1290} y={210} gap={0.045} />
      {ROWS.map(([g, label, at], i) => (
        <Piece key={g} x={1150} y={380 + i * 112} s={pop(t, 8.6 + i * 0.12, 0.45)} r={wob(t, 20 + i, 0.6) + (i % 2 ? 1 : -1)}>
          <div className="row-card">
            <b>{g}</b>
            <span>{label}</span>
            <span className="row-check" style={{ transform: `scale(${pop(t, at, 0.4)})` }}>
              <Check />
            </span>
          </div>
        </Piece>
      ))}
      <Potato t={t} x={1610} y={640} size={250} s={pop(t, 8.9, 0.5)} r={3} seed={7} grow={done} bounce={ROWS.some(([, , at]) => t > at && t < at + 0.35) ? 14 : 0} />
      <Caption t={t} at={9} until={S.road[1]}>
        로드맵 할 일에 기록을 남길 때마다 감자 싹이 자라요
      </Caption>
    </Scene>
  );
}

const CARDS = [
  ['공모전', '춘천여행 SNS 공모전', 'var(--t-contest)', -9],
  ['서포터즈', '춘천인재육성장학재단 서포터즈', 'var(--t-sup)', 5],
  ['인턴', '미래내일 일경험 사업', 'var(--t-intern)', -4],
  ['현장실습', '강원대 동계 현장실습학기제', 'var(--t-field)', 7],
];

function Opps({ t }) {
  return (
    <Scene t={t} from={S.opps[0]} to={S.opps[1]}>
      <Phone t={t} x={1420} y={515} src={shotOpps} r={3.5} at={14.05} />
      <Title t={t} at={14.35} text="춘천 기회, 한곳에" size={92} x={600} y={200} gap={0.05} />
      {CARDS.map(([type, title, color, r], i) => {
        const k = back(prog(t, 15 + i * 0.35, 15.55 + i * 0.35));
        const col = i % 2;
        const row = Math.floor(i / 2);
        return (
          <Piece key={type} x={400 + col * 400 + (1 - k) * -700} y={430 + row * 250} r={r * k + wob(t, 30 + i, 0.6)} o={clamp(k * 2)}>
            <div className="opp-card" style={{ '--c': color }}>
              <span>{type}</span>
              <b>{title}</b>
            </div>
          </Piece>
        );
      })}
      <Caption t={t} at={15.2} until={S.opps[1]}>
        춘천·강원의 공모전, 서포터즈, 인턴을 내 학년에 맞춰 골라 줘요
      </Caption>
    </Scene>
  );
}

const CARE_STEPS = [
  [20.6, Drop, '꿀꺽꿀꺽, 시원해!', '#cfe9fb'],
  [22.0, Sun, '따뜻해~ 광합성 중', '#fff0bf'],
  [23.4, Leaf, '영양 만점! 쑥쑥 클게', '#dcf3d3'],
];

function Care({ t }) {
  const cur = [...CARE_STEPS].reverse().find(([at]) => t >= at);
  const hit = CARE_STEPS.find(([at]) => t > at + 0.45 && t < at + 0.85);
  const vital = 0.35 + 0.65 * (CARE_STEPS.filter(([at]) => t > at + 0.5).length / 3);
  return (
    <Scene t={t} from={S.care[0]} to={S.care[1]}>
      <Phone t={t} x={1460} y={515} src={shotHome} r={-3} at={19.65} />
      <Piece x={680} y={560} s={pop(t, 19.7, 0.6)} r={2}>
        <div className="blob" style={{ width: 720, height: 560, background: cur ? cur[3] : 'var(--wash-green)' }} />
      </Piece>
      <Potato t={t} x={680} y={560} size={320} s={pop(t, 19.9, 0.5) * (hit ? 1.05 : 1)} r={-2} seed={11} grow={2} bounce={hit ? 20 : 0} />
      {CARE_STEPS.map(([at, Icon], i) => {
        const fall = out3(prog(t, at, at + 0.45));
        const gone = prog(t, at + 0.45, at + 0.65);
        if (t < at || gone >= 1) return null;
        return (
          <Piece key={at} x={680 + (i - 1) * 40} y={-80 + 380 * fall} s={1 - gone} r={wob(t, 50 + i, 6)} className="sticker">
            <Icon />
          </Piece>
        );
      })}
      {cur && <Bubble key={cur[0]} t={t} x={680} y={190} at={cur[0] + 0.5} text={cur[2]} size={52} seed={12} />}
      <Piece x={680} y={850} s={pop(t, 20.1, 0.45)} r={-1}>
        <div className="vital">
          <span>기운</span>
          <i>
            <b style={{ width: `${vital * 100}%` }} />
          </i>
        </div>
      </Piece>
      <Caption t={t} at={20.2} until={S.care[1]}>
        물·햇빛·거름으로 감자를 돌봐요. 거름은 내 기록에서 생겨요
      </Caption>
    </Scene>
  );
}

const TYPES = [
  ['calm', '차분한 감자', '동그란 안경'],
  ['cheerful', '활발한 감자', '노란 머리띠'],
  ['searching', '탐구하는 감자', '탐험 모자'],
  ['creative', '창의적인 감자', '빨간 베레모'],
  ['dependable', '든든한 감자', '네모 안경'],
];

function Quiz({ t }) {
  const dressed = t > 28.4;
  return (
    <Scene t={t} from={S.quiz[0]} to={S.quiz[1]}>
      <Title t={t} at={25.7} text="나는 어떤 감자일까?" size={96} x={960} y={150} gap={0.05} />
      {TYPES.map(([type, name, prop], i) => {
        const x = 300 + i * 330;
        const hop = Math.max(0, Math.sin((t - 26.6 - i * 0.18) * 6)) * 16 * (t > 26.6 ? 1 : 0);
        const swap = pop(t, 28.4 + i * 0.12, 0.45);
        return (
          <div key={type}>
            {!dressed || t < 28.4 + i * 0.12 ? (
              <Piece x={x} y={520 - hop} s={pop(t, 26.0 + i * 0.15, 0.5)} r={wob(t, 60 + i, 2)} className="sticker">
                <TypePotato type={type} size={250} decorative />
              </Piece>
            ) : (
              <Potato t={t} x={x} y={530 - hop} size={250} s={swap} seed={60 + i} outfit={type} r={i % 2 ? 3 : -3} />
            )}
            <Piece x={x} y={760} s={pop(t, 26.4 + i * 0.15, 0.45)} r={(i % 2 ? 2 : -2) + wob(t, 70 + i, 0.6)}>
              <div className="tag">
                <b>{name}</b>
                <small style={{ opacity: out3(prog(t, 28.6 + i * 0.12, 29 + i * 0.12)) }}>{prop}</small>
              </div>
            </Piece>
          </div>
        );
      })}
      <Caption t={t} at={26.8} until={28.3}>
        8문항 테스트로 내 감자 유형을 찾아요
      </Caption>
      <Caption t={t} at={28.4} until={S.quiz[1]}>
        결과에 맞춰 내 감자가 소품을 받고, 말투도 바뀌어요
      </Caption>
    </Scene>
  );
}

function Apply({ t }) {
  const press = t > 32.6 && t < 32.85;
  const stamp = pop(t, 32.8, 0.35);
  const plus = prog(t, 33.1, 34.4);
  return (
    <Scene t={t} from={S.apply[0]} to={S.apply[1]}>
      <Phone t={t} x={1450} y={515} src={shotApply} r={2.5} at={31.45} />
      <Title t={t} at={31.7} text="보고 끝내지 말고, 지원까지" size={80} x={640} y={190} gap={0.04} />
      <Piece x={640} y={470} s={pop(t, 32.0, 0.45) * (press ? 0.9 : 1)} r={-2 + wob(t, 80, 0.5)}>
        <div className="big-btn">✓ 지원했어요</div>
      </Piece>
      {stamp > 0 && (
        <Piece x={905} y={335} s={1 + (1 - stamp) * 1.4} o={clamp(stamp * 2)} r={-14}>
          <div className="stamp">지원 완료!</div>
        </Piece>
      )}
      {plus > 0 && plus < 1 && (
        <Piece x={470} y={420 - plus * 120} o={1 - prog(t, 34, 34.4)} r={-4}>
          <div className="plus">
            <Leaf />
            거름 +1
          </div>
        </Piece>
      )}
      <Potato t={t} x={400} y={760} size={210} s={pop(t, 32.2, 0.5)} seed={14} bounce={t > 32.9 && t < 33.6 ? 18 * Math.abs(Math.sin((t - 32.9) * 9)) : 0} />
      <Bubble t={t} x={800} y={690} at={33.2} text="지원했구나! 결과 나오면 알려 줘." size={44} tail="left" r={1} seed={15} />
      <Caption t={t} at={32.2} until={S.apply[1]}>
        지원하면 거름 1개. 스크랩만 해 둔 기회는 마감 전에 감자가 졸라요
      </Caption>
    </Scene>
  );
}

const CONFETTI = Array.from({ length: 26 }, (_, i) => [hash(i + 1) * 1920, hash(i + 50) * 360, ['#ffd35c', '#9edb8a', '#7cc4f0', '#f6a7a1', '#c9a7f0'][i % 5], hash(i + 99) * 360]);

function End({ t }) {
  const fall = prog(t, 36.6, 40);
  return (
    <Scene t={t} from={S.end[0]} to={S.end[1] + 1}>
      {CONFETTI.map(([x, y0, c, r], i) => (
        <i key={i} className="confetti" style={{ left: x, top: -60 + y0 + fall * 900 * (0.7 + hash(i + 7) * 0.6), background: c, transform: `rotate(${r + fall * 400 * (i % 2 ? 1 : -1)}deg)`, opacity: t > 36.6 ? 1 : 0 }} />
      ))}
      <Piece x={960} y={470} s={pop(t, 36.3, 0.6)} r={-2}>
        <div className="blob" style={{ width: 640, height: 560, background: 'var(--wash-pink)' }} />
      </Piece>
      <Potato t={t} x={960} y={430} size={330} s={pop(t, 36.45, 0.55)} grow={4} seed={20} r={Math.sin(t * 3) * 3} />
      <Title t={t} at={37.0} text="감자 키우기" size={130} x={960} y={790} gap={0.08} />
      <Piece x={960} y={905} o={out3(prog(t, 37.8, 38.3))}>
        <p className="tagline">춘천에서, 감자랑 같이 한 뼘씩.</p>
      </Piece>
      <Piece x={960} y={990} o={out3(prog(t, 38.3, 38.8))}>
        <p className="url">gamki-home.vercel.app</p>
      </Piece>
    </Scene>
  );
}

export default function Intro({ t }) {
  return (
    <div className="stage">
      <div className="paper" />
      <Open t={t} />
      <TitleCard t={t} />
      <Road t={t} />
      <Opps t={t} />
      <Care t={t} />
      <Quiz t={t} />
      <Apply t={t} />
      <End t={t} />
      <div className="grain" />
    </div>
  );
}
