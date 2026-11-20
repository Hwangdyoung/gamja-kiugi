import { MOODS } from '../lib/data.js';
import { notifyDecision, SEND_TIME } from '../lib/notify.js';
import SkyControls from './SkyControls.jsx';

const MAX = 14;
const TICKS = [0, 2, 4, 7, 14];

/* 폰 화면 밖의 발표용 시연 도구. 실제 앱에서는 마지막 접속일로 자동 계산된다. */
export default function DemoPanel({ ready, days, onDays, mood, message, appName, notifyOn, onReopen, onReset, clock = 'auto', onClock, sky = 'auto', onSky }) {
  const decision = notifyDecision(days, notifyOn);
  return (
    <aside className="demo" aria-label="시연 도구">
      <div className="demo-head">
        <h2>시연 도구</h2>
        <span className="badge">프로토타입 전용</span>
      </div>
      <p className="demo-desc">실제 앱에서는 마지막 접속일로 자동 계산돼요. 여기서는 미접속 일수를 직접 바꿔 봅니다.</p>

      {!ready ? (
        <p className="demo-empty">폰 화면에서 시작 설정을 마치면 사용할 수 있어요.</p>
      ) : (
        <>
          <div className="demo-block">
            <label htmlFor="days" className="demo-label">
              마지막 접속 후 <b>{days}일</b>
            </label>
            <input id="days" type="range" min="0" max={MAX} step="1" value={days} onChange={(e) => onDays(+e.target.value)} />
            <div className="ticks" aria-hidden="true">
              {TICKS.map((t) => (
                <span key={t} style={{ left: `${(t / MAX) * 100}%` }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {onClock && (
            <div className="demo-block">
              <SkyControls clock={clock} onClock={onClock} sky={sky} onSky={onSky} />
            </div>
          )}

          <dl className="demo-facts">
            <div>
              <dt>캐릭터 표정</dt>
              <dd>{MOODS[mood]}</dd>
            </div>
            <div>
              <dt>오늘 알림</dt>
              <dd>
                {decision.send ? `보냄 · ${SEND_TIME}` : '보내지 않음'}
                <small>{decision.reason}</small>
              </dd>
            </div>
          </dl>

          <p className="demo-label">잠금 화면 미리보기</p>
          {decision.send ? (
            <div className="push">
              <img className="push-icon" src="./icons/icon-192.png" alt="" width="32" height="32" />
              <div>
                <div className="push-top">
                  <b>{appName}</b>
                  <span>{SEND_TIME.replace('오전 ', '')}</span>
                </div>
                <p>{message}</p>
              </div>
            </div>
          ) : (
            <p className="push-none">오늘은 알림이 없어요.</p>
          )}

          <div className="demo-actions">
            <button type="button" className="btn outline sm" onClick={onReopen} disabled={days === 0}>
              앱 다시 열기
            </button>
            <button type="button" className="btn ghost sm" onClick={onReset}>
              처음부터 다시
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
