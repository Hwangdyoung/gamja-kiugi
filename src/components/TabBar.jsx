import { BagIcon, ChatIcon, HomeIcon, PathIcon } from './Icons.jsx';

/* 하단 탭 4개: 홈, 기회, 로드맵, 선배 (기획안 6장) */
export const TABS = [
  { id: 'home', label: '홈', Icon: HomeIcon },
  { id: 'opps', label: '기회', Icon: BagIcon },
  { id: 'path', label: '로드맵', Icon: PathIcon },
  { id: 'senior', label: '선배', Icon: ChatIcon },
];

export default function TabBar({ tab, onTab }) {
  return (
    <nav className="tabbar" aria-label="하단 탭">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="tab"
          aria-current={tab === id ? 'page' : undefined}
          onClick={() => onTab(id)}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
