import { MAJORS } from '../lib/data.js';
import PageHead from '../components/PageHead.jsx';

/* 선배: 전공별 선배 경로를 인터뷰로 정리한 고정 콘텐츠 (기획안 5장, 8장) */
export default function Seniors({ profile }) {
  const major = MAJORS[profile.major];
  // 같은 전공의 선배 사례를 중복 없이, 내 직무 것을 먼저
  const entries = Object.entries(major.tracks).sort(([a], [b]) => (a === profile.track ? -1 : b === profile.track ? 1 : 0));
  const seen = new Set();
  const stories = [];
  entries.forEach(([k, t]) => {
    if (t.senior && !seen.has(t.senior)) {
      seen.add(t.senior);
      stories.push({ ...t.senior, trackLabel: t.label, mine: k === profile.track });
    }
  });

  return (
    <div className="screen">
      <PageHead
        no="04"
        en="SENIORS"
        title="먼저 남아 본 선배들."
        lead={`춘천에 남은 ${major.label} 전공 선배가 지나온 길이에요. 인터뷰를 정리한 내용이고, 이름은 익명이에요.`}
      />

      {stories.length ? (
        stories.map((s) => (
          <article key={s.who} className="card senior">
            <div className="senior-head">
              <span className="avatar" aria-hidden="true">
                {s.who.slice(0, 1)}
              </span>
              <div>
                <h3>{s.who}</h3>
                <p className="muted small">{s.now}</p>
              </div>
            </div>
            <ol className="timeline">
              {s.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </article>
        ))
      ) : (
        <div className="card empty">
          <p>
            <b>선배 인터뷰를 진행하고 있어요.</b>
          </p>
          <p className="muted small">춘천에 남은 졸업생의 동의를 받아 익명으로 소개할 예정이에요.</p>
        </div>
      )}
    </div>
  );
}
