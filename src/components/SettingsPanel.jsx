import { useState } from 'react';
import { MOODS } from '../lib/data.js';
import { SEND_HOURS } from '../lib/notify.js';
import SkyControls from './SkyControls.jsx';

const THEMES = [
  { id: 'system', label: '시스템' },
  { id: 'light', label: '밝게' },
  { id: 'dark', label: '어둡게' },
];

function Toggle({ title, sub, checked, disabled, onChange }) {
  return (
    <label className={`toggle-row${disabled ? ' off' : ''}`}>
      <span>
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
      <input type="checkbox" role="switch" aria-label={title} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/* 설정 (나 탭 안): 계정 · 알림 · 화면 · 정보 · 시연(접힘)
   내 정보 수정은 나 탭 맨 위 카드에서 한다.
   발표용 시연 도구는 iPhone 앱에서 폰 화면 밖 시연 도구를 볼 수 없어서 맨 아래 접어 둔다. */
export default function SettingsPanel({
  notifyOn,
  onNotify,
  prefs,
  onPrefs,
  days,
  onDays,
  mood,
  onTestNotification,
  metrics,
  onCopyMetrics,
  account,
  onLogin,
  onLogout,
  onTour,
  clock,
  onClock,
  sky,
  onSky,
  researchedAt,
  oppCount,
  onReset,
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (k, v) => onPrefs({ ...prefs, [k]: v });

  return (
    <div className="settings">
        {account && (
          <section className="set-group" aria-label="계정">
            <h3 className="set-title">계정</h3>
            <div className="account-row">
              <span>
                <b>{account.email ? '로그인됨' : '로그인 안 함'}</b>
                <small>{account.email ?? '로그인하면 진행 상황이 계정에 저장돼요.'}</small>
              </span>
              {account.email ? (
                <button type="button" className="btn outline sm" onClick={onLogout}>
                  로그아웃
                </button>
              ) : (
                <button type="button" className="btn primary sm" onClick={onLogin}>
                  로그인
                </button>
              )}
            </div>
          </section>
        )}

        <section className="set-group" aria-label="알림">
          <h3 className="set-title">알림</h3>
          <Toggle title="푸시 알림" sub="하루 한 번까지만 보내요. 끄면 예약된 감자 알림이 모두 지워져요." checked={notifyOn} onChange={onNotify} />
          <Toggle title="미접속 알림" sub="감자 표정이 바뀌는 날(2·4·7일째), 그 뒤엔 주 1회" checked={prefs.away} disabled={!notifyOn} onChange={(v) => set('away', v)} />
          <Toggle title="마감·모집 알림" sub="스크랩한 기회 마감 3일 전·하루 전, 정기 모집이 열리는 달 1일" checked={prefs.due} disabled={!notifyOn} onChange={(v) => set('due', v)} />
          <label className="select-row">
            <b>알림 시간</b>
            <select className="input" value={prefs.hour} disabled={!notifyOn} onChange={(e) => set('hour', +e.target.value)} aria-label="알림 시간">
              {SEND_HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="set-group" aria-label="화면">
          <h3 className="set-title">화면</h3>
          <div className="seg" role="radiogroup" aria-label="화면 모드">
            {THEMES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={prefs.theme === t.id} aria-selected={prefs.theme === t.id} onClick={() => set('theme', t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="set-group" aria-label="정보">
          <h3 className="set-title">정보</h3>
          <p className="small muted">
            기회 {oppCount}건 · {researchedAt} 조사. 앱을 열 때 새 목록을 받아요. 지원 전에는 원문 공고를 꼭 확인해 주세요.
          </p>
          <button type="button" className="link" onClick={onTour}>
            감자 사용법 다시 보기
          </button>
          {confirmReset ? (
            <div className="confirm-row">
              <span className="small">이 기기의 프로필·기록·스크랩을 모두 지울까요? 되돌릴 수 없어요.</span>
              <span className="record-actions">
                <button type="button" className="btn danger sm" onClick={onReset}>
                  모두 지우기
                </button>
                <button type="button" className="link" onClick={() => setConfirmReset(false)}>
                  취소
                </button>
              </span>
            </div>
          ) : (
            <button type="button" className="link danger-link" onClick={() => setConfirmReset(true)}>
              처음부터 다시 시작
            </button>
          )}
        </section>

        <details className="set-group sheet-more">
          <summary className="set-title">시연·테스트 도구</summary>
          <div className="sheet-demo">
            <div className="sheet-demo-head">
              <b>시연: 마지막 접속 후 {days}일</b>
              <span className="badge">프로토타입 전용</span>
            </div>
            <input type="range" min="0" max="14" step="1" value={days} aria-label="시연용 미접속 일수" onChange={(e) => onDays(+e.target.value)} />
            {onClock && <SkyControls clock={clock} onClock={onClock} sky={sky} onSky={onSky} labelClass="sheet-demo-label" />}
            <small>지금 표정: {MOODS[mood]}. iPhone 앱에서는 홈 화면 위젯도 이 일수만큼 지난 모습으로 바뀌어요.</small>
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
                <div><dt>기록 남김</dt><dd>{metrics.stepsDone}회</dd></div>
                <div><dt>접속한 날</dt><dd>{metrics.openDays}일{metrics.returnedAfter7Days ? ' · 7일 뒤 재방문' : ''}</dd></div>
                <div><dt>알림으로 연 횟수</dt><dd>{metrics.notificationOpens}회</dd></div>
              </dl>
              <small>이름·학과와 기록 내용은 남기지 않아요. 테스트가 끝나면 아래 버튼으로 복사해 팀에 보내 주세요.</small>
              <button type="button" className="btn outline sm" onClick={onCopyMetrics}>
                지표 복사
              </button>
            </div>
          )}
        </details>
    </div>
  );
}
