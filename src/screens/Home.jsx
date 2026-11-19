import { useRef, useState } from 'react';
import Mascot, { GROW_LABELS } from '../components/Mascot.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import { ChevronIcon, SearchIcon } from '../components/Icons.jsx';

/* 홈 (v2): 위쪽은 큰 감자, 아래는 끌어올리는 패널.
   - 감자 영역: 인사 · 말풍선 · 표정(접속) · 머리 위 싹(기록 3개마다 한 칸) · 학년 4칸 진행 점
   - 패널(접힘): 다음 단계와 마감 임박이 바로 보인다. 손잡이를 끌어올리거나 누르면 펼쳐져 검색·추천 기회를 본다.
   기획안 6장 홈 구성(검색창, 캐릭터와 말풍선, 진행 상황, 다음 단계, 추천 기회)은 그대로, 배치만 바꿨다. */
export default function Home({ name, progress, mood, message, items, today, saved, urgent = [], onOpen, onSave, onTab, onSearch }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(null); // 끄는 중이면 손가락이 움직인 거리(px)
  const start = useRef(null);
  const { next, stages, current, grow } = progress;
  const ni = next ? next.stage : -1;
  const picks = (next ? items.filter((it) => it.step === ni) : items).slice(0, 3);
  // 학년 칸: 그 학년 할 일을 다 기록했으면 채운다
  const stageDone = stages.map((s) => s.tasks.every(progress.isDone));

  // 손잡이 끌기: 위로 40px 넘게 끌면 펼치고, 아래로 40px 넘게 끌면 접는다. 거의 안 움직이면 눌러서 토글
  const onDown = (e) => {
    start.current = e.clientY;
    setDrag(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => start.current != null && setDrag(e.clientY - start.current);
  const onUp = () => {
    if (start.current == null) return;
    const dy = drag ?? 0;
    if (Math.abs(dy) < 6) setOpen((o) => !o);
    else if (dy < -40) setOpen(true);
    else if (dy > 40) setOpen(false);
    start.current = null;
    setDrag(null);
  };
  const dragStyle = drag ? { transform: `translateY(${open ? Math.max(0, drag) : Math.min(0, drag)}px)` } : undefined;

  return (
    <div className="home" data-mood={mood}>
      <section className="home-hero" aria-label="내 감자">
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
        <p className="home-bubble" aria-live="polite">
          {message}
        </p>
        <Mascot mood={mood} size={168} grow={grow} />
        <div className="home-grow">
          <span className="grow-label">{GROW_LABELS[grow]}</span>
          <span className="grow-dots" role="progressbar" aria-label="로드맵 진행" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.count}>
            {stageDone.map((d, i) => (
              <i key={i} className={d ? 'on' : ''} />
            ))}
          </span>
          <b className="grow-count">
            기록 {progress.count} / {progress.total}
          </b>
        </div>
      </section>

      <section className={`home-panel${open ? ' open' : ''}${drag != null ? ' dragging' : ''}`} style={dragStyle} aria-label="오늘 할 일과 기회">
        <button
          type="button"
          className="panel-handle"
          aria-expanded={open}
          aria-label={open ? '패널 접기' : '패널 펼치기'}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <i />
        </button>

        <div className="panel-body">
          <button type="button" className="card next" onClick={() => onTab('path')}>
            <span className="next-body">
              <span className="eyebrow">{next ? `다음 할 일 · ${ni + 1}학년 ${stages[ni].label}` : '모든 할 일 기록'}</span>
              <span className="next-title">{next ? next.task.t : '남긴 기록으로 지원서를 써 보세요'}</span>
            </span>
            <ChevronIcon />
          </button>

          {urgent.length > 0 && (
            <section className="section urgent" aria-label="마감 임박 스크랩">
              <div className="section-head">
                <h2>스크랩한 기회 마감 임박</h2>
                <span className="badge warn">{urgent.length}건</span>
              </div>
              <div className="list">
                {urgent.map((it) => (
                  <OpportunityCard key={it.id} item={it} today={today} saved onOpen={onOpen} onSave={onSave} />
                ))}
              </div>
            </section>
          )}

          <form
            className="searchbar"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(q.trim());
            }}
          >
            <SearchIcon size={18} />
            <input
              type="search"
              placeholder="기회 검색"
              aria-label="기회 검색"
              value={q}
              onFocus={() => setOpen(true)}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          <section className="section">
            <div className="section-head">
              <h2>{next ? `${ni + 1}학년 추천 기회` : '마감이 가까운 기회'}</h2>
              <button type="button" className="link" onClick={() => onTab('opps')}>
                전체 보기
              </button>
            </div>
            {picks.length ? (
              <div className="list">
                {picks.map((it) => (
                  <OpportunityCard key={it.id} item={it} today={today} saved={!!saved[it.id]} onOpen={onOpen} onSave={onSave} />
                ))}
              </div>
            ) : (
              <p className="empty">지금 모집 중인 기회가 없어요.</p>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
