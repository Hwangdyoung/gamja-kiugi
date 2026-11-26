import { BookmarkIcon, CheckIcon, ExternalIcon } from '../components/Icons.jsx';
import Mascot from '../components/Mascot.jsx';
import { Poster } from '../components/OpportunityCard.jsx';
import { formatDate } from '../lib/opportunities.js';

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/* 기회 상세: 주최 기관, 마감일, 대상, 내 경로의 몇 단계인지, 원문 링크 (기획안 5장) */
const dateLabel = (iso) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};
/* 감자 말투 (반말, 기획안 9장) */
const SAY = {
  none: '지원했으면 알려 줘! 거름 줄게.',
  applied: '지원했구나! 결과 나오면 꼭 알려 줘.',
  pass: '합격이라니!! 로드맵에 한 줄 남기자.',
  fail: '괜찮아. 지원해 본 것만으로 한 뼘 컸어.',
};
const RESULTS = [
  ['applied', '기다리는 중'],
  ['pass', '합격'],
  ['fail', '불합격'],
];

export default function OpportunityDetail({ item, today, saved, onSave, applied, onApply, onRoadmap, researchedAt, onSource }) {
  return (
    <div className="screen detail">
      <div className="detail-head">
        <Poster item={item} today={today} size="lg" />
        <span className="opp-tags">
          <span className="tag">{item.type}</span>
          {item.online && <span className="tag online">온라인</span>}
          {item.ours && <span className="tag ours">우리 학교</span>}
        </span>
        <h1>{item.title}</h1>
      </div>

      <dl className="card facts">
        <div>
          <dt>주최 기관</dt>
          <dd>{item.org}</dd>
        </div>
        <div>
          <dt>마감일</dt>
          <dd>{formatDate(item.deadline)}</dd>
        </div>
        {item.when && (
          <div>
            <dt>모집 시기</dt>
            <dd>{item.when}</dd>
          </div>
        )}
        <div>
          <dt>참여 방식</dt>
          <dd>{item.online ? '온라인 (춘천에서도 참여)' : '춘천·강원 현장'}</dd>
        </div>
        <div>
          <dt>대상</dt>
          <dd>{item.target}</dd>
        </div>
        <div>
          <dt>내 로드맵</dt>
          <dd>{item.stepTitle}</dd>
        </div>
        <div>
          <dt>출처</dt>
          <dd className="muted">{host(item.src)}</dd>
        </div>
      </dl>

      <p className="disclaimer">
        {researchedAt}에 조사한 내용이에요. 일정과 조건은 바뀔 수 있으니 지원 전에 원문에서 꼭 확인해 주세요.
      </p>

      <div className="detail-actions">
        <button type="button" className={`btn outline${saved ? ' on' : ''}`} aria-pressed={saved} onClick={() => onSave(item.id)}>
          <BookmarkIcon on={saved} size={18} />
          {saved ? '스크랩됨' : '스크랩'}
        </button>
        <a className="btn primary grow" href={item.src} target="_blank" rel="noopener noreferrer" onClick={onSource}>
          원문 보기
          <ExternalIcon />
        </a>
      </div>

      {/* 지원 기록: 감자가 말을 거는 한 판. 원문을 보고 끝나지 않게, 지원하면 거름을 주고 결과까지 같이 챙긴다 */}
      <section className={`apply${applied ? ` is-${applied.s}` : ''}`} aria-label="내 지원">
        <span className="apply-potato">
          <Mascot mood={applied?.s === 'fail' ? 'neutral' : 'happy'} size={64} />
        </span>
        <div className="apply-body">
          <p className="apply-say" aria-live="polite">
            {SAY[applied?.s ?? 'none']}
          </p>
          {applied ? (
            <>
              <div className="seg apply-seg" role="tablist" aria-label="지원 결과">
                {RESULTS.map(([s, label]) => (
                  <button key={s} type="button" role="tab" aria-selected={applied.s === s} onClick={() => onApply(item.id, s)}>
                    {label}
                  </button>
                ))}
              </div>
              <small className="apply-meta">
                {dateLabel(applied.at)}에 지원 ·{' '}
                <button type="button" className="link" onClick={() => onApply(item.id, null)}>
                  지원 취소
                </button>
              </small>
            </>
          ) : (
            <button type="button" className="btn outline sm" onClick={() => onApply(item.id, 'applied')}>
              <CheckIcon size={16} strokeWidth={2.6} />
              지원했어요
            </button>
          )}
        </div>
        {applied?.s === 'pass' && (
          <button type="button" className="btn primary block apply-next" onClick={() => onRoadmap(item.step)}>
            로드맵에 한 줄 남기러 가기
          </button>
        )}
      </section>
    </div>
  );
}
