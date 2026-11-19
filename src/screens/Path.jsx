import { CheckIcon, ChevronIcon } from '../components/Icons.jsx';
import PageHead from '../components/PageHead.jsx';
import { ddayLabel } from '../lib/opportunities.js';
import { MAJORS } from '../lib/data.js';

/* 내 경로: 1~4단계 카드, 단계별 기회, 완료 체크 */
export default function Path({ profile, track, done, items, today, onToggle, onOpen }) {
  const dc = done.filter(Boolean).length;
  return (
    <div className="screen">
      <PageHead
        no="03"
        en="MY PATH"
        title="4단계면 어디든 지원할 수 있다."
        lead={`${MAJORS[profile.major].label} · ${track.label} 경로예요. 끝낸 단계는 완료로 표시하세요. 4단계 채용 공고는 강원 지역만 보여주지만, 쌓은 이력은 어디에 지원하든 써요.`}
      />
      <div className="path-progress">
        <div className="bar" role="progressbar" aria-label="성장 경로 진행" aria-valuemin={0} aria-valuemax={4} aria-valuenow={dc}>
          <i style={{ width: `${dc * 25}%` }} />
        </div>
        <b>{dc} / 4단계 완료</b>
      </div>

      <ol className="steps">
        {track.levels.map((level, i) => {
          const opps = items.filter((it) => it.step === i);
          return (
            <li key={i} className={`step${done[i] ? ' done' : ''}`}>
              <span className="step-dot" aria-hidden="true">
                {done[i] ? <CheckIcon /> : i + 1}
              </span>
              <div className="card step-card">
                <p className="eyebrow">
                  {i + 1}단계 · {level.tag}
                </p>
                <h3>{level.t}</h3>
                <p className="muted">{level.d}</p>
                {opps.length === 0 && <p className="step-empty">이 단계에 맞는 기회를 조사하고 있어요.</p>}
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
                <label className="check">
                  <input type="checkbox" checked={done[i]} onChange={() => onToggle(i)} />
                  완료로 표시
                </label>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
