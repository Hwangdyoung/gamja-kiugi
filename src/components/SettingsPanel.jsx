import { useState } from 'react';
import { MOODS } from '../lib/data.js';
import { SEND_HOURS } from '../lib/notify.js';
import { BellIcon, BookIcon, ChevronIcon, ClockIcon, InfoIcon, MoonIcon, ResetIcon, WrenchIcon } from './Icons.jsx';
import Mascot from './Mascot.jsx';
import SkyControls from './SkyControls.jsx';

const THEMES = [
  { id: 'system', label: '시스템' },
  { id: 'light', label: '밝게' },
  { id: 'dark', label: '어둡게' },
];

/* 한 줄: 색 아이콘 타일 · 제목(+한 줄 설명) · 오른쪽 값이나 스위치 */
function RowIcon({ icon: Icon, tone }) {
  return (
    <span className={`set-ico ${tone}`} aria-hidden="true">
      <Icon size={17} strokeWidth={2.1} />
    </span>
  );
}

function Toggle({ icon, tone, title, sub, checked, onChange }) {
  return (
    <label className="set-row">
      <RowIcon icon={icon} tone={tone} />
      <span className="set-text">
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
      <input type="checkbox" role="switch" aria-label={title} checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

/* 화면 모드: 작은 화면 미리보기 세 장 */
function ThemeCard({ id, label, on, onPick }) {
  return (
    <button type="button" role="radio" aria-checked={on} aria-label={label} className={`theme-card${on ? ' on' : ''}`} onClick={onPick}>
      <span className={`theme-mini ${id}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{label}</span>
    </button>
  );
}

/* 설정 (나 → 톱니): 계정 · 알림 · 화면 · 정보 · 처음부터 다시 · 시연(발표용, 접힘)
   모든 칸을 같은 '묶은 목록' 모양으로 맞췄다. 푸시 알림을 끄면 세부 알림은 접는다. */
export default function SettingsPanel({
  notifyOn,
  onNotify,
  prefs,
  onPrefs,
  days,
  onDays,
  mood,
  name,
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
  oppTotal,
  onReset,
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (k, v) => onPrefs({ ...prefs, [k]: v });
  const hourLabel = SEND_HOURS.find((h) => h.value === prefs.hour)?.label ?? '';

  return (
    <div className="settings">
      {account && (
        <section className="set-account" aria-label="계정">
          <span className="set-account-potato">
            <Mascot mood={mood} size={52} />
          </span>
          <span className="set-text">
            <b>{account.email ? name ?? '내 계정' : '로그인 안 함'}</b>
            <small>{account.email ?? '로그인하면 감자와 기록이 계정에 남아요.'}</small>
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
        </section>
      )}

      <section className="set-group" aria-label="알림">
        <h3 className="set-title">알림</h3>
        <div className="set-list">
          <Toggle icon={BellIcon} tone="red" title="푸시 알림" sub="하루에 한 번까지만 보내요" checked={notifyOn} onChange={onNotify} />
          {notifyOn ? (
            <>
              <Toggle icon={MoonIcon} tone="violet" title="미접속 알림" sub="감자 표정이 바뀌는 날 (2·4·7일째)" checked={prefs.away} onChange={(v) => set('away', v)} />
              <Toggle icon={BookIcon} tone="blue" title="마감·모집 알림" sub="스크랩한 기회 마감 3일 전·하루 전" checked={prefs.due} onChange={(v) => set('due', v)} />
              <label className="set-row">
                <RowIcon icon={ClockIcon} tone="orange" />
                <span className="set-text">
                  <b>알림 시간</b>
                </span>
                <span className="set-value">
                  {hourLabel}
                  <ChevronIcon size={15} />
                </span>
                <select className="set-select" value={prefs.hour} onChange={(e) => set('hour', +e.target.value)} aria-label="알림 시간">
                  {SEND_HOURS.map((h) => (
                    <option key={h.value} value={h.value}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <p className="set-off">알림이 꺼져 있어요. 켜면 미접속·마감 알림을 고를 수 있어요.</p>
          )}
        </div>
      </section>

      <section className="set-group" aria-label="화면">
        <h3 className="set-title">화면</h3>
        <div className="theme-cards" role="radiogroup" aria-label="화면 모드">
          {THEMES.map((t) => (
            <ThemeCard key={t.id} id={t.id} label={t.label} on={prefs.theme === t.id} onPick={() => set('theme', t.id)} />
          ))}
        </div>
      </section>

      <section className="set-group" aria-label="정보">
        <h3 className="set-title">정보</h3>
        <div className="set-list">
          <div className="set-row">
            <RowIcon icon={InfoIcon} tone="teal" />
            <span className="set-text">
              <b>기회 데이터</b>
              <small>
                내 직무 {oppCount}건 · 전체 {oppTotal}건 · {researchedAt} 조사
              </small>
            </span>
          </div>
          <button type="button" className="set-row" onClick={onTour}>
            <RowIcon icon={BookIcon} tone="green" />
            <span className="set-text">
              <b>감자 사용법 다시 보기</b>
            </span>
            <ChevronIcon size={15} className="set-chev" />
          </button>
        </div>
        <p className="set-foot">앱을 열 때마다 새 목록을 받아요. 지원 전에는 원문 공고를 꼭 확인해 주세요.</p>
      </section>

      <section className="set-group" aria-label="초기화">
        <div className="set-list">
          {confirmReset ? (
            <div className="set-confirm">
              <p>이 기기의 프로필·기록·스크랩을 모두 지울까요? 되돌릴 수 없어요.</p>
              <span className="set-confirm-actions">
                <button type="button" className="btn outline sm" onClick={() => setConfirmReset(false)}>
                  취소
                </button>
                <button type="button" className="btn danger sm" onClick={onReset}>
                  모두 지우기
                </button>
              </span>
            </div>
          ) : (
            <button type="button" className="set-row danger" onClick={() => setConfirmReset(true)}>
              <RowIcon icon={ResetIcon} tone="red" />
              <span className="set-text">
                <b>처음부터 다시 시작</b>
              </span>
            </button>
          )}
        </div>
      </section>

      <details className="set-group set-demo">
        <summary className="set-list">
          <span className="set-row">
            <RowIcon icon={WrenchIcon} tone="gray" />
            <span className="set-text">
              <b>시연·테스트 도구</b>
            </span>
            <span className="badge">발표용</span>
            <ChevronIcon size={15} className="set-chev" />
          </span>
        </summary>
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
              <div>
                <dt>시작 설정 완료</dt>
                <dd>{metrics.onboardingDone ? '예' : '아니요'}</dd>
              </div>
              <div>
                <dt>원문 연 횟수</dt>
                <dd>
                  {metrics.sourceOpens}회 · {metrics.sourceOpenedItems}건
                </dd>
              </div>
              <div>
                <dt>스크랩</dt>
                <dd>{metrics.saved}건</dd>
              </div>
              <div>
                <dt>기록 남김</dt>
                <dd>{metrics.stepsDone}회</dd>
              </div>
              <div>
                <dt>접속한 날</dt>
                <dd>
                  {metrics.openDays}일{metrics.returnedAfter7Days ? ' · 7일 뒤 재방문' : ''}
                </dd>
              </div>
              <div>
                <dt>알림으로 연 횟수</dt>
                <dd>{metrics.notificationOpens}회</dd>
              </div>
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
