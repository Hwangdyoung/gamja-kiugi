import { useEffect, useMemo, useRef, useState } from 'react';
import { doneCount, getTrack, messageFor, moodOf } from './lib/growth.js';
import { buildItems, isOpen, startOfToday } from './lib/opportunities.js';
import { urgentSaved } from './lib/notify.js';
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
const EMPTY_DONE = [false, false, false, false];

export default function App() {
  const stored = useMemo(() => storage.load(), []);
  const validStored = stored && getTrack(stored.profile) ? stored : null;

  // 기기에 저장하는 값 (기획안 10장: 로그인 없이 기기에 저장)
  const [profile, setProfile] = useState(validStored?.profile ?? null);
  const [done, setDone] = useState(validStored?.done ?? EMPTY_DONE);
  const [saved, setSaved] = useState(validStored?.saved ?? {});
  const [notifyOn, setNotifyOn] = useState(validStored?.notifyOn ?? true);

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
    const t = setTimeout(() => pushProgress(user.id, { profile, done, saved, notifyOn }), 1000);
    return () => clearTimeout(t);
  }, [user, profile, done, saved, notifyOn]);

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
      setDone(remote.done ?? EMPTY_DONE);
      setSaved(remote.saved ?? {});
      setNotifyOn(remote.notifyOn ?? true);
      setToast('저장된 감자를 불러왔어요.');
    } else if (profile) {
      pushProgress(u.id, { profile, done, saved, notifyOn });
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
    if (profile) storage.save({ profile, done, saved, notifyOn });
  }, [profile, done, saved, notifyOn]);

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

  const track = getTrack(profile);
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
    const send = () => syncWidget({ profile, done, demoDays: days, notifyOn, items, saved });
    send();
    const onVisible = () => document.visibilityState === 'visible' && send();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [profile, done, days, notifyOn, items, saved]);
  const mood = moodOf(days);
  const message = profile ? messageFor(mood, { done, track }) : '';
  const appName = APP_NAME;
  const detail = detailId ? all.find((it) => it.id === detailId) : null;

  const toggleSave = (id) => {
    logEvent('save', { id, on: !saved[id] });
    setSaved((s) => ({ ...s, [id]: !s[id] }));
  };
  const toggleStep = (i) => {
    if (!done[i]) logEvent('step_done', { step: i + 1 });
    setDone((d) => d.map((v, j) => (j === i ? !v : v)));
  };
  const goTab = (t) => {
    setDetailId(null);
    setTab(t);
  };

  const saveProfile = (next) => {
    const changed = !profile || profile.major !== next.major || profile.track !== next.track;
    if (!profile) logEvent('onboarding_done');
    setProfile(next);
    if (changed) {
      setDone(EMPTY_DONE);
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
    setDone(EMPTY_DONE);
    setSaved({});
    setNotifyOn(true);
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
        track={track}
        mood={mood}
        message={message}
        done={done}
        items={items}
        today={today}
        saved={saved}
        urgent={urgentSaved(items, saved, today)}
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
        track={track}
        done={done}
        items={items}
        today={today}
        onToggle={toggleStep}
        onOpen={setDetailId}
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
            doneCount={doneCount(done)}
            notifyOn={notifyOn}
            onNotify={setNotifyOn}
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
