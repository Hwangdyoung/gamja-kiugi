import { BagIcon, ChatIcon, HomeIcon, PathIcon, UserIcon } from './Icons.jsx';

/* 하단 탭 5개: 기회 · 로드맵 · [홈] · 커뮤니티 · 나
   홈은 가운데에 동그랗게 도드라지게 두고, 양옆에 두 개씩 */
export const TABS = [
  { id: 'opps', label: '기회', Icon: BagIcon },
  { id: 'path', label: '로드맵', Icon: PathIcon },
  { id: 'home', label: '홈', Icon: HomeIcon, center: true },
  { id: 'community', label: '커뮤니티', Icon: ChatIcon },
  { id: 'me', label: '나', Icon: UserIcon },
];

export default function TabBar({ tab, onTab }) {
  return (
    <nav className="tabbar" aria-label="하단 탭" data-tour="tabs">
      {TABS.map(({ id, label, Icon, center }) => (
        <button
          key={id}
          type="button"
          className={`tab${center ? ' tab-home' : ''}`}
          aria-current={tab === id ? 'page' : undefined}
          aria-label={center ? label : undefined}
          onClick={() => onTab(id)}
        >
          {center ? (
            <span className="tab-home-btn">
              <Icon size={24} />
            </span>
          ) : (
            <>
              <Icon size={22} />
              <span>{label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}
