import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useEffect, useState } from 'react';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './intro.css';
import Intro, { DURATION } from './Intro.jsx';

/* 발표용 소개 영상 (1920×1080).
   - 브라우저로 열면 그냥 재생된다 (?t=12 처럼 주면 그 시각에서 멈춤).
   - 영상 뽑기(render.cjs)는 window.__seek(t)로 한 장씩 그려서 캡처한다. */
let setT = () => {};
window.__DURATION = DURATION;
window.__seek = (t) => flushSync(() => setT(t));

function App() {
  const fixed = new URLSearchParams(location.search).get('t');
  const [t, _setT] = useState(fixed ? Number(fixed) : 0);
  setT = _setT;
  useEffect(() => {
    if (fixed || new URLSearchParams(location.search).has('render')) return undefined;
    let raf;
    const t0 = performance.now();
    const loop = (now) => {
      _setT(((now - t0) / 1000) % DURATION);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fixed]);
  return <Intro t={t} />;
}

createRoot(document.getElementById('root')).render(<App />);
