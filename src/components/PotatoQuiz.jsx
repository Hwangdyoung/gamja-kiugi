import { useEffect, useState } from 'react';
import calm from '../assets/potato-types/calm.webp';
import cheerful from '../assets/potato-types/cheerful.webp';
import searching from '../assets/potato-types/searching.webp';
import creative from '../assets/potato-types/creative.webp';
import dependable from '../assets/potato-types/dependable.webp';
import { TypeIcon, statusOf, typeKey } from './OpportunityCard.jsx';
import { POTATO_ORDER, POTATO_TYPES, QUIZ, potatoOf } from '../lib/potatoType.js';

/* 유형 감자 그림 (팀원 그림: 흰 배경을 지우고 키워서 넣음) */
const ART = { calm, cheerful, searching, creative, dependable };

export function TypePotato({ type, size = 64, decorative = false }) {
  return (
    <img
      className="pt-potato"
      src={ART[type]}
      width={size}
      height={size}
      alt={decorative ? '' : POTATO_TYPES[type].name}
      draggable="false"
    />
  );
}

/* 나 → 감자 유형 테스트: 소개 → 8문항 → 캐는 중 → 결과(잘 맞는 기회 유형 + 지금 열린 기회).
   결과는 나 화면 이름 아래 칩으로 남는다 */
export default function PotatoQuiz({ result, items, today, onDone, onOpen, onFindOpps }) {
  const [stage, setStage] = useState(result ? 'result' : 'intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState(() => QUIZ.map(() => null));
  const [picked, setPicked] = useState(null); // 방금 누른 보기 (잠깐 표시하고 넘어간다)

  useEffect(() => {
    if (picked === null) return undefined;
    const t = setTimeout(() => {
      setPicked(null);
      if (i < QUIZ.length - 1) setI(i + 1);
      else setStage('dig');
    }, 180);
    return () => clearTimeout(t);
  }, [picked, i]);
  useEffect(() => {
    if (stage !== 'dig') return undefined;
    const t = setTimeout(() => {
      onDone(potatoOf(answers));
      setStage('result');
    }, 1100);
    return () => clearTimeout(t);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setAnswers(QUIZ.map(() => null));
    setI(0);
    setStage('play');
  };

  if (stage === 'intro') {
    return (
      <section className="pt-intro">
        <span className="pt-kicker">8문항 · 1분</span>
        <h2>나는 어떤 감자일까?</h2>
        <p>춘천 캠퍼스 생활로 알아보는 내 감자 유형. 결과에 맞춰 잘 맞는 기회도 골라 드려요.</p>
        <ul className="pt-lineup" aria-label="감자 유형 다섯 가지">
          {POTATO_ORDER.map((t) => (
            <li key={t}>
              <TypePotato type={t} size={52} decorative />
              <span>{POTATO_TYPES[t].short}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn primary block" onClick={start}>
          내 감자 캐러 가기
        </button>
      </section>
    );
  }

  if (stage === 'play') {
    const q = QUIZ[i];
    return (
      <section className="pt-play" aria-live="polite">
        <div className="pt-progress">
          <button type="button" className="link" onClick={() => (i ? setI(i - 1) : setStage(result ? 'result' : 'intro'))}>
            ← 이전
          </button>
          <span className="pt-count">
            {i + 1} / {QUIZ.length}
          </span>
        </div>
        <span className="bar" role="progressbar" aria-label="테스트 진행" aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={QUIZ.length}>
          <i style={{ width: `${((i + 1) / QUIZ.length) * 100}%` }} />
        </span>
        <h2 key={i} className="pt-q">
          <small>Q{i + 1}.</small>
          {q.question}
        </h2>
        <div className="pt-choices">
          {q.choices.map((c, n) => (
            <button
              key={c.type}
              type="button"
              className={`pt-choice${picked === n ? ' on' : answers[i] === c.type && picked === null ? ' was' : ''}`}
              disabled={picked !== null}
              onClick={() => {
                setAnswers((a) => a.map((v, k) => (k === i ? c.type : v)));
                setPicked(n);
              }}
            >
              <span className="pt-num">{n + 1}</span>
              <span>{c.text}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (stage === 'dig') {
    return (
      <section className="pt-dig" aria-live="polite">
        <span className="pt-dig-potato">
          <TypePotato type="searching" size={92} decorative />
        </span>
        <h2>춘천 감자밭에서 나를 캐는 중…</h2>
        <p>8가지 답을 모아 딱 맞는 감자를 찾고 있어요</p>
      </section>
    );
  }

  const me = POTATO_TYPES[result];
  const partner = POTATO_TYPES[me.partner];
  const fit = items.filter((it) => me.fits.includes(it.type)).slice(0, 3);
  return (
    <div className="pt-result" style={{ '--pt-h': me.hue }}>
      <section className="pt-card">
        <span className="pt-kicker">나의 캠퍼스 감자 유형</span>
        <TypePotato type={result} size={132} />
        <h2>{me.name}</h2>
        <p>{me.oneLiner}</p>
        <ol className="pt-traits">
          {me.traits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </section>

      <section className="pt-partner" aria-label="환상의 팀플 파트너">
        <TypePotato type={me.partner} size={56} decorative />
        <span>
          <small>환상의 팀플 파트너</small>
          <b>{partner.name}</b>
          <small>{partner.oneLiner}</small>
        </span>
      </section>

      <section className="pt-fit" aria-label="잘 맞는 기회">
        <h3>
          잘 맞는 기회
          {me.fits.map((f) => (
            <span key={f} className={`pt-fit-tag t-${typeKey(f)}`}>
              {f}
            </span>
          ))}
        </h3>
        <p>{me.why}</p>
        {fit.length ? (
          <div className="me-saved">
            {fit.map((it) => {
              const st = statusOf(it, today);
              return (
                <div key={it.id} className="me-row">
                  <button type="button" className="me-row-main" onClick={() => onOpen(it.id)}>
                    <span className={`me-thumb t-${typeKey(it.type)}`} aria-hidden="true">
                      <TypeIcon type={it.type} size={24} strokeWidth={1.7} />
                    </span>
                    <span className="me-row-text">
                      <b>{it.title}</b>
                      <small>
                        {it.org} · {it.type}
                      </small>
                    </span>
                    <span className={`status ${st.tone}`}>{st.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="fine">지금 열린 {me.fits.join('·')} 기회가 없어요. 새 공고가 올라오면 기회 탭에 보여요.</p>
        )}
        <button type="button" className="btn primary block" onClick={() => onFindOpps(me.fits)}>
          기회 탭에서 모아 보기
        </button>
      </section>

      <button type="button" className="btn ghost block" onClick={start}>
        테스트 다시 하기
      </button>
    </div>
  );
}
