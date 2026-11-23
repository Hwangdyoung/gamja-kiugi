import { useMemo, useState } from 'react';
import { KIND_LABEL, dayKey, monthEvents, monthGrid } from '../lib/calendar.js';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const KINDS = ['due', 'open', 'rec'];

/* 나 → 일정: 한 달 달력에 마감 · 모집 열림 · 기록을 점으로 찍는다.
   날짜를 누르면 그날 것만, 다시 누르면 그 달 전체 목록. 기회는 눌러서 상세로, 기록은 로드맵 내 기록으로 */
export default function Calendar({ today, all, saved, log, stages, onOpen, onRecords }) {
  const [cursor, setCursor] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));
  const [picked, setPicked] = useState(null); // 'YYYY-MM-DD' | null(그 달 전체)
  const events = useMemo(
    () => monthEvents({ year: cursor.y, month: cursor.m, all, saved, log, stages }),
    [cursor, all, saved, log, stages],
  );
  const cells = monthGrid(cursor.y, cursor.m);
  const todayKey = dayKey(today);

  const move = (step) => {
    setPicked(null);
    setCursor(({ y, m }) => {
      const d = new Date(y, m + step, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };
  const goToday = () => {
    setCursor({ y: today.getFullYear(), m: today.getMonth() });
    setPicked(todayKey);
  };

  // 아래 목록: 고른 날 하나, 아니면 그 달 전체(날짜 순)
  const days = picked ? [picked] : Object.keys(events).sort();
  const listed = days.filter((k) => events[k]?.length);
  const count = Object.values(events).reduce((n, l) => n + l.length, 0);
  const isThisMonth = cursor.y === today.getFullYear() && cursor.m === today.getMonth();

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => move(-1)} aria-label="지난달">
          ‹
        </button>
        <b aria-live="polite">
          {cursor.y}년 {cursor.m + 1}월
        </b>
        <button type="button" className="cal-nav" onClick={() => move(1)} aria-label="다음 달">
          ›
        </button>
        {!isThisMonth && (
          <button type="button" className="link cal-today" onClick={goToday}>
            오늘
          </button>
        )}
      </div>

      <div className="cal-grid" role="grid" aria-label={`${cursor.y}년 ${cursor.m + 1}월 달력`}>
        {WEEK.map((w, i) => (
          <span key={w} className={`cal-week${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`} aria-hidden="true">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} className="cal-day empty" />;
          const k = dayKey(d);
          const evs = events[k] ?? [];
          const kinds = KINDS.filter((kind) => evs.some((e) => e.kind === kind));
          const label = `${d.getMonth() + 1}월 ${d.getDate()}일${evs.length ? `, ${kinds.map((kind) => KIND_LABEL[kind]).join(' · ')} ${evs.length}개` : ''}`;
          return (
            <button
              key={k}
              type="button"
              className={`cal-day${k === todayKey ? ' today' : ''}${k === picked ? ' picked' : ''}${d.getDay() === 0 ? ' sun' : ''}`}
              aria-pressed={k === picked}
              aria-label={label}
              onClick={() => setPicked((p) => (p === k ? null : k))}
            >
              <span className="cal-num">{d.getDate()}</span>
              <span className="cal-dots" aria-hidden="true">
                {kinds.map((kind) => (
                  <i key={kind} className={`dot-${kind}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="cal-legend" aria-hidden="true">
        {KINDS.map((kind) => (
          <span key={kind}>
            <i className={`dot-${kind}`} />
            {KIND_LABEL[kind]}
          </span>
        ))}
      </div>

      <section className="cal-list" aria-label={picked ? '고른 날 일정' : '이 달 일정'}>
        <div className="cal-list-head">
          <b>{picked ? `${Number(picked.slice(5, 7))}월 ${Number(picked.slice(8))}일` : `${cursor.m + 1}월 일정`}</b>
          {picked ? (
            <button type="button" className="link" onClick={() => setPicked(null)}>
              이 달 전체 보기
            </button>
          ) : (
            <small>{count}개</small>
          )}
        </div>
        {listed.length ? (
          listed.map((k) => (
            <div key={k} className="cal-dayblock">
              {!picked && (
                <span className="cal-date">
                  {Number(k.slice(8))}일 {WEEK[new Date(`${k}T00:00`).getDay()]}
                </span>
              )}
              {events[k].map((e) => (
                <button key={`${e.kind}-${e.id}`} type="button" className="cal-item" onClick={() => (e.kind === 'rec' ? onRecords() : onOpen(e.id))}>
                  <span className={`cal-tag tag-${e.kind}`}>{KIND_LABEL[e.kind]}</span>
                  <span className="cal-text">
                    <b>{e.title}</b>
                    <small>{e.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          ))
        ) : (
          <p className="cal-empty">
            {picked ? '이날은 일정이 없어요.' : '이 달엔 아직 일정이 없어요.'}
            <br />
            기회를 스크랩하면 마감일이, 할 일에 기록을 남기면 그날이 여기 찍혀요.
          </p>
        )}
      </section>
    </div>
  );
}
