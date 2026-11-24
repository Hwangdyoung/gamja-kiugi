import { useEffect, useState } from 'react';
import Calendar from '../components/Calendar.jsx';
import { BackIcon, BookmarkIcon, CalendarIcon, ChevronIcon, GearIcon, PencilIcon } from '../components/Icons.jsx';
import Mascot, { GROW_LABELS } from '../components/Mascot.jsx';
import PotatoQuiz, { TypePotato } from '../components/PotatoQuiz.jsx';
import { POTATO_TYPES } from '../lib/potatoType.js';
import { TypeIcon, statusOf, typeKey } from '../components/OpportunityCard.jsx';
import ProfileForm from '../components/ProfileForm.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import { vitalLabel } from '../lib/care.js';
import { MAJORS } from '../lib/data.js';
import { daysLeft } from '../lib/opportunities.js';
import { GRADES } from '../lib/roadmap.js';

const SUBS = { saved: '스크랩', cal: '일정', settings: '설정', quiz: '감자 유형 테스트' };
// 스크랩·일정에서 기회를 열었다가 돌아오면 그 화면으로 (상세로 가면 나 화면이 내려갔다 다시 올라온다)
let restoreSub = null;
const PER_STAGE = 3; // 기록 3개마다 감자가 한 단계 자란다

/* 스크랩 정렬: 마감일 있는 것(가까운 순) → 곧 열림 → 그 밖 */
const rank = (it, today) => {
  const left = daysLeft(it, today);
  return left === null ? 10000 : left;
};

/* 나: 감자와 내 이름이 크게 보이는 머리 → 다음 할 일 → 감자 성장 카드 → 곧 마감.
   스크랩 · 일정 · 설정은 오른쪽 위 아이콘으로 따로 연다 (아래로 내려가지 않아도 되게). 내 정보 수정은 이름 옆 연필. */
export default function Me({ profile, mood, progress, vital, items, all, saved, log, today, onOpen, onSave, onSaveProfile, onRecords, onCopyResume, onRoadmap, message, openDays, settings, potatoType, onPotatoType, onFindOpps }) {
  const [sub, setSub] = useState(() => restoreSub);
  useEffect(() => {
    restoreSub = null;
  }, []);
  const [editing, setEditing] = useState(false);
  const openFrom = (id) => {
    restoreSub = sub;
    onOpen(id);
  };
  const major = MAJORS[profile.major];
  const grade = GRADES.find((g) => g.value === profile.grade)?.label ?? '학년 미입력';
  const savedIds = Object.keys(saved).filter((id) => saved[id]);
  const open = items.filter((it) => saved[it.id]).sort((a, b) => rank(a, today) - rank(b, today));
  // 마감이 지나 목록에서 내려간 스크랩도 따로 알려 준다
  const closed = savedIds.filter((id) => !open.some((it) => it.id === id) && all.some((it) => it.id === id)).length;

  if (sub) {
    return (
      <div className="screen me">
        <div className="me-subhead">
          <button type="button" className="me-back" aria-label="나로 돌아가기" onClick={() => setSub(null)}>
            <BackIcon size={18} />
            <span aria-hidden="true">나</span>
          </button>
          {/* 감자 유형 테스트는 화면마다 자기 제목(질문·유형 이름)이 있어서 위 제목을 두지 않는다 */}
          {sub === 'quiz' ? (
            <span className="sr-only">{SUBS[sub]}</span>
          ) : (
            <h1>
              {SUBS[sub]}
              {sub === 'saved' && <small> {open.length}</small>}
            </h1>
          )}
        </div>
        {sub === 'settings' ? (
          <SettingsPanel {...settings} />
        ) : sub === 'quiz' ? (
          <PotatoQuiz result={potatoType} items={items} today={today} onDone={onPotatoType} onOpen={openFrom} onFindOpps={onFindOpps} />
        ) : sub === 'cal' ? (
          <Calendar today={today} all={all} saved={saved} log={log} stages={progress.stages} onOpen={openFrom} onRecords={onRecords} />
        ) : open.length ? (
          <div className="me-saved">
            {open.map((it) => {
              const st = statusOf(it, today);
              return (
                <div key={it.id} className="me-row">
                  <button type="button" className="me-row-main" onClick={() => openFrom(it.id)}>
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
        <div className="me-tools">
          <button type="button" className="me-tool" aria-label={`스크랩 ${open.length}개`} onClick={() => setSub('saved')}>
            <BookmarkIcon size={20} />
            {open.length > 0 && <span className="me-tool-badge">{open.length}</span>}
          </button>
          <button type="button" className="me-tool" aria-label="일정" onClick={() => setSub('cal')}>
            <CalendarIcon size={20} />
          </button>
          <button type="button" className="me-tool" aria-label="설정" onClick={() => setSub('settings')}>
            <GearIcon size={20} />
          </button>
        </div>
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
            {potatoType && POTATO_TYPES[potatoType] && (
              <button type="button" className="me-type" style={{ '--pt-h': POTATO_TYPES[potatoType].hue }} onClick={() => setSub('quiz')}>
                {POTATO_TYPES[potatoType].name}
                <ChevronIcon size={13} />
              </button>
            )}
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

      {!potatoType && (
        <button type="button" className="me-quiz" onClick={() => setSub('quiz')}>
          <span className="me-quiz-lineup" aria-hidden="true">
            <TypePotato type="cheerful" size={44} decorative />
            <TypePotato type="creative" size={44} decorative />
          </span>
          <span className="me-quiz-text">
            <b>나는 어떤 감자일까?</b>
            <small>8문항으로 알아보는 내 감자 유형</small>
          </span>
          <ChevronIcon size={16} />
        </button>
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
        {progress.count ? (
          <button type="button" className="link me-resume" onClick={onCopyResume}>
            내 기록을 이력서 초안으로 복사
          </button>
        ) : (
          <p className="me-first">할 일 하나를 끝내고 한 줄 남기면 여기 쌓여요. 기록이 생기면 이력서 초안으로도 옮길 수 있어요.</p>
        )}
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
    </div>
  );
}
