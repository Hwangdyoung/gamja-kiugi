/* 테스트용 지표 (기획안 11장). 서버 없이 이 기기에만 기록한다.
   학생 10~20명 사용자 테스트 때 각자 설정 화면의 "지표 복사"로 받아 모은다.
   이름·전공 같은 입력값은 기록하지 않는다(어떤 기회를 열었는지 id와 시각만). */
const KEY = 'gamja:metrics';
const MAX_EVENTS = 500;
const DAY = 86400000;

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

function read() {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (m && Array.isArray(m.events) && Array.isArray(m.openDays)) return m;
  } catch {
    /* 깨진 기록은 새로 시작 */
  }
  return { firstOpen: null, openDays: [], events: [] };
}

function write(m) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* 저장 못 하면 기록 없이 계속 */
  }
}

/* 이벤트 하나 기록. type: onboarding_view · onboarding_done · source_open · save · step_done · notification_open */
export function track(type, data = {}, now = Date.now()) {
  const m = read();
  m.events.push({ type, ts: now, ...data });
  if (m.events.length > MAX_EVENTS) m.events = m.events.slice(-MAX_EVENTS);
  write(m);
}

/* 앱을 연 날 기록 (하루 한 번) */
export function trackOpen(now = Date.now()) {
  const m = read();
  if (!m.firstOpen) m.firstOpen = now;
  const k = dayKey(now);
  if (!m.openDays.includes(k)) m.openDays.push(k);
  write(m);
}

/* 기획안 11장 지표를 이 기기 기준으로 요약 */
export function summary() {
  const m = read();
  const of = (t) => m.events.filter((e) => e.type === t);
  const first = m.firstOpen ? new Date(m.firstOpen).setHours(0, 0, 0, 0) : null;
  const returned7 = first != null && m.openDays.some((k) => new Date(`${k}T00:00:00`).getTime() - first >= 7 * DAY);
  const saves = new Set();
  of('save').forEach((e) => (e.on ? saves.add(e.id) : saves.delete(e.id)));
  return {
    onboardingViewed: of('onboarding_view').length > 0,
    onboardingDone: of('onboarding_done').length > 0,
    sourceOpens: of('source_open').length,
    sourceOpenedItems: new Set(of('source_open').map((e) => e.id)).size,
    saved: saves.size,
    stepsDone: of('step_done').length,
    openDays: m.openDays.length,
    returnedAfter7Days: returned7,
    notificationOpens: of('notification_open').length,
    dueNotificationThenSource: of('notification_open')
      .filter((n) => n.kind === 'due')
      .filter((n) => of('source_open').some((s) => s.id === n.id && s.ts >= n.ts && s.ts - n.ts < DAY)).length,
  };
}

/* 팀에 보낼 내보내기 문자열 (요약 + 원 기록) */
export function exportText() {
  return JSON.stringify({ exportedAt: new Date().toISOString(), summary: summary(), raw: read() }, null, 2);
}

export function resetMetrics() {
  write({ firstOpen: null, openDays: [], events: [] });
}
