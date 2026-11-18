import ProfileForm from './ProfileForm.jsx';
import { MOODS } from '../lib/data.js';

/* 설정: 이름·전공·직무 수정, 푸시 알림 켜고 끄기 (기획안 7장)
   + 발표용 시연: iPhone 앱에서는 폰 화면 밖 시연 도구를 볼 수 없어서 여기에도 둔다.
     슬라이더를 움직이고 홈 화면으로 나가면 위젯 표정이 바뀐다. */
export default function SettingsSheet({ profile, doneCount, notifyOn, onNotify, onSave, onClose, days, onDays, mood, onTestNotification, metrics, onCopyMetrics }) {
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
            <small>캐릭터 표정이 바뀌는 날과, 스크랩한 기회 마감 3일 전·하루 전에 알려드려요. 하루 한 번까지, 오전 10시에만 보내요.</small>
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

        {metrics && (
          <div className="sheet-metrics">
            <div className="sheet-demo-head">
              <b>테스트 지표 (이 기기)</b>
              <span className="badge">사용자 테스트용</span>
            </div>
            <dl>
              <div><dt>시작 설정 완료</dt><dd>{metrics.onboardingDone ? '예' : '아니요'}</dd></div>
              <div><dt>원문 연 횟수</dt><dd>{metrics.sourceOpens}회 · {metrics.sourceOpenedItems}건</dd></div>
              <div><dt>스크랩</dt><dd>{metrics.saved}건</dd></div>
              <div><dt>접속한 날</dt><dd>{metrics.openDays}일{metrics.returnedAfter7Days ? ' · 7일 뒤 재방문' : ''}</dd></div>
              <div><dt>알림으로 연 횟수</dt><dd>{metrics.notificationOpens}회</dd></div>
            </dl>
            <small>이름·전공은 기록하지 않아요. 테스트가 끝나면 아래 버튼으로 복사해 팀에 보내 주세요.</small>
            <button type="button" className="btn outline sm" onClick={onCopyMetrics}>
              지표 복사
            </button>
          </div>
        )}

        <h3 className="sheet-sub">내 정보</h3>
        <ProfileForm profile={profile} doneCount={doneCount} submitLabel="저장" onSubmit={onSave} />
      </div>
    </div>
  );
}
