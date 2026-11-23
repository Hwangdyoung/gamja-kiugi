import { useState } from 'react';
import Calendar from '../components/Calendar.jsx';
import { BackIcon, BookmarkIcon, ChevronIcon, GearIcon, PencilIcon } from '../components/Icons.jsx';
import Mascot, { GROW_LABELS } from '../components/Mascot.jsx';
import { TypeIcon, statusOf, typeKey } from '../components/OpportunityCard.jsx';
import ProfileForm from '../components/ProfileForm.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import { vitalLabel } from '../lib/care.js';
import { MAJORS } from '../lib/data.js';
import { daysLeft } from '../lib/opportunities.js';
import { GRADES } from '../lib/roadmap.js';

const VIEWS = [
  { id: 'saved', label: '스크랩' },
  { id: 'cal', label: '일정' },
];
const PER_STAGE = 3; // 기록 3개마다 감자가 한 단계 자란다

/* 스크랩 정렬: 마감일 있는 것(가까운 순) → 곧 열림 → 그 밖 */
const rank = (it, today) => {
  const left = daysLeft(it, today);
  return left === null ? 10000 : left;
};

/* 나: 감자와 내 이름이 크게 보이는 머리 → 감자 성장 카드(기록 진행·기운) → 스크랩 / 일정.
   설정은 오른쪽 위 톱니로 따로 연다. 내 정보 수정은 이름 옆 연필. */
