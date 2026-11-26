import { useState } from 'react';
import { CheckIcon, ChevronIcon, FlagIcon } from '../components/Icons.jsx';
import Mascot, { GROW_LABELS } from '../components/Mascot.jsx';
import PageHead from '../components/PageHead.jsx';
import { ddayLabel } from '../lib/opportunities.js';
import { MAJORS } from '../lib/data.js';
import { recordsOf } from '../lib/resume.js';

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

/* 할 일 한 줄: 누르면 설명·관련 기회·기록이 펼쳐진다. 끝내면 "뭘 했고 뭐가 남았는지" 한 줄을 남긴다 */
function Task({ task, entry, opps, today, open, onToggle, onRecord, onClear, onOpen }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(entry?.note ?? '');
  const done = !!entry;
  const save = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    onRecord(task.id, note.trim());
    setEditing(false);
  };
  return (
    <li className={`task${done ? ' done' : ''}${open ? ' open' : ''}`}>
      <button type="button" className="task-row" aria-expanded={open} onClick={onToggle}>
        <span className="step-dot" aria-hidden="true">
          {done ? <CheckIcon /> : null}
        </span>
        <span className="task-title">
          <small>
            {task.tag}
            {task.own && <span className="own"> · 내 직무</span>}
          </small>
          <b>{task.t}</b>
        </span>
        {opps.length > 0 && !open && <span className="task-count">기회 {opps.length}</span>}
        <ChevronIcon size={16} />
      </button>

      {open && (
        <div className="task-body">
          <p className="muted">{task.d}</p>

          {opps.length > 0 && (
            <ul className="step-opps">
              {opps.map((it) => (
                <li key={it.id}>
                  <button type="button" onClick={() => onOpen(it.id)}>
                    <span>{it.title}</span>
                    <span className="dday">{ddayLabel(it, today)}</span>
                    <ChevronIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {task.own && opps.length === 0 && <p className="step-empty">이 할 일에 맞는 기회를 조사하고 있어요.</p>}

          {done && !editing ? (
            <div className="record">
              <p>
                <b>내 기록</b> {entry.note || '기록 없이 완료했어요.'}
                {entry.at && <small> · {fmt(entry.at)}</small>}
              </p>
              <span className="record-actions">
                <button type="button" className="link" onClick={() => setEditing(true)}>
                  고치기
                </button>
                <button type="button" className="link" onClick={() => onClear(task.id)}>
                  기록 지우기
                </button>
              </span>
            </div>
          ) : editing ? (
            <form className="record-form" onSubmit={save}>
              <label className="sr-only" htmlFor={`note-${task.id}`}>
                {task.t} 기록
              </label>
              <input
                id={`note-${task.id}`}
                className="input"
                maxLength={80}
                autoFocus
                placeholder="뭘 했고 뭐가 남았나요? 예) 카드뉴스 3편 제작"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <span className="record-actions">
                <button type="submit" className="btn primary sm" disabled={!note.trim()}>
                  기록하기
                </button>
                <button type="button" className="link" onClick={() => setEditing(false)}>
                  취소
                </button>
              </span>
            </form>
          ) : (
            <button type="button" className="btn outline sm" onClick={() => setEditing(true)}>
              했어요 · 한 줄 남기기
            </button>
          )}
        </div>
      )}
    </li>
  );
}

/* 내 기록 (11/26): 스프링 공책 한 권. 왼쪽 스프링, 오른쪽 학년 색인 탭, 줄 노트 위에 한 줄씩.
   맨 위에는 지금 내 감자 스티커와, 기록을 더 남기면 될 다음 모습이 연필 밑그림으로 붙어 있다.
   아래 버튼으로 이력서 초안 복사 */
const RINGS = 7;
function Records({ progress, log, mood, outfit, onCopyResume, onGo }) {
  const recs = recordsOf(progress, log);
  const { grow, count, total } = progress;
  const grad = count >= total; // 할 일을 다 마치면 학사모
  const left = grow < 4 ? (grow + 1) * 3 - count : 0; // 기록 3개마다 싹 한 칸
  const jump = (i) => {
    const el = document.getElementById(`rec-g${i + 1}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else onGo(i);
  };
  return (
    <div className="records">
      <div className="rec-book">
        <span className="rec-rings" aria-hidden="true">
          {Array.from({ length: RINGS }, (_, i) => (
            <i key={i} />
          ))}
        </span>
        <nav className="rec-tabs" aria-label="학년 색인">
          {progress.stages.map((s, i) => {
            const has = recs.some((r) => r.grade === s.grade);
            return (
              <button key={s.grade} type="button" className={`rec-tab g${s.grade}${has ? ' has' : ''}`} onClick={() => jump(i)} aria-label={has ? `${s.grade}학년 기록으로` : `${s.grade}학년 할 일 보기`}>
                {s.grade}
              </button>
            );
          })}
        </nav>
        <div className="rec-page">
          <header className="rec-head">
            <h3>
              감자 기록장 <em>{count}줄</em>
            </h3>
            <div className="rec-stickers">
              <span className="rec-sticker">
                <Mascot mood={mood} size={88} grow={grow} outfit={outfit} grad={grad} />
              </span>
              {grow < 4 && (
                <span className="rec-ghost" aria-hidden="true">
                  <Mascot mood="happy" size={58} grow={grow + 1} />
                </span>
              )}
            </div>
            <p className="rec-hint">
              {grad ? (
                <>
                  할 일을 다 마쳐서 <b>학사모</b>를 받았어요. 이제 이력서 초안을 복사해 보세요.
                </>
              ) : grow < 4 ? (
                <>
                  {left}줄 더 쓰면 <b>{GROW_LABELS[grow + 1]}</b>
                </>
              ) : (
                <>
                  <b>{GROW_LABELS[4]}</b>까지 다 컸어요
                </>
              )}
            </p>
          </header>

          <div className="rec-lines">
          {recs.length ? (
            progress.stages.map((s) => {
              const mine = recs.filter((r) => r.grade === s.grade);
              if (!mine.length) return null;
              return (
                <section key={s.grade} id={`rec-g${s.grade}`} className={`rec-grade g${s.grade}`}>
                  <h4>
                    {s.grade}학년 <span>{s.label}</span>
                  </h4>
                  <ul>
                    {mine.map((r) => (
                      <li key={r.t}>
                        <small>
                          {r.tag} · {r.t}
                          {r.at && <time>{fmt(r.at)}</time>}
                        </small>
                        <p>{r.note || '기록 없이 완료'}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <div className="rec-empty">
              <p>아직 첫 줄을 기다리는 중이에요.</p>
              <p className="muted small">할 일을 끝내고 한 줄씩 남기면 여기에 모여요. 4학년 때 이력서 재료가 돼요.</p>
              <button type="button" className="btn outline sm" onClick={() => onGo(progress.current)}>
                {progress.current + 1}학년 할 일 보기
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
      {recs.length > 0 && (
        <>
          <button type="button" className="btn primary block" onClick={onCopyResume}>
            이력서 초안으로 복사
          </button>
          <p className="fine">학년·할 일 순서로 정리한 글이 복사돼요. 지원하는 곳에 맞게 다듬어 쓰세요.</p>
        </>
      )}
    </div>
  );
}

/* 로드맵 지도: 감자 밭 사이로 구불구불한 흙길. 1학년 → 4학년 → 지원서 깃발.
   길 구간은 그 학년 할 일을 한 만큼 초록으로 칠해지고, 감자는 지금 학년 정류장에 서 있다.
   좌표는 340×380 그림 기준(위에 OY만큼 여유). 정류장은 누를 수 있는 버튼(HTML)으로 그림 위에 얹는다 */
const MAP_W = 340;
const MAP_H = 404;
const OY = 24; // 맨 위 정류장 위에 감자가 설 자리
const STOPS = [
  [64, 60],
  [276, 140],
  [64, 220],
  [276, 300],
];
const GOAL = [150, 352];
const SEGS = [
  'M64 60 C 190 60, 276 74, 276 140',
  'M276 140 C 276 204, 64 156, 64 220',
  'M64 220 C 64 284, 276 236, 276 300',
  'M276 300 C 276 344, 210 352, 150 352',
];
const pos = ([x, y]) => ({ left: `${(x / MAP_W) * 100}%`, top: `${((y + OY) / MAP_H) * 100}%` });

function RoadMap({ progress, mood, picked, onPick }) {
  return (
    <div className="rmap">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
        <g transform={`translate(0 ${OY})`}>
        {/* 밭고랑 */}
        <g className="rmap-rows">
          <path d="M-10 108 C 90 96, 190 104, 350 92" />
          <path d="M-10 186 C 110 178, 230 190, 350 176" />
          <path d="M-10 268 C 100 258, 220 270, 350 258" />
        </g>
        <path className="rmap-road" d={SEGS.join(' ')} />
        <path className="rmap-lane" d={SEGS.join(' ')} />
        {SEGS.map((d, i) => {
          const s = progress.stages[i];
          const frac = s.tasks.filter(progress.isDone).length / s.tasks.length;
          return <path key={i} className="rmap-done" d={d} pathLength="1" strokeDasharray={`${frac} 1`} />;
        })}
        </g>
      </svg>

      {progress.stages.map((s, i) => {
        const n = s.tasks.filter(progress.isDone).length;
        const full = n === s.tasks.length;
        const now = i === progress.current;
        const right = STOPS[i][0] < MAP_W / 2;
        const state = full ? 'done' : now ? 'now' : i < progress.current ? 'past' : 'next';
        return (
          <button
            key={s.grade}
            type="button"
            className={`rmap-stop ${state}${picked === i ? ' picked' : ''} ${right ? 'label-right' : 'label-left'}`}
            style={pos(STOPS[i])}
            aria-pressed={picked === i}
            aria-label={`${s.grade}학년 ${s.label}, ${n}/${s.tasks.length}${now ? ', 지금 학년' : ''}`}
            onClick={() => onPick(i)}
          >
            <span className="rmap-dot">{full ? <CheckIcon size={18} /> : s.grade}</span>
            <span className="rmap-label">
              <small>{s.grade}학년</small>
              <b>{s.label}</b>
              <span className="rm-meter">
                {s.tasks.map((t) => (
                  <i key={t.id} className={progress.isDone(t) ? 'on' : ''} />
                ))}
              </span>
            </span>
          </button>
        );
      })}

      <span className="rmap-potato" style={pos(STOPS[progress.current])} aria-hidden="true">
        <Mascot mood={mood} size={48} grow={progress.grow} grad={progress.count >= progress.total} />
      </span>

      <span className={`rmap-goal${progress.count >= progress.total ? ' done' : ''}`} style={pos(GOAL)}>
        <span className="rmap-flag">
          <FlagIcon size={16} />
        </span>
        <b>지원서 쓰기</b>
      </span>
    </div>
  );
}

/* 내 로드맵: 위는 길 지도(어디까지 왔는지 한눈에), 아래는 고른 학년의 할 일. 탭으로 로드맵 / 내 기록 */
export default function Path({ profile, mood = 'happy', progress, log, items, today, onRecord, onClear, onOpen, onCopyResume, startView = null, outfit = null }) {
  const track = MAJORS[profile.major].tracks[profile.track];
  const [view, setView] = useState(startView === 'rec' ? 'rec' : 'map');
  const [picked, setPicked] = useState(typeof startView === 'number' ? startView : progress.current);
  const [openId, setOpenId] = useState(progress.next?.task.id ?? null);
  const go = (i) => {
    setView('map');
    setPicked(i);
  };
  const s = progress.stages[picked];
  const n = s.tasks.filter(progress.isDone).length;

  return (
    <div className="screen path">
      <PageHead
        title="학년마다 할 일, 하나씩."
        lead={`${MAJORS[profile.major].label} · ${track.label}. 끝낸 일에 한 줄씩 남기면 이력서 재료가 돼요.`}
      />

      <div className="seg" role="tablist" aria-label="로드맵 보기">
        <button type="button" role="tab" aria-selected={view === 'map'} onClick={() => setView('map')}>
          로드맵
          <small>
            {progress.count}/{progress.total}
          </small>
        </button>
        <button type="button" role="tab" aria-selected={view === 'rec'} onClick={() => setView('rec')}>
          내 기록
          <small>{progress.count}</small>
        </button>
      </div>

      {view === 'rec' ? (
        <Records progress={progress} log={log} mood={mood} outfit={outfit} onCopyResume={onCopyResume} onGo={go} />
      ) : (
        <>
          <RoadMap progress={progress} mood={mood} picked={picked} onPick={setPicked} />

          <section className={`rm-panel card${picked === progress.current ? ' now' : ''}`} aria-label={`${s.grade}학년 ${s.label} 할 일`}>
            <div className="rm-panel-head">
              <h2>
                <small>{s.grade}학년</small> {s.label}
              </h2>
              {picked === progress.current && <span className="badge">지금</span>}
              <span className="rm-meter">
                {s.tasks.map((t) => (
                  <i key={t.id} className={progress.isDone(t) ? 'on' : ''} />
                ))}
                <em>
                  {n}/{s.tasks.length}
                </em>
              </span>
            </div>
            <p className="rm-goal">{picked < progress.current && n < s.tasks.length ? '지나간 학년이지만 지금 해도 늦지 않아요.' : s.goal}</p>
            <ol className="tasks">
              {s.tasks.map((t) => (
                <Task
                  key={t.id}
                  task={t}
                  entry={log[t.id]}
                  opps={t.own ? items.filter((it) => it.step === picked) : []}
                  today={today}
                  open={openId === t.id}
                  onToggle={() => setOpenId((o) => (o === t.id ? null : t.id))}
                  onRecord={onRecord}
                  onClear={onClear}
                  onOpen={onOpen}
                />
              ))}
            </ol>
            {s.grade === 4 && <p className="fine">4학년 할 일까지 다 해도 합격이 정해지는 건 아니에요. 대신 지원서에 쓸 이야기가 {progress.total}줄 생겨요.</p>}
          </section>
        </>
      )}
    </div>
  );
}
