import { useState } from 'react';
import { CheckIcon, ChevronIcon } from '../components/Icons.jsx';
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

/* 내 기록: 학년별로 모아 보고, 이력서 초안으로 복사 */
function Records({ progress, log, onCopyResume, onGo }) {
  const recs = recordsOf(progress, log);
  if (!recs.length) {
    return (
      <div className="card empty">
        <p>
          <b>아직 남긴 기록이 없어요.</b>
        </p>
        <p className="muted small">할 일을 끝내고 한 줄씩 남기면 여기에 모여요. 4학년 때 이력서 재료가 돼요.</p>
        <button type="button" className="btn outline sm" onClick={() => onGo(progress.current)}>
          {progress.current + 1}학년 할 일 보기
        </button>
      </div>
    );
  }
  return (
    <div className="records">
      {progress.stages.map((s) => {
        const mine = recs.filter((r) => r.grade === s.grade);
        if (!mine.length) return null;
        return (
          <section key={s.grade} className="card records-group">
            <h3>
              {s.grade}학년 <span>{s.label}</span>
            </h3>
            <ul>
              {mine.map((r) => (
                <li key={r.t}>
                  <small>
                    {r.tag} · {r.t}
                  </small>
                  <p>{r.note || '기록 없이 완료'}</p>
                  {r.at && <time>{fmt(r.at)}</time>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <button type="button" className="btn primary block" onClick={onCopyResume}>
        이력서 초안으로 복사
      </button>
      <p className="fine">학년·할 일 순서로 정리한 글이 복사돼요. 지원하는 곳에 맞게 다듬어 쓰세요.</p>
    </div>
  );
}

/* 내 로드맵: 학년 탭(지금 학년이 기본) + 내 기록 탭. 할 일은 한 줄로 접혀 있다가 눌러서 펼친다 */
export default function Path({ profile, progress, log, items, today, onRecord, onClear, onOpen, onCopyResume, startView = null }) {
  const track = MAJORS[profile.major].tracks[profile.track];
  const [view, setView] = useState(startView ?? progress.current); // 0~3 학년, 'rec' 내 기록
  const [openId, setOpenId] = useState(progress.next?.task.id ?? null);
  const stage = view === 'rec' ? null : progress.stages[view];

  return (
    <div className="screen">
      <PageHead
        no="03"
        en="MY ROADMAP"
        title="학년마다 할 일, 하나씩."
        lead={`${MAJORS[profile.major].label} · ${track.label}. 끝낸 일에 한 줄씩 남기면 이력서 재료가 돼요.`}
      />
      <div className="path-progress">
        <div className="bar" role="progressbar" aria-label="로드맵 진행" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.count}>
          <i style={{ width: `${(progress.count / progress.total) * 100}%` }} />
        </div>
        <b>
          기록 {progress.count} / {progress.total}
        </b>
      </div>

      <div className="seg" role="tablist" aria-label="학년">
        {progress.stages.map((s, i) => {
          const n = s.tasks.filter(progress.isDone).length;
          return (
            <button key={s.grade} type="button" role="tab" aria-selected={view === i} onClick={() => setView(i)}>
              {s.grade}학년
              {i === progress.current && <i className="dot" aria-label="지금 학년" />}
              <small>
                {n}/{s.tasks.length}
              </small>
            </button>
          );
        })}
        <button type="button" role="tab" aria-selected={view === 'rec'} onClick={() => setView('rec')}>
          내 기록
          <small>{progress.count}</small>
        </button>
      </div>

      {stage ? (
        <section className="stage-card card" aria-label={`${stage.grade}학년 ${stage.label}`}>
          <div className="stage-head">
            <h3>
              {stage.grade}학년 <span>{stage.label}</span>
            </h3>
            {view === progress.current && <span className="badge">지금</span>}
          </div>
          <p className="muted small">
            {view < progress.current && stage.tasks.some((t) => !progress.isDone(t)) ? '지나간 학년이지만 지금 해도 늦지 않아요.' : stage.goal}
          </p>
          <ol className="tasks">
            {stage.tasks.map((t) => (
              <Task
                key={t.id}
                task={t}
                entry={log[t.id]}
                opps={t.own ? items.filter((it) => it.step === view) : []}
                today={today}
                open={openId === t.id}
                onToggle={() => setOpenId((o) => (o === t.id ? null : t.id))}
                onRecord={onRecord}
                onClear={onClear}
                onOpen={onOpen}
              />
            ))}
          </ol>
          {stage.grade === 4 && <p className="fine">4학년 할 일까지 다 해도 합격이 정해지는 건 아니에요. 대신 지원서에 쓸 이야기가 열두 줄 생겨요.</p>}
        </section>
      ) : (
        <Records progress={progress} log={log} onCopyResume={onCopyResume} onGo={setView} />
      )}
    </div>
  );
}
