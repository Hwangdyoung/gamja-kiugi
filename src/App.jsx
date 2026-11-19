import { useEffect, useMemo, useRef, useState } from 'react';
import { getTrack, messageFor, moodOf } from './lib/growth.js';
import { migrateDone, progressOf } from './lib/roadmap.js';
import { buildItems, isOpen, opensIn, startOfToday } from './lib/opportunities.js';
import { DEFAULT_PREFS, urgentSaved } from './lib/notify.js';
import { resumeText } from './lib/resume.js';
import { BUNDLED, cachedData, fetchLatest } from './lib/opportunityData.js';
import { exportText, setEventSink, summary as metricsSummary, track as logEvent, trackOpen } from './lib/metrics.js';
import { authEnabled, currentUser, onAuthChange, pullProgress, pushEvent, pushProgress, signOut } from './lib/auth.js';
import Login from './screens/Login.jsx';
import * as storage from './lib/storage.js';
import { isNativeApp, listenNotificationOpen, sendTestNotification, syncWidget } from './lib/nativeWidget.js';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Opportunities from './screens/Opportunities.jsx';
import OpportunityDetail from './screens/OpportunityDetail.jsx';
import Path from './screens/Path.jsx';
import Seniors from './screens/Seniors.jsx';
import TabBar from './components/TabBar.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';
import DemoPanel from './components/DemoPanel.jsx';
import { BackIcon, GearIcon } from './components/Icons.jsx';

const APP_NAME = '감자 키우기';
/* 계정·기기에 저장된 기록. 예전 4단계 체크(배열)면 기록으로 옮긴다 */
const toLog = (profile, v) => (Array.isArray(v) ? migrateDone(profile, v) : v ?? {});

