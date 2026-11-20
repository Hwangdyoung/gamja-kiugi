/* 시연용 홈 배경 바꾸기: 시간 · 날씨 ('지금'이면 실제 시계·춘천 날씨를 따른다)
   폰 밖 시연 도구와, iPhone 앱의 설정 → 시연·테스트 도구에서 같이 쓴다 */
const CLOCKS = [
  { id: 'auto', label: '지금' },
  { id: 'dawn', label: '새벽' },
  { id: 'day', label: '낮' },
  { id: 'dusk', label: '노을' },
  { id: 'night', label: '밤' },
];
const SKIES = [
  { id: 'auto', label: '지금' },
  { id: 'clear', label: '맑음' },
  { id: 'cloudy', label: '흐림' },
  { id: 'rain', label: '비' },
  { id: 'snow', label: '눈' },
];

function Seg({ label, list, value, onChange }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {list.map((c) => (
        <button key={c.id} type="button" role="radio" aria-checked={value === c.id} aria-selected={value === c.id} onClick={() => onChange(c.id)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export default function SkyControls({ clock, onClock, sky, onSky, labelClass = 'demo-label' }) {
  return (
    <>
      <p className={labelClass}>감자 시간 (밤 11시~아침 7시엔 잠)</p>
      <Seg label="감자 시간" list={CLOCKS} value={clock} onChange={onClock} />
      <p className={labelClass}>날씨</p>
      <Seg label="날씨" list={SKIES} value={sky} onChange={onSky} />
    </>
  );
}
