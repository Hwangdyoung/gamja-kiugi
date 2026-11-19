import { BookmarkIcon, ExternalIcon } from '../components/Icons.jsx';
import { ddayLabel, formatDate } from '../lib/opportunities.js';

const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/* 기회 상세: 주최 기관, 마감일, 대상, 내 경로의 몇 단계인지, 원문 링크 (기획안 5장) */
export default function OpportunityDetail({ item, today, saved, onSave, researchedAt, onSource }) {
  return (
    <div className="screen detail">
      <div className="detail-head">
        <p className="kicker">OPPORTUNITY</p>
        <span className="opp-meta">
          <span className="tag">{item.type}</span>
          {item.online && <span className="tag online">온라인</span>}
          {item.ours && <span className="tag ours">우리 학교</span>}
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
    </div>
  );
}
