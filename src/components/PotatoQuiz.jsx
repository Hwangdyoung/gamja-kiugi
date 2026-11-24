import { useEffect, useState } from 'react';
import calm from '../assets/potato-types/calm.webp';
import cheerful from '../assets/potato-types/cheerful.webp';
import searching from '../assets/potato-types/searching.webp';
import creative from '../assets/potato-types/creative.webp';
import dependable from '../assets/potato-types/dependable.webp';
import { BackIcon } from './Icons.jsx';
import Mascot from './Mascot.jsx';
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
        <h2>
          나는 어떤
          <br />
          감자일까?
        </h2>
        <p>춘천 캠퍼스 생활 8문항으로 내 감자 유형을 알아보고, 나한테 맞는 기회까지 골라 드려요.</p>
        <ul className="pt-field" aria-label="감자 유형 다섯 가지">
          {POTATO_ORDER.map((t) => (
            <li key={t}>
              <TypePotato type={t} size={68} decorative />
              <span>{POTATO_TYPES[t].short}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="btn primary block pt-go" onClick={start}>
          내 감자 캐러 가기
        </button>
        <small className="pt-note">1분이면 끝나요. 결과는 나 화면에 남아요.</small>
      </section>
    );
  }

  if (stage === 'play') {
    const q = QUIZ[i];
    return (
      <section className="pt-play" aria-live="polite" style={{ '--p': i / (QUIZ.length - 1) }}>
        {/* 진행: 내 감자가 밭고랑을 따라 한 칸씩 걸어가고, 지나온 칸에는 싹이 난다 */}
        <div className="pt-track" role="progressbar" aria-label="테스트 진행" aria-valuenow={i + 1} aria-valuemin={1} aria-valuemax={QUIZ.length} aria-valuetext={`${QUIZ.length}문항 중 ${i + 1}번째`}>
          <ol className="pt-rows" aria-hidden="true">
            {QUIZ.map((_, k) => (
              <li key={k} className={k < i ? 'grown' : k === i ? 'here' : ''}>
                {k < i && (
                  <svg viewBox="0 0 20 20" width="18" height="18">
                    <path d="M10 19V10" />
                    <path d="M10 12C10 7 6.5 5 3 5.5 3.5 9.5 6.5 12 10 12Z" />
                    <path d="M10 10.5C10 6.5 13 4 17 4.5 16.5 8.5 13.5 10.5 10 10.5Z" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
          <span className="pt-walker" aria-hidden="true">
            <span key={i} className="pt-hop">
              <Mascot mood="happy" size={52} />
            </span>
          </span>
          <span className="pt-count" aria-hidden="true">
            {i + 1}
            <small>/{QUIZ.length}</small>
          </span>
        </div>
        <h2 key={i} className="pt-q">
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
              {c.text}
            </button>
          ))}
        </div>
        {i > 0 && (
          <button type="button" className="link pt-prev" onClick={() => setI(i - 1)}>
            <BackIcon size={15} />
            이전 문항
          </button>
        )}
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
      <section className="pt-hero">
        <TypePotato type={result} size={156} />
        <h2>{me.name}</h2>
        <p>{me.oneLiner}</p>
        <ul className="pt-traits" aria-label="캠퍼스 특징">
          {me.traits.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="pt-partner" aria-label="환상의 팀플 파트너">
        <TypePotato type={me.partner} size={60} decorative />
        <p>
          환상의 팀플 파트너는 <b>{partner.name}</b>
          <small>{partner.oneLiner}</small>
        </p>
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

      <button type="button" className="link pt-again" onClick={start}>
        테스트 다시 하기
      </button>
    </div>
  );
}
