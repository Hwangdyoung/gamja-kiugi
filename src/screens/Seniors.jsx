import { useState } from 'react';
import { MAJORS } from '../lib/data.js';
import PageHead from '../components/PageHead.jsx';
import { ChevronIcon } from '../components/Icons.jsx';

/* 선배 사례 모으기: 같은 선배가 여러 직무에 걸려 있어도 한 번만. 내 직무 선배가 먼저 */
function collect(profile, scope) {
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

const REGIONS = ['전체', '춘천', '수도권'];

function Detail({ s, onBack }) {
  return (
    <div className="screen senior-detail">
      <button type="button" className="link back-link" onClick={onBack}>
        ← 선배 목록
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

/* 선배: 춘천에서 학교를 다니며 경험을 쌓은 졸업생 사례. 목록(한 줄 요약) → 눌러서 자세히 */
export default function Seniors({ profile }) {
  const major = MAJORS[profile.major];
  const [scope, setScope] = useState('mine');
  const [region, setRegion] = useState('전체');
  const [open, setOpen] = useState(null);

  const all = collect(profile, scope);
  const list = all.filter((s) => region === '전체' || s.region === region);
  if (open) return <Detail s={open} onBack={() => setOpen(null)} />;

  return (
    <div className="screen">
      <PageHead no="04" en="SENIORS" title="먼저 해 본 선배들." lead="춘천에서 학교 다니며 경험을 쌓은 선배들이에요. 지금은 춘천에도, 수도권에도 있어요." />

      <div className="seg" role="tablist" aria-label="선배 범위">
        <button type="button" role="tab" aria-selected={scope === 'mine'} onClick={() => setScope('mine')}>
          우리 계열
          <small>{collect(profile, 'mine').length}</small>
        </button>
        <button type="button" role="tab" aria-selected={scope === 'all'} onClick={() => setScope('all')}>
          모든 계열
          <small>{collect(profile, 'all').length}</small>
        </button>
      </div>
      <div className="chips" role="group" aria-label="지금 일하는 곳">
        {REGIONS.map((r) => (
          <button key={r} type="button" className="chip" aria-pressed={region === r} onClick={() => setRegion(r)}>
            {r === '전체' ? '전체' : `${r}에서 일해요`}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="list">
          {list.map((s) => (
            <button key={s.who} type="button" className="card senior-row" onClick={() => setOpen(s)}>
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
                {scope === 'all' && <span className="muted small">{s.majorLabel} · {s.trackLabel}</span>}
              </span>
              <ChevronIcon size={16} />
            </button>
          ))}
        </div>
      ) : (
        <div className="card empty">
          <p>
            <b>{scope === 'mine' ? `${major.label} 계열 선배 인터뷰를 준비하고 있어요.` : '조건에 맞는 선배가 없어요.'}</b>
          </p>
          <p className="muted small">춘천에서 학교를 다닌 졸업생의 동의를 받아 익명으로 소개할 예정이에요.</p>
          {scope === 'mine' && (
            <button type="button" className="btn outline sm" onClick={() => setScope('all')}>
              다른 계열 선배 보기
            </button>
          )}
        </div>
      )}
      <p className="disclaimer">지금은 실제 춘천 프로그램을 바탕으로 만든 가상 사례예요.</p>
    </div>
  );
}
