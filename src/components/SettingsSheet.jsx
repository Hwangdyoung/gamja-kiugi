import ProfileForm from './ProfileForm.jsx';

/* 설정: 이름·전공·직무 수정, 푸시 알림 켜고 끄기 (기획안 7장) */
export default function SettingsSheet({ profile, doneCount, notifyOn, onNotify, onSave, onClose }) {
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
        <h3 className="sheet-sub">내 정보</h3>
        <ProfileForm profile={profile} doneCount={doneCount} submitLabel="저장" onSubmit={onSave} />
      </div>
    </div>
  );
}
