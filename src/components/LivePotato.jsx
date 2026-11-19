import { useEffect, useRef, useState } from 'react';
import Mascot from './Mascot.jsx';

/* 살아 있는 감자 (홈 가운데)
   - 가만히 있어도 숨 쉬듯 들썩이고, 가끔 눈을 깜빡인다
   - 누르면 폴짝 뛰고 한마디, 빠르게 세 번 넘게 누르면 간지러워 몸을 비튼다
   - 기운이 낮으면 축 처져서 느리게 숨 쉰다, 밤(11시~7시)에는 잔다
   - 물·햇빛·거름을 주면 그 효과(fx)가 감자 위에 잠깐 보인다
   onPoke('poke' | 'tickle')로 홈이 말풍선을 바꾼다 */
export default function LivePotato({ mood, size = 168, grow = 0, vital = 60, fx = null, sleeping = false, onPoke }) {
  const [anim, setAnim] = useState(null);
  const taps = useRef([]);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const poke = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 1200), now];
    const kind = taps.current.length >= 3 ? 'tickle' : 'poke';
    if (kind === 'tickle') taps.current = [];
    setAnim(null);
    // 같은 동작을 연달아 해도 처음부터 다시 움직이게 한 프레임 비웠다가 넣는다
    requestAnimationFrame(() => setAnim(sleeping ? 'stir' : kind === 'tickle' ? 'tickle' : 'jump'));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAnim(null), 900);
    onPoke?.(kind);
  };

  const cls = ['live-potato', anim, vital < 40 ? 'droop' : '', sleeping ? 'sleep' : ''].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} data-mood={mood} aria-label="감자 쓰다듬기" onClick={poke}>
      <span className="live-body">
        <Mascot mood={mood} size={size} grow={grow} blink={!sleeping} sleeping={sleeping} />
      </span>
      {sleeping && (
        <span className="zzz" aria-hidden="true">
          <i>z</i>
          <i>z</i>
          <i>Z</i>
        </span>
      )}
      {fx && (
        <span className={`care-fx fx-${fx}`} aria-hidden="true">
          {fx === 'water' && [0, 1, 2, 3, 4].map((i) => <i key={i} style={{ '--i': i }} />)}
          {fx === 'sun' && <i />}
          {fx === 'compost' && [0, 1, 2, 3, 4, 5].map((i) => <i key={i} style={{ '--i': i }} />)}
        </span>
      )}
    </button>
  );
}