export default function Me({ profile, mood, progress, vital, items, all, saved, log, today, onOpen, onSave, onSaveProfile, onRecords, onCopyResume, onRoadmap, message, openDays, settings }) {
  const [view, setView] = useState('saved');
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const major = MAJORS[profile.major];
  const grade = GRADES.find((g) => g.value === profile.grade)?.label ?? '학년 미입력';
  const savedIds = Object.keys(saved).filter((id) => saved[id]);
  const open = items.filter((it) => saved[it.id]).sort((a, b) => rank(a, today) - rank(b, today));
  // 마감이 지나 목록에서 내려간 스크랩도 따로 알려 준다
  const closed = savedIds.filter((id) => !open.some((it) => it.id === id) && all.some((it) => it.id === id)).length;

  if (settingsOpen) {
    return (
      <div className="screen me">
        <div className="me-subhead">
          <button type="button" className="me-back" aria-label="나로 돌아가기" onClick={() => setSettingsOpen(false)}>
            <BackIcon size={18} />
            <span aria-hidden="true">나</span>
          </button>
          <h1>설정</h1>
        </div>
        <SettingsPanel {...settings} />
      </div>
    );
  }

  const grow = progress.grow ?? 0;
  const full = grow >= GROW_LABELS.length - 1;
  const toNext = PER_STAGE - (progress.count % PER_STAGE);
  const pct = progress.total ? Math.round((progress.count / progress.total) * 100) : 0;
  const next = progress.next;
  // 최근 기록 두 줄 (기록한 날이 있는 것만, 최근 순)
  const titles = new Map(progress.stages.flatMap((s) => s.tasks.map((t) => [t.id, { t: t.t, grade: s.grade }])));
  const recent = Object.entries(log)
    .filter(([id, r]) => r?.at && titles.has(id))
    .sort((a, b) => new Date(b[1].at) - new Date(a[1].at))
    .slice(0, 2)
    .map(([id, r]) => ({ id, ...titles.get(id), note: r.note, at: new Date(r.at) }));
  // 곧 마감: 스크랩 중 마감일이 남은 것 가까운 순 세 개
  const soon = open.filter((it) => (daysLeft(it, today) ?? -1) >= 0).slice(0, 3);

  return (
    <div className="screen me">
      <section className={`me-hero mood-${mood}`} aria-label="내 정보">
        <button type="button" className="icon-btn me-gear" aria-label="설정" onClick={() => setSettingsOpen(true)}>
          <GearIcon size={20} />
        </button>
        {editing ? (
          <div className="me-edit">
            <ProfileForm
              profile={profile}
              submitLabel="저장"
              onSubmit={(p) => {
                onSaveProfile(p);
                setEditing(false);
              }}
            />
          </div>
        ) : (
          <>
            {message && (
              <p className="me-bubble" aria-live="polite">
                {message}
              </p>
            )}
            <span className="me-potato">
              <Mascot mood={mood} size={92} grow={grow} />
            </span>
            <div className="me-name">
              <h2>{profile.name}</h2>
              <button type="button" className="icon-btn sm" aria-label="내 정보 수정" onClick={() => setEditing(true)}>
                <PencilIcon size={16} />
              </button>
            </div>
            <div className="me-chips">
              <span>{profile.school ?? '학교 미입력'}</span>
              <span>{grade}</span>
              <span>
                {major.label} · {major.tracks[profile.track].label}
              </span>
            </div>
            {openDays > 0 && (
              <p className="me-together">
                감자와 함께한 날 <b>{openDays}일</b>
              </p>
            )}
          </>
        )}
        {!profile.grade && !editing && <p className="notice">학년을 알려 주면 지금 학년에 맞는 할 일부터 보여 드려요.</p>}
      </section>

      {next && (
        <section className="me-next" aria-label="다음 할 일">
          <span className="me-next-tag">{progress.stages[next.stage].grade}학년 다음 할 일</span>
          <b>{next.task.t}</b>
          {next.task.d && <small>{next.task.d}</small>}
          <button type="button" className="btn primary sm" onClick={() => onRoadmap?.(next.stage)}>
            기록하러 가기
          </button>
        </section>
      )}

      <section className="card me-grow" aria-label="감자 성장">
        <div className="me-grow-head">
          <span className="me-stage">{GROW_LABELS[grow]}</span>
          <button type="button" className="link" onClick={onRecords}>
            내 기록 보기 <ChevronIcon size={14} />
          </button>
        </div>
        <div className="me-meter">
          <div className="me-meter-top">
            <b>내 기록</b>
            <span className="me-num">
              {progress.count}
              <small> / {progress.total}</small>
            </span>
          </div>
          <span className="bar" role="progressbar" aria-label="내 기록" aria-valuenow={progress.count} aria-valuemin={0} aria-valuemax={progress.total}>
            <i style={{ width: `${pct}%` }} />
          </span>
          <small>{full ? '감자가 꽃까지 피웠어요. 이 기록으로 지원서를 써 보세요.' : `기록 ${toNext}개 더 남기면 감자가 한 단계 자라요.`}</small>
        </div>
        <div className="me-meter">
          <div className="me-meter-top">
            <b>감자 기운</b>
            <span className="me-num">
              {vital}
              <small>% · {vitalLabel(vital)}</small>
            </span>
          </div>
          <span className="bar vital" role="progressbar" aria-label="감자 기운" aria-valuenow={vital} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${vital}%` }} />
          </span>
          <small>홈에서 물·햇빛·거름을 주면 차오르고, 하루가 지나면 조금씩 빠져요.</small>
        </div>
        {recent.length > 0 && (
          <div className="me-recent">
            <b>최근 기록</b>
            <ul>
              {recent.map((r) => (
                <li key={r.id}>
                  <span className="me-recent-date">
                    {r.at.getMonth() + 1}.{r.at.getDate()}
                  </span>
                  <span className="me-recent-text">
                    {r.t}
                    {r.note && <small>{r.note}</small>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="link me-resume" disabled={!progress.count} onClick={onCopyResume}>
          내 기록을 이력서 초안으로 복사
        </button>
      </section>

      {soon.length > 0 && (
        <section className="me-soon" aria-label="곧 마감">
          <h3>곧 마감</h3>
          <div className="me-soon-list">
            {soon.map((it) => {
              const st = statusOf(it, today);
              return (
                <button key={it.id} type="button" className="me-soon-item" onClick={() => onOpen(it.id)}>
                  <span className={`status ${st.tone}`}>{st.label}</span>
                  <b>{it.title}</b>
                  <small>{st.sub}</small>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="seg" role="tablist" aria-label="나">
        {VIEWS.map((v) => (
          <button key={v.id} type="button" role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}>
            {v.label}
            {v.id === 'saved' && <small>{open.length}</small>}
          </button>
        ))}
      </div>

      {view === 'cal' ? (
        <Calendar today={today} all={all} saved={saved} log={log} stages={progress.stages} onOpen={onOpen} onRecords={onRecords} />
      ) : open.length ? (
        <div className="me-saved">
          {open.map((it) => {
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
                <button type="button" className="me-unsave" aria-pressed aria-label={`${it.title} 스크랩`} onClick={() => onSave(it.id)}>
                  <BookmarkIcon on size={18} />
                </button>
              </div>
            );
          })}
          {closed > 0 && <p className="fine">마감이 지나 내려간 스크랩 {closed}건</p>}
        </div>
      ) : (
        <div className="empty">
          <p>
            아직 스크랩한 기회가 없어요.
            <br />
            기회 탭에서 책갈피를 누르면 여기 모여요.
            <br />
            마감이 다가오면 알려 드릴게요.
          </p>
        </div>
      )}
    </div>
  );
}
