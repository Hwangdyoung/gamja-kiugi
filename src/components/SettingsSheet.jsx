import ProfileForm from './ProfileForm.jsx';
import { MOODS } from '../lib/data.js';

/* 설정: 이름·전공·직무 수정, 푸시 알림 켜고 끄기 (기획안 7장)
   + 발표용 시연: iPhone 앱에서는 폰 화면 밖 시연 도구를 볼 수 없어서 여기에도 둔다.
     슬라이더를 움직이고 홈 화면으로 나가면 위젯 표정이 바뀐다. */
export default function SettingsSheet({ profile, doneCount, notifyOn, onNotify, onSave, onClose, days, onDays, mood, onTestNotification }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="설정" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>설정</h2>
          <button type="button" className="link" onClick={onClose}>
            닫기
          </button>
        </div>
        <label className="toggle-row">
          <span>
            <b>푸시 알림</b>
            <small>캐릭터 표정이 바뀌는 날 알려드려요. 밤 9시~아침 9시에는 보내지 않아요.</small>
          </span>
          <input type="checkbox" role="switch" checked={notifyOn} onChange={(e) => onNotify(e.target.checked)} />
        </label>

        <div className="sheet-demo">
          <div className="sheet-demo-head">
            <b>시연: 마지막 접속 후 {days}일</b>
            <span className="badge">프로토타입 전용</span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="1"
            value={days}
            aria-label="시연용 미접속 일수"
            onChange={(e) => onDays(+e.target.value)}
          />
          <small>
            지금 표정: {MOODS[mood]}. iPhone 앱에서는 홈 화면 위젯도 이 일수만큼 지난 모습으로 바뀌어요.
          </small>
          {onTestNotification && (
            <button type="button" className="btn outline sm" onClick={onTestNotification}>
              지금 표정으로 알림 미리 보내기 (10초 뒤)
            </button>
          )}
        </div>

        <h3 className="sheet-sub">내 정보</h3>
        <ProfileForm profile={profile} doneCount={doneCount} submitLabel="저장" onSubmit={onSave} />
      </div>
    </div>
  );
}
