import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/* 처음 홈에 오면 하나씩 알려 주는 안내 (설정 → 감자 사용법 다시 보기로 다시 볼 수 있다)
   알려 줄 곳만 밝게 뚫어 두고 나머지는 어둡게 덮는다. 뚫린 곳은 실제로 눌러 볼 수 있고,
   'tap' 단계는 눌러 보면 다음으로 넘어간다(감자 반응을 볼 수 있게 조금 기다렸다가). */
export const TOUR_STEPS = [
  {
    sel: '.live-potato',
    title: '나를 눌러 봐!',
    body: '한 번 누르면 폴짝 뛰고, 빠르게 세 번 누르면 간지러워해. 밤 11시가 넘으면 잠들어.',
    tap: true,
  },
  {
    sel: '.care-side',
    title: '물 · 햇빛 · 거름',
    body: '물은 하루 한 번 앱을 열면, 햇빛은 기회 원문을 열거나 스크랩하면, 거름은 할 일에 기록을 남기면 생겨. 아이콘을 눌러 나한테 줘 봐!',
    tap: true,
  },
  {
    sel: '.home-stats',
    title: '개수랑 기운',
    body: '가진 개수와 내 기운이야. 기운은 하루에 조금씩 빠져. 기록 3개마다 머리 위 싹이 한 칸씩 자라.',
  },
  {
    sel: '.home-float',
    title: '다음 할 일',
    body: '지금 학년에 할 일을 하나씩 알려 줄게. 하고 나서 로드맵에 한 줄 남기면 거름이 생겨.',
  },
  {
    sel: '.tabbar',
    title: '아래 탭',
    body: '기회 · 로드맵 · 홈 · 커뮤니티 · 나. 선배 조언과 질문은 커뮤니티, 스크랩과 설정은 맨 오른쪽 "나"에 있어.',
  },
];

const PAD = 8;

export default function Tour({ onDone }) {
  const [i, setI] = useState(0);
  const [box, setBox] = useState(null); // 뚫을 곳 (폰 화면 기준 좌표)
  const [size, setSize] = useState({ w: 0, h: 0 });
  const ref = useRef(null);
  const step = TOUR_STEPS[i];
  const last = i === TOUR_STEPS.length - 1;
  const next = () => (last ? onDone() : setI((n) => n + 1));

  // 알려 줄 곳의 위치를 잰다 (화면 크기가 바뀌거나 감자가 움직여도 다시)
  useLayoutEffect(() => {
    const measure = () => {
      const phone = ref.current?.parentElement;
      const el = phone?.querySelector(step.sel);
      if (!phone || !el) return setBox(null);
      const p = phone.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setSize({ w: p.width, h: p.height });
      setBox({ x: Math.round(r.left - p.left - PAD), y: Math.round(r.top - p.top - PAD), w: Math.round(r.width + PAD * 2), h: Math.round(r.height + PAD * 2) });
    };
    measure();
    const t = setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [step.sel]);

  // 눌러 보는 단계: 그 곳을 누르면 반응을 잠깐 보여 주고 다음으로
  useEffect(() => {
    if (!step.tap) return undefined;
    const el = ref.current?.parentElement?.querySelector(step.sel);
    let t;
    const onTap = () => {
      clearTimeout(t);
      t = setTimeout(() => setI((n) => n + 1), 1300);
    };
    el?.addEventListener('click', onTap);
    return () => {
      clearTimeout(t);
      el?.removeEventListener('click', onTap);
    };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  // 설명 카드는 뚫린 곳 아래 공간이 넉넉하면 아래, 아니면 위에
  const below = box && box.y + box.h + 190 < size.h;
  const cardStyle = !box ? { top: '30%' } : below ? { top: box.y + box.h + 12 } : { bottom: size.h - box.y + 12 };
  const hole = box ?? { x: 0, y: 0, w: 0, h: 0 };

  return (
    <div className="tour" ref={ref} role="dialog" aria-modal="true" aria-label="감자 사용법">
      {/* 뚫린 곳을 뺀 네 조각만 덮어서, 뚫린 곳은 그대로 누를 수 있게 */}
      <i className="tour-dim" style={{ left: 0, top: 0, right: 0, height: Math.max(0, hole.y) }} />
      <i className="tour-dim" style={{ left: 0, top: hole.y + hole.h, right: 0, bottom: 0 }} />
      <i className="tour-dim" style={{ left: 0, top: hole.y, width: Math.max(0, hole.x), height: hole.h }} />
      <i className="tour-dim" style={{ left: hole.x + hole.w, top: hole.y, right: 0, height: hole.h }} />
      {box && <i className="tour-ring" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />}

      <div className="tour-card" style={cardStyle} key={i}>
        <span className="tour-count">
          {i + 1} / {TOUR_STEPS.length}
        </span>
        <b>{step.title}</b>
        <p>{step.body}</p>
        <div className="tour-actions">
          <button type="button" className="link" onClick={onDone}>
            건너뛰기
          </button>
          <button type="button" className="pill tour-next" onClick={next}>
            {last ? '시작!' : step.tap ? '그냥 넘기기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}