export default function App() {
  const stored = useMemo(() => storage.load(), []);
  const validStored = stored && getTrack(stored.profile) ? stored : null;

  // 기기에 저장하는 값 (기획안 10장: 로그인 없이 기기에 저장)
  const [profile, setProfile] = useState(validStored?.profile ?? null);
  // 할 일별 한 줄 기록 { [할 일 id]: { note, at } } (학년별 로드맵)
  const [log, setLog] = useState(() => (validStored ? validStored.log ?? toLog(validStored.profile, validStored.done) : {}));
  const [saved, setSaved] = useState(validStored?.saved ?? {});
  const [notifyOn, setNotifyOn] = useState(validStored?.notifyOn ?? true);
  // 알림 세부 설정과 화면 모드 (이 기기에만 저장)
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, theme: 'system', ...(validStored?.prefs ?? {}) }));

  // 화면 상태
  const [tab, setTab] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState('전체');
  const [mode, setMode] = useState(null);
  const [nameDraft, setNameDraft] = useState(''); // 시작 화면에서 입력 중인 이름
  const [toast, setToast] = useState('');
  const [days, setDays] = useState(0); // 시연용 미접속 일수

  // 로그인 (Supabase 설정이 있을 때만). 로그인 없이 둘러보기를 고르면 기기에만 저장한다
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!authEnabled());
  const [showLogin, setShowLogin] = useState(false);
  const [guest, setGuest] = useState(() => {
    try {
      return localStorage.getItem('gamja:guest') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!authEnabled()) return undefined;
    currentUser().then((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return onAuthChange(setUser);
  }, []);
  useEffect(() => {
    setEventSink(user ? (type, data) => pushEvent(user.id, type, data) : null);
  }, [user]);
  // 로그인 상태에서 진행 상황이 바뀌면 1초 뒤 계정에 저장
  useEffect(() => {
    if (!user || !profile) return undefined;
    // 계정 표의 done 칸(jsonb)에 기록을 그대로 넣는다 (표 구조를 바꾸지 않으려고)
    const t = setTimeout(() => pushProgress(user.id, { profile, done: log, saved, notifyOn }), 1000);
    return () => clearTimeout(t);
  }, [user, profile, log, saved, notifyOn]);

  const onLoggedIn = async (u) => {
    setUser(u);
    setShowLogin(false);
    setGuest(false);
    try {
      localStorage.removeItem('gamja:guest');
    } catch {
      /* 무시 */
    }
    // 계정에 저장된 게 있으면 그걸로 이어서, 없으면 이 기기 진행 상황을 계정에 올린다
    const remote = await pullProgress(u.id);
    if (remote && getTrack(remote.profile)) {
      setProfile(remote.profile);
      setLog(toLog(remote.profile, remote.done));
      setSaved(remote.saved ?? {});
      setNotifyOn(remote.notifyOn ?? true);
      setToast('저장된 감자를 불러왔어요.');
    } else if (profile) {
      pushProgress(u.id, { profile, done: log, saved, notifyOn });
      setToast('이 기기의 감자를 계정에 저장했어요.');
    }
  };
  const browseAsGuest = () => {
    setGuest(true);
    setShowLogin(false);
    try {
      localStorage.setItem('gamja:guest', '1');
    } catch {
      /* 무시 */
    }
  };

  // 춘천 기회 데이터: 저장본 → 앱 기본값으로 바로 그리고, 최신 파일을 받으면 바꾼다
  const [oppData, setOppData] = useState(() => cachedData() ?? BUNDLED);
  useEffect(() => {
    const refresh = () => fetchLatest({ native: isNativeApp() }).then((d) => d && setOppData(d));
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // 기획안 11장 지표: 앱을 연 날, 시작 화면을 본 적
  useEffect(() => {
    trackOpen();
    const onVisible = () => document.visibilityState === 'visible' && trackOpen();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  useEffect(() => {
    if (!profile) logEvent('onboarding_view');
  }, [!profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // 알림을 누르고 들어오면 그 화면으로: 마감 알림 → 그 기회 상세, 미접속 알림 → 홈(다음 단계)
  useEffect(
    () =>
      listenNotificationOpen(({ target, kind }) => {
        const id = target.startsWith('opp:') ? target.slice(4) : null;
        logEvent('notification_open', { kind, id });
        setSettingsOpen(false);
        setTab('home');
        setDetailId(id);
      }),
    []
  );

  const scrollRef = useRef(null);
  const today = useMemo(() => startOfToday(), []);

  useEffect(() => {
    if (profile) storage.save({ profile, log, saved, notifyOn, prefs });
  }, [profile, log, saved, notifyOn, prefs]);

  // 화면 모드: 시스템이면 기기 설정을 따라간다
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && !!mq?.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [prefs.theme]);

  // 화면이 바뀌면 맨 위부터 보여준다
  useEffect(() => {
    scrollRef.current?.scrollTo?.(0, 0);
  }, [tab, detailId]);

  // 브라우저 탭 아이콘이 캐릭터 표정을 따라간다 (기획안 7장: 앱 아이콘 표정 변화)
  const tabMood = moodOf(days);
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]');
    if (link) link.href = `./icons/favicon-${tabMood}.png`;
  }, [tabMood]);


  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // 마감이 지난 기회는 목록에서 자동으로 내린다 (기획안 8장)
  const all = useMemo(() => buildItems(profile, today, oppData), [profile, today, oppData]);
  const items = useMemo(
    () =>
      all
        .filter((it) => isOpen(it, today))
        .sort((a, b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity)),
    [all, today]
  );
  const hiddenCount = all.length - items.length;

  // iPhone 앱이면 홈 화면 위젯에 이름·진행·시연 일수를 보내고 알림(미접속·마감 임박)을 다시 예약한다.
  // 앱으로 돌아올 때마다 "지금 접속"으로 기록
  useEffect(() => {
    const send = () => syncWidget({ profile, log, demoDays: days, notifyOn, prefs, items, saved });
    send();
    const onVisible = () => document.visibilityState === 'visible' && send();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [profile, log, days, notifyOn, prefs, items, saved]);
  const progress = useMemo(() => progressOf(profile, log), [profile, log]);
  const mood = moodOf(days);
  const message = profile ? messageFor(mood, { progress }) : '';
  const appName = APP_NAME;
  const detail = detailId ? all.find((it) => it.id === detailId) : null;

  const toggleSave = (id) => {
    logEvent('save', { id, on: !saved[id] });
    setSaved((s) => ({ ...s, [id]: !s[id] }));
  };
  // 할 일을 끝내면 한 줄 기록을 남긴다. 기록을 지우면 다시 안 한 일이 된다
  const recordTask = (id, note) => {
    if (!log[id]) logEvent('step_done', { task: id });
    setLog((l) => ({ ...l, [id]: { note, at: new Date().toISOString() } }));
  };
  const clearTask = (id) =>
    setLog((l) => {
      const { [id]: _gone, ...rest } = l;
      return rest;
    });
  const copyResume = () =>
    navigator.clipboard
      ?.writeText(resumeText(profile, progress, log))
      .then(() => setToast('이력서 초안을 복사했어요. 메모장이나 지원서에 붙여 넣어 보세요.'))
      .catch(() => setToast('복사하지 못했어요.'));
  const goTab = (t) => {
    setDetailId(null);
    setTab(t);
  };

  const saveProfile = (next) => {
    const changed = !profile || profile.major !== next.major || profile.track !== next.track;
    if (!profile) logEvent('onboarding_done');
    setProfile(next);
    // 계열·직무를 바꿔도 남긴 기록은 지우지 않는다 (공통 할 일 기록은 그대로 이어진다)
    if (changed) {
      setQ('');
      setType('전체');
      setMode(null);
      setDetailId(null);
    }
    setSettingsOpen(false);
    if (!changed && profile) setToast('저장했어요.');
  };

  const reset = () => {
    storage.clear();
    setProfile(null);
    setLog({});
    setSaved({});
    setNotifyOn(true);
    setPrefs({ ...DEFAULT_PREFS, theme: 'system' });
    setTab('home');
    setDetailId(null);
    setSettingsOpen(false);
    setQ('');
    setType('전체');
    setMode(null);
    setNameDraft('');
    setDays(0);
    setGuest(false);
    try {
      localStorage.removeItem('gamja:guest');
    } catch {
      /* 무시 */
    }
    if (user) signOut().then(() => setUser(null));
  };

  let screen;
  const needLogin = authEnabled() && authReady && !user && ((!profile && !guest) || showLogin);
  if (!authReady) {
    screen = null;
  } else if (needLogin) {
    screen = <Login onDone={onLoggedIn} onGuest={browseAsGuest} />;
  } else if (!profile) {
    screen = <Onboarding nameDraft={nameDraft} onNameDraft={setNameDraft} onSubmit={saveProfile} signedIn={!!user} />;
  } else if (detail) {
    screen = (
      <OpportunityDetail
        item={detail}
        today={today}
        saved={!!saved[detail.id]}
        onSave={toggleSave}
        researchedAt={oppData.researchedAt}
        onSource={() => logEvent('source_open', { id: detail.id })}
      />
    );
  } else if (tab === 'home') {
    screen = (
      <Home
        name={profile.name}
        progress={progress}
        mood={mood}
        message={message}
        items={items}
        today={today}
        saved={saved}
        urgent={urgentSaved(items, saved, today)}
        soon={items.filter((it) => opensIn(it, today) !== null)}
        onOpen={setDetailId}
        onSave={toggleSave}
        onTab={goTab}
        onSearch={(v) => {
          setQ(v);
          setType('전체');
          goTab('opps');
        }}
      />
    );
  } else if (tab === 'opps') {
    screen = (
      <Opportunities
        items={items}
        hiddenCount={hiddenCount}
        today={today}
        q={q}
        onQuery={setQ}
        type={type}
        onType={setType}
        mode={mode}
        onMode={setMode}
        saved={saved}
        onOpen={setDetailId}
        onSave={toggleSave}
      />
    );
  } else if (tab === 'path') {
    screen = (
      <Path
        profile={profile}
        progress={progress}
        log={log}
        items={items}
        today={today}
        onRecord={recordTask}
        onClear={clearTask}
        onOpen={setDetailId}
        onCopyResume={copyResume}
      />
    );
  } else {
    screen = <Seniors profile={profile} />;
  }

  return (
    <div className="stage">
      <div className="phone" aria-label={`${appName} 앱 화면`}>
        {profile && !needLogin && (
          <header className="appbar">
            {detail ? (
              <button type="button" className="icon-btn" aria-label="뒤로" onClick={() => setDetailId(null)}>
                <BackIcon />
              </button>
            ) : (
              <span className="brand">
                <span className="nm">감자</span> 키우기
              </span>
            )}
            {detail && <span className="appbar-title">기회 상세</span>}
            <button type="button" className="icon-btn" aria-label="설정" onClick={() => setSettingsOpen(true)}>
              <GearIcon />
            </button>
          </header>
        )}

        <div className={`content${profile && !detail && tab === 'home' ? ' is-home' : ''}`} ref={scrollRef}>
          {screen}
        </div>

        {profile && !needLogin && <TabBar tab={detail ? null : tab} onTab={goTab} />}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}

        {settingsOpen && profile && (
          <SettingsSheet
            profile={profile}
            notifyOn={notifyOn}
            onNotify={setNotifyOn}
            prefs={prefs}
            onPrefs={setPrefs}
            recordCount={progress.count}
            onCopyResume={copyResume}
            researchedAt={oppData.researchedAt}
            oppCount={all.length}
            onReset={reset}
            onSave={saveProfile}
            onClose={() => setSettingsOpen(false)}
            days={days}
            onDays={setDays}
            mood={mood}
            metrics={metricsSummary()}
            account={authEnabled() ? { email: user?.email ?? null } : null}
            onLogin={() => {
              setSettingsOpen(false);
              setShowLogin(true);
            }}
            onLogout={() =>
              signOut().then(() => {
                setUser(null);
                setToast('로그아웃했어요. 이 기기에는 그대로 남아 있어요.');
              })
            }
            onCopyMetrics={() =>
              navigator.clipboard
                ?.writeText(exportText())
                .then(() => setToast('지표를 복사했어요. 팀 단톡방에 붙여 넣어 주세요.'))
                .catch(() => setToast('복사하지 못했어요.'))
            }
            onTestNotification={!isNativeApp() ? null : () =>
              sendTestNotification({ mood, body: message })
                .then(() => setToast('10초 뒤에 알림이 와요. 지금 iPhone을 잠그면 Apple Watch에도 떠요.'))
                .catch((e) => setToast(e?.message || '알림을 보내지 못했어요.'))
            }
          />
        )}
      </div>

      <DemoPanel
        ready={!!profile}
        days={days}
        onDays={setDays}
        mood={mood}
        message={message}
        appName={appName}
        notifyOn={notifyOn}
        onReopen={() => {
          setDays(0);
          setDetailId(null);
          setTab('home');
        }}
        onReset={reset}
      />
    </div>
  );
}
