import { useState } from 'react';
import Calendar from '../components/Calendar.jsx';
import Mascot from '../components/Mascot.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import ProfileForm from '../components/ProfileForm.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import { MAJORS } from '../lib/data.js';
import { GRADES } from '../lib/roadmap.js';

const VIEWS = [
  { id: 'saved', label: '스크랩' },
  { id: 'cal', label: '일정' },
  { id: 'settings', label: '설정' },
];

/* 나: 맨 위 내 카드(감자·이름·학교·학년·직무, 수정) → 숫자 세 칸(기록·스크랩·기운) → 스크랩 / 일정 / 설정 탭.
   한 화면에 길게 늘어놓지 않고 탭으로 나눴다. 일정은 마감·모집 열림·기록을 한 달 달력으로 본다. */
export default function Me({ profile, mood, progress, vital, items, all, saved, log, today, onOpen, onSave, onSaveProfile, onRecords, onCopyResume, settings }) {
  const [view, setView] = useState('saved');
  const [editing, setEditing] = useState(false);
  const major = MAJORS[profile.major];
  const grade = GRADES.find((g) => g.value === profile.grade)?.label ?? '학년 미입력';
  const savedIds = Object.keys(saved).filter((id) => saved[id]);
  const open = items.filter((it) => saved[it.id]);
  // 마감이 지나 목록에서 내려간 스크랩도 따로 알려 준다
  const closed = savedIds.filter((id) => !open.some((it) => it.id === id) && all.some((it) => it.id === id)).length;

  return (
    <div className="screen me">
      <section className="card me-card" aria-label="내 정보">
        {editing ? (
          <ProfileForm
            profile={profile}
            submitLabel="저장"
            onSubmit={(p) => {
              onSaveProfile(p);
              setEditing(false);
            }}
          />
        ) : (
          <div className="me-head">
            <span className="me-potato">
              <Mascot mood={mood} size={52} grow={progress.grow} />
            </span>
            <span className="me-who">
              <b>{profile.name}</b>
              <small>
                {profile.school ?? '학교 미입력'} · {grade}
              </small>
              <small>
                {major.label} · {major.tracks[profile.track].label}
              </small>
            </span>
            <button type="button" className="btn outline sm" onClick={() => setEditing(true)}>
              수정
            </button>
          </div>
        )}
        {!profile.grade && !editing && <p className="notice">학년을 알려 주면 지금 학년에 맞는 할 일부터 보여 드려요.</p>}
      </section>

      <div className="me-stats">
        <button type="button" className="me-stat" onClick={onRecords}>
          <b>
            {progress.count}
            <small>/{progress.total}</small>
          </b>
          <span>내 기록</span>
        </button>
        <button type="button" className="me-stat" onClick={() => setView('saved')}>
          <b>{savedIds.length}</b>
          <span>스크랩</span>
        </button>
        <div className="me-stat">
          <b>
            {vital}
            <small>%</small>
          </b>
          <span>감자 기운</span>
        </div>
      </div>
      <button type="button" className="btn outline block" disabled={!progress.count} onClick={onCopyResume}>
        내 기록을 이력서 초안으로 복사
      </button>

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
      ) : view === 'saved' ? (
        open.length ? (
          <div className="list">
            {open.map((it) => (
              <OpportunityCard key={it.id} item={it} today={today} saved onOpen={onOpen} onSave={onSave} />
            ))}
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
        )
      ) : (
        <SettingsPanel {...settings} />
      )}
    </div>
  );
}
