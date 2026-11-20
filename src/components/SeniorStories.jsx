/* 선배 이야기 (가상 사례): 커뮤니티의 선배 조언 게시판 맨 위에 보인다 */
import { MAJORS } from '../lib/data.js';
import { ChevronIcon } from './Icons.jsx';

/* 선배 사례 모으기: 같은 선배가 여러 직무에 걸려 있어도 한 번만. 내 직무 선배가 먼저 */
export function collect(profile, scope) {
  const out = [];
  const seen = new Set();
  Object.entries(MAJORS).forEach(([mk, m]) => {
    if (scope === 'mine' && mk !== profile.major) return;
    Object.entries(m.tracks).forEach(([tk, t]) => {
      if (!t.senior || seen.has(t.senior)) return;
      seen.add(t.senior);
      out.push({ ...t.senior, majorLabel: m.label, trackLabel: t.label, mine: mk === profile.major && tk === profile.track });
    });
  });
  return out.sort((a, b) => b.mine - a.mine);
}

export function SeniorDetail({ s, onBack }) {
  return (
    <div className="screen senior-detail">
      <button type="button" className="link back-link" onClick={onBack}>
        ← 커뮤니티
      </button>
      <article className="card senior">
        <div className="senior-head">
          <span className="avatar" aria-hidden="true">
            {s.who.slice(-1)}
          </span>
          <div>
            <h3>{s.who}</h3>
            <p className="muted small">{s.profile}</p>
            <p className="small">{s.now}</p>
          </div>
          <span className={`tag region ${s.region === '춘천' ? 'local' : ''}`}>{s.region}</span>
        </div>
        <blockquote className="senior-quote">“{s.quote}”</blockquote>
        <h4 className="senior-sub">지나온 길</h4>
        <ol className="timeline">
          {s.steps.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        <p className="senior-tip">
          <b>후배에게</b> {s.tip}
        </p>
      </article>
      <p className="disclaimer">지금은 실제 춘천 프로그램을 바탕으로 만든 가상 사례예요. 졸업생 인터뷰를 마치면 실제 이야기로 바뀌어요.</p>
    </div>
  );
}

/* 선배 이야기 한 줄 (커뮤니티 → 선배 조언 맨 위) */
export function SeniorRow({ s, onOpen }) {
  return (
    <button type="button" className="card senior-row" onClick={() => onOpen(s)}>
      <span className="avatar" aria-hidden="true">
        {s.who.slice(-1)}
      </span>
      <span className="senior-row-body">
        <span className="senior-row-top">
          <b>{s.who}</b>
          {s.mine && <span className="tag mine">내 직무</span>}
          <span className={`tag region ${s.region === '춘천' ? 'local' : ''}`}>{s.region}</span>
        </span>
        <span className="small">{s.now}</span>
        <span className="muted small quote-1">“{s.quote}”</span>
      </span>
      <ChevronIcon size={16} />
    </button>
  );
}
