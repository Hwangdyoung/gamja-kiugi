import { useState } from 'react';
import { CheckIcon, ChevronIcon } from '../components/Icons.jsx';
import PageHead from '../components/PageHead.jsx';
import { ddayLabel } from '../lib/opportunities.js';
import { MAJORS } from '../lib/data.js';

const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
};

/* 할 일 하나: 끝내면 "뭘 했고 뭐가 남았는지" 한 줄을 남긴다 */
function Task({ task, entry, opps, today, onRecord, onClear, onOpen }) {
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
    <li className={`task${done ? ' done' : ''}`}>
      <span className="step-dot" aria-hidden="true">
        {done ? <CheckIcon /> : null}
      </span>
      <div className="task-body">
        <p className="eyebrow">
          {task.tag}
          {task.own && <span className="own"> · 내 직무</span>}
        </p>
        <h4>{task.t}</h4>
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
    </li>
  );
}

/* 내 로드맵: 1~4학년 단계, 학년마다 할 일 3개(내 직무 1 + 공통 2), 끝낸 일은 한 줄 기록 */
export default function Path({ profile, progress, log, items, today, onRecord, onClear, onOpen }) {
  const track = MAJORS[profile.major].tracks[profile.track];
  return (
    <div className="screen">
      <PageHead
        no="03"
        en="MY ROADMAP"
        title="학년마다 할 일, 하나씩."
        lead={`${MAJORS[profile.major].label} · ${track.label} 로드맵이에요. 끝낸 일에 한 줄씩 남기면, 4학년 때 그대로 이력서 재료가 돼요.`}
      />
      <div className="path-progress">
        <div className="bar" role="progressbar" aria-label="로드맵 진행" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.count}>
          <i style={{ width: `${(progress.count / progress.total) * 100}%` }} />
        </div>
        <b>
          기록 {progress.count} / {progress.total}
        </b>
      </div>

      <div className="stages">
        {progress.stages.map((s, i) => {
          const n = s.tasks.filter(progress.isDone).length;
          const now = i === progress.current;
          const past = i < progress.current;
          const all = n === s.tasks.length;
          // 다 기록한 학년은 접어 둔다(눌러서 펼침). 지금 학년과 덜 한 학년은 펼쳐 둔다
          return (
            <details key={s.grade} className={`stage-card card${now ? ' now' : ''}`} open={now || !all} aria-label={`${s.grade}학년 ${s.label}`}>
              <summary className="stage-head">
                <h3>
                  {s.grade}학년 <span>{s.label}</span>
                </h3>
                {now && <span className="badge">지금</span>}
                <span className="stage-count">
                  {n} / {s.tasks.length}
                </span>
              </summary>
              <p className="muted small">{past && n < s.tasks.length ? '지나간 학년이지만 지금 해도 늦지 않아요.' : s.goal}</p>
              <ol className="tasks">
                {s.tasks.map((t) => (
                  <Task
                    key={t.id}
                    task={t}
                    entry={log[t.id]}
                    opps={t.own ? items.filter((it) => it.step === i) : []}
                    today={today}
                    onRecord={onRecord}
                    onClear={onClear}
                    onOpen={onOpen}
                  />
                ))}
              </ol>
            </details>
          );
        })}
      </div>
      <p className="fine">4학년 할 일까지 다 해도 합격이 정해지는 건 아니에요. 대신 지원서에 쓸 이야기가 열두 줄 생겨요.</p>
    </div>
  );
}
