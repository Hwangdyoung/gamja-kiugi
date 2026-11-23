import { ddayLabel, daysLeft, formatDate, opensIn } from '../lib/opportunities.js';
import { BagIcon, BookmarkIcon, BuildingIcon, BulbIcon, MegaphoneIcon, TrophyIcon, WrenchIcon } from './Icons.jsx';

/* 유형마다 포스터 그림과 색 (공고 포스터 대신 그려 만든 표지). 색은 styles.css의 .t-* */
const TYPE_ICON = { 서포터즈: MegaphoneIcon, 공모전: TrophyIcon, 프로젝트: BulbIcon, 인턴: BagIcon, 현장실습: WrenchIcon, 취업: BuildingIcon };
const TYPE_KEY = { 서포터즈: 'sup', 공모전: 'con', 프로젝트: 'pro', 인턴: 'int', 현장실습: 'fld', 취업: 'job' };
export const typeKey = (type) => TYPE_KEY[type] ?? 'pro';
export const TypeIcon = ({ type, ...p }) => {
  const Icon = TYPE_ICON[type] ?? BulbIcon;
  return <Icon {...p} />;
};

/* 기관 이름을 표지용으로 짧게: 괄호·(재)·법인 꼬리 떼기 */
const shortOrg = (org) => org.replace(/^\(재\)|\(.*?\)/g, '').replace(/\s*·.*$/, '').trim();

/* 상태 배지: 마감 7일 안이면 빨강, 마감일 있으면 진한 파랑, 곧 열리면 초록, 그 밖은 흰 바탕 */
export function statusOf(item, today) {
  const left = daysLeft(item, today);
  const label = ddayLabel(item, today);
  if (left !== null) return { label, tone: left <= 7 ? 'hot' : 'open', sub: `${formatDate(item.deadline).slice(5)} 마감` };
  if (opensIn(item, today) !== null) return { label, tone: 'soon', sub: item.when };
  return { label, tone: 'idle', sub: item.when };
}

/* 포스터 표지: 유형 색 바탕 + 큰 유형 그림 + 기관 이름. 상태 배지는 왼쪽 위 */
export function Poster({ item, today, size = 'md', children }) {
  const Icon = TYPE_ICON[item.type] ?? BulbIcon;
  const st = statusOf(item, today);
  return (
    <span className={`poster t-${typeKey(item.type)} ${size}`}>
      <span className={`status ${st.tone}`}>{st.label}</span>
      <Icon className="poster-art" size={size === 'lg' ? 120 : 84} strokeWidth={1.4} />
      <span className="poster-org">{shortOrg(item.org)}</span>
      {children}
    </span>
  );
}

/* 기회 카드 (공모전·대외활동 사이트처럼): 위 포스터 표지 · 아래 제목 2줄 · 기관 · 꼬리표.
   목록은 두 줄 격자, 마감 임박은 가로 줄(rail)에 같은 카드를 조금 크게 */
export default function OpportunityCard({ item, today, saved, onOpen, onSave, rail = false }) {
  const st = statusOf(item, today);
  return (
    <article className={`opp${rail ? ' rail' : ''}`}>
      <button type="button" className="opp-main" onClick={() => onOpen(item.id)}>
        <Poster item={item} today={today} />
        <span className="opp-title">{item.title}</span>
        <span className="opp-org">{item.org}</span>
        <span className="opp-tags">
          <span className="tag">{item.type}</span>
          {item.online && <span className="tag online">온라인</span>}
          {item.ours && <span className="tag ours">우리 학교</span>}
        </span>
        {st.sub && <span className="opp-when">{st.sub}</span>}
      </button>
      <button
        type="button"
        className={`save${saved ? ' on' : ''}`}
        aria-pressed={saved}
        aria-label={`${item.title} 스크랩`}
        onClick={() => onSave(item.id)}
      >
        <BookmarkIcon on={saved} size={18} />
      </button>
    </article>
  );
}
