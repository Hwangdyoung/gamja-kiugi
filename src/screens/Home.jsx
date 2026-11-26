import { useLayoutEffect, useRef, useState } from 'react';
import { GROW_LABELS } from '../components/Mascot.jsx';
import LivePotato from '../components/LivePotato.jsx';
import HomeScene from '../components/HomeScene.jsx';
import { ChevronIcon, DropIcon, SproutIcon, SunIcon } from '../components/Icons.jsx';
import { CARE, CARE_KINDS, SLEEPY, pokeLine, tickleLine, vitalLabel } from '../lib/care.js';
import { voiceOf } from '../lib/potatoType.js';
import { WEATHER_LABEL } from '../lib/weather.js';

// 날씨에 따라 가끔 하는 말
const WEATHER_LINE = { rain: '비 와도 우산 있으니까 괜찮아!', snow: '눈이다! 근데 발 시려…', cloudy: '오늘은 좀 흐리네' };

const CARE_ICON = { water: DropIcon, sun: SunIcon, compost: SproutIcon };

/* 홈 (11/20): 감자가 주인공인 한 화면
   - 가운데: 인사 · 말풍선 · 살아 있는 감자(누르면 반응), 오른쪽에 물·햇빛·거름 아이콘
   - 감자 아래: 가진 개수 · 기운 · 성장(기록 3개마다 싹 한 칸)
   - 아래: 탭 바 위에 떠 있는 "다음 할 일" 카드 하나. 기회 목록·검색은 기회 탭에서 본다 */
