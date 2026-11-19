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
        title="먼저 해 본 선배들."
        lead={`춘천에서 학교 다니며 경험을 쌓은 ${major.label} 계열 선배들이에요. 지금은 춘천에도, 수도권에도 있어요. 내 직무 선배가 먼저 나와요.`}
      />

      <p className="disclaimer">
        지금은 실제 춘천 프로그램을 바탕으로 만든 가상 사례예요. 졸업생 인터뷰를 마치면 실제 이야기로 바뀌어요.
      </p>

      {stories.length ? (
        stories.map((s) => (
          <article key={s.who} className="card senior">
            <div className="senior-head">
              <span className="avatar" aria-hidden="true">
                {s.who.slice(0, 1)}
              </span>
              <div>
                <h3>{s.who}</h3>
                <p className="muted small">{s.profile}</p>
                <p className="small">{s.now}</p>
              </div>
              <span className={`tag${s.mine ? ' mine' : ''}`}>{s.mine ? '내 직무' : s.trackLabel}</span>
            </div>
            <blockquote className="senior-quote">“{s.quote}”</blockquote>
            <ol className="timeline">
              {s.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p className="senior-tip">
              <b>후배에게</b> {s.tip}
            </p>
          </article>
        ))
      ) : (
        <div className="card empty">
          <p>
            <b>선배 인터뷰를 진행하고 있어요.</b>
          </p>
          <p className="muted small">춘천에서 학교를 다닌 졸업생의 동의를 받아 익명으로 소개할 예정이에요.</p>
        </div>
      )}
    </div>
  );
}
