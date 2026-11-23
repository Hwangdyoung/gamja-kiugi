/* 선 아이콘 모음 (24px 격자, currentColor) */
const Svg = ({ children, size = 22, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
  </Svg>
);
export const BagIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
  </Svg>
);
export const PathIcon = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6" />
  </Svg>
);
export const ChatIcon = (p) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
  </Svg>
);
export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);
export const BackIcon = (p) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);
export const ChevronIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);
export const ExternalIcon = (p) => (
  <Svg size={18} {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </Svg>
);
export const CheckIcon = (p) => (
  <Svg size={16} strokeWidth="3" {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const BookmarkIcon = ({ on, ...p }) => (
  <Svg {...p} fill={on ? 'currentColor' : 'none'}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </Svg>
);
/* 감자 돌보기: 물 · 햇빛 · 거름 */
export const DropIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5Z" />
  </Svg>
);
export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Svg>
);
export const SproutIcon = (p) => (
  <Svg {...p}>
    <path d="M12 20v-8" />
    <path d="M12 12c0-3.5 2.5-6 6.5-6 0 3.5-2.5 6-6.5 6Z" />
    <path d="M12 14c0-3-2.2-5-5.5-5 0 3 2.2 5 5.5 5Z" />
    <path d="M7 20h10" />
  </Svg>
);
export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.3-3.6 4.2-5.5 7.5-5.5s6.2 1.9 7.5 5.5" />
  </Svg>
);
export const HeartIcon = ({ on, ...p }) => (
  <Svg {...p} fill={on ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Svg>
);
export const GearIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Svg>
);
export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
  </Svg>
);
export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const MoonIcon = (p) => (
  <Svg {...p}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Svg>
);
export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);
export const BookIcon = (p) => (
  <Svg {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 20a2 2 0 0 0 2 2h13v-4" />
  </Svg>
);
export const ResetIcon = (p) => (
  <Svg {...p}>
    <path d="M4 4v6h6" />
    <path d="M5.5 15a7 7 0 1 0 1.2-7.6L4 10" />
  </Svg>
);
export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);
export const PencilIcon = (p) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);

/* 기회 유형 그림 (카드 왼쪽 썸네일) */
export const MegaphoneIcon = (p) => (
  <Svg {...p}>
    <path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 6a8.5 8.5 0 0 1 0 12" />
  </Svg>
);
export const TrophyIcon = (p) => (
  <Svg {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 6H5a2 2 0 0 0 3 4" />
    <path d="M16 6h3a2 2 0 0 1-3 4" />
    <path d="M12 13v4" />
    <path d="M8.5 20h7l-1-3h-5z" />
  </Svg>
);
export const BulbIcon = (p) => (
  <Svg {...p}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  </Svg>
);
export const WrenchIcon = (p) => (
  <Svg {...p}>
    <path d="M14.5 5.5a4 4 0 0 0 4.8 5L20 11l-9 9a2.1 2.1 0 0 1-3-3l9-9 .5.7a4 4 0 0 0-3-3.2z" />
  </Svg>
);
export const BuildingIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    <path d="M11 21v-3h2v3" />
  </Svg>
);
export const FlagIcon = (p) => (
  <Svg {...p}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 4 2 4H5" />
  </Svg>
);
