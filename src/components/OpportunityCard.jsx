import { ddayLabel, daysLeft } from '../lib/opportunities.js';
import { BookmarkIcon } from './Icons.jsx';

/* 기회 카드: 정보는 정확하고 건조하게 (기획안 4장) */
export default function OpportunityCard({ item, today, saved, onOpen, onSave }) {
  const left = daysLeft(item, today);
  const urgent = left !== null && left <= 7;
  return (
    <article className="card opp">
      <button type="button" className="opp-main" onClick={() => onOpen(item.id)}>
        <span className="opp-meta">
          <span className="tag">{item.type}</span>
          {item.online && <span className="tag online">온라인</span>}
          {item.ours && <span className="tag ours">우리 학교</span>}
          <span className={`dday${urgent ? ' urgent' : ''}`}>{ddayLabel(item, today)}</span>
        </span>
        <span className="opp-title">{item.title}</span>
        <span className="opp-org">
          {item.org} · {item.step + 1}학년 할 일
        </span>
      </button>
      <button
        type="button"
        className={`icon-btn save${saved ? ' on' : ''}`}
        aria-pressed={saved}
        aria-label={`${item.title} 스크랩`}
        onClick={() => onSave(item.id)}
      >
        <BookmarkIcon on={saved} size={20} />
      </button>
    </article>
  );
}
