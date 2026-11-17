import { BookmarkIcon, ExternalIcon } from '../components/Icons.jsx';
import { ddayLabel, formatDate } from '../lib/opportunities.js';

/* 기회 상세: 주최 기관, 마감일, 대상, 내 경로의 몇 단계인지, 원문 링크 (기획안 5장) */
export default function OpportunityDetail({ item, today, saved, onSave, onSource }) {
  return (
    <div className="screen detail">
      <div className="detail-head">
        <p className="kicker">OPPORTUNITY</p>
        <span className="opp-meta">
          <span className="tag">{item.type}</span>
          <span className="dday">{ddayLabel(item, today)}</span>
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
        <div>
          <dt>대상</dt>
          <dd>{item.target}</dd>
        </div>
        <div>
          <dt>내 경로</dt>
          <dd>
            {item.step + 1}단계 · {item.stepTitle}
          </dd>
        </div>
        <div>
          <dt>출처</dt>
          <dd className="muted">프로토타입 예시 데이터 · 실제 공고 아님</dd>
        </div>
      </dl>

      <div className="detail-actions">
        <button type="button" className={`btn outline${saved ? ' on' : ''}`} aria-pressed={saved} onClick={() => onSave(item.id)}>
          <BookmarkIcon on={saved} size={18} />
          {saved ? '스크랩됨' : '스크랩'}
        </button>
        <button type="button" className="btn primary grow" onClick={onSource}>
          원문 보기
          <ExternalIcon />
        </button>
      </div>
    </div>
  );
}