export default function Home({ name, progress, mood: baseMood, message, items, urgent = [], nag = null, outfit = null, onOpen, care, vital = 60, sleeping = false, time = 'day', weather = 'clear', temp = null, onGive, onTab }) {
  /* 스크랩만 하고 지원 안 한 기회가 마감 7일 안이면 감자가 그걸 콕 집어 조른다.
     웃던 감자는 시무룩(무표정)해지고, 화난 감자는 원래 말(접속 독촉)을 그대로 한다 */
  const nagOn = !!nag && baseMood !== 'angry';
  const mood = nagOn && baseMood === 'happy' ? 'neutral' : baseMood;
  const [say, setSay] = useState(null);
  const [fx, setFx] = useState(null);
  const sayTimer = useRef(null);
  const fxTimer = useRef(null);
  const count = useRef(0);
  // 화면 높이에 맞춰 감자 크기를 줄인다(사파리 주소창처럼 화면이 짧아도 아래 카드가 가리지 않게).
  // 날씨·인사·말풍선·숫자 칸이 약 330px를 쓰고, 남는 높이에 감자를 넣는다
  const heroRef = useRef(null);
  const [pot, setPot] = useState(186);
  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const fit = () => setPot(Math.round(Math.max(92, Math.min(186, (el.clientHeight - 330) / 1.16))));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { next, stages, current, grow } = progress;
  const ni = next ? next.stage : -1;
  const related = next?.task.own ? items.filter((it) => it.step === ni).length : 0;

  const speak = (text) => {
    setSay(text);
    clearTimeout(sayTimer.current);
    sayTimer.current = setTimeout(() => setSay(null), 2600);
  };
  const onPoke = (kind) => {
    const n = count.current++;
    const w = WEATHER_LINE[weather];
    const voice = voiceOf(outfit); // 테스트한 감자 유형 말투
    speak(sleeping ? SLEEPY[n % SLEEPY.length] : kind === 'tickle' ? tickleLine(n, voice) : w && n % 3 === 1 ? w : pokeLine(mood, n, voice));
  };
  const giveCare = (kind) => {
    if (!care || care.stock[kind] < 1) return speak(CARE[kind].how);
    onGive(kind);
    setFx(null);
    requestAnimationFrame(() => setFx(kind));
    clearTimeout(fxTimer.current);
    fxTimer.current = setTimeout(() => setFx(null), 1500);
    speak(sleeping ? '음냐… 고마워…' : CARE[kind].thanks[count.current++ % CARE[kind].thanks.length]);
  };

  return (
    <div className="home" data-mood={mood} data-time={time} data-weather={weather}>
      <HomeScene time={time} weather={weather} />
      <section className="home-hero" aria-label="내 감자" ref={heroRef}>
        <span className="weather-chip">
          춘천 {WEATHER_LABEL[weather]}
          {temp != null && ` ${temp}°`}
        </span>
        <p className="home-hi">
          {next ? (
            ni === current ? (
              <>
                {name}, <b>{ni + 1}학년</b>엔 이것부터 해 볼까?
              </>
            ) : (
              <>
                {name}, <b>{ni + 1}학년</b> 할 일 하나 남았어.
              </>
            )
          ) : (
            <>{name}, 이제 지원서 쓸 차례.</>
          )}
        </p>
        {/* 몽실몽실 구름 말풍선: 감자 쪽으로 작은 구름 두 개가 이어진다. 말이 바뀌면 통 튀어나온다 */}
        <div className="home-bubble" key={say ?? 'base'} aria-live="polite">
          <p>{say ?? (sleeping ? '쿨… 쿨… (밤에는 감자가 자요)' : nagOn ? nag.line : message)}</p>
          <i className="bump b1" />
          <i className="bump b2" />
          <i className="bump b3" />
          <i className="bump b4" />
          <i className="puff p1" />
          <i className="puff p2" />
        </div>

        <div className="potato-stage">
          <LivePotato mood={mood} size={pot} grow={grow} vital={vital} fx={fx} sleeping={sleeping} umbrella={weather === 'rain'} outfit={outfit} onPoke={onPoke} />
          {care && (
            <div className="care-side" data-tour="care" role="group" aria-label="감자 돌보기">
              {CARE_KINDS.map((k) => {
                const Icon = CARE_ICON[k];
                return (
                  <button
                    key={k}
                    type="button"
                    className={`care-icon care-${k}${care.stock[k] ? '' : ' empty'}`}
                    aria-label={`${CARE[k].label} 주기, ${care.stock[k]}개 있음`}
                    title={`${CARE[k].label} 주기`}
                    onClick={() => giveCare(k)}
                  >
                    <Icon size={22} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="home-stats" data-tour="stats">
          {care && (
            <p className="stock-line" aria-label="가진 돌보기">
              {CARE_KINDS.map((k) => (
                <span key={k} className={`stock stock-${k}`}>
                  {CARE[k].label} <b>{care.stock[k]}</b>
                </span>
              ))}
            </p>
          )}
          <div className="vital-line">
            <small>기운</small>
            <span className="vital-bar" role="meter" aria-label="감자 기운" aria-valuemin={0} aria-valuemax={100} aria-valuenow={vital}>
              <i style={{ width: `${vital}%` }} />
            </span>
            <small className="vital-word">{vitalLabel(vital)}</small>
          </div>
          <div className="home-grow">
            <span className="grow-label">{GROW_LABELS[grow]}</span>
            <span className="grow-dots" role="progressbar" aria-label="로드맵 진행" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.count}>
              {stages.map((s, i) => (
                <i key={i} className={s.tasks.every(progress.isDone) ? 'on' : ''} />
              ))}
            </span>
            <b className="grow-count">
              기록 {progress.count} / {progress.total}
            </b>
          </div>
        </div>
      </section>

      <div className="home-float" data-tour="next">
        <div className="float-card">
          <span className="eyebrow">{next ? `다음 할 일 · ${ni + 1}학년 ${stages[ni].label}` : '모든 할 일 기록'}</span>
          <b className="float-title">{next ? next.task.t : '남긴 기록으로 지원서를 써 보세요'}</b>
          <span className="float-sub">
            {nag ? (
              <button type="button" className="link warn-link" onClick={() => onOpen?.(nag.id)}>
                {nag.left === 0 ? '오늘 마감' : `D-${nag.left}`} · 스크랩한 기회 지원하러 가기
              </button>
            ) : urgent.length > 0 ? (
              <button type="button" className="link warn-link" onClick={() => onTab('opps')}>
                스크랩한 기회 마감 임박 {urgent.length}건
              </button>
            ) : related > 0 ? (
              `이 할 일에 맞는 기회 ${related}건이 있어요`
            ) : (
              stages[next ? ni : 3].goal
            )}
          </span>
          <button type="button" className="pill" onClick={() => onTab('path')}>
            {next ? '하러 가기' : '기록 보기'}
            <ChevronIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
