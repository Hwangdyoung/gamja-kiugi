import { useEffect, useMemo, useRef, useState } from 'react';
import { getTrack, messageFor, moodOf } from './lib/growth.js';
import { migrateDone, progressOf } from './lib/roadmap.js';
import { buildItems, isOpen, startOfToday } from './lib/opportunities.js';
import { DEFAULT_PREFS, urgentSaved } from './lib/notify.js';
import { nagLine, nagTarget, savedToApply } from './lib/apply.js';
import { resumeText } from './lib/resume.js';
import { CARE, dailyWater, earn, emptyCare, give, isSleepTime, vitalOf } from './lib/care.js';
import { BUNDLED, cachedData, fetchLatest } from './lib/opportunityData.js';
import { fetchWeather, timeOfDay } from './lib/weather.js';
import { exportText, setEventSink, summary as metricsSummary, track as logEvent, trackOpen } from './lib/metrics.js';
import { authEnabled, currentUser, onAuthChange, pullProgress, pushEvent, pushProgress, signOut } from './lib/auth.js';
import Login from './screens/Login.jsx';
import Welcome from './screens/Welcome.jsx';
import * as storage from './lib/storage.js';
import { isNativeApp, listenNotificationOpen, sendTestNotification, syncWidget } from './lib/nativeWidget.js';
import Onboarding from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Opportunities from './screens/Opportunities.jsx';
import OpportunityDetail from './screens/OpportunityDetail.jsx';
import Path from './screens/Path.jsx';
import Community from './screens/Community.jsx';
import TabBar from './components/TabBar.jsx';
import Me from './screens/Me.jsx';
import Tour from './components/Tour.jsx';
import DemoPanel from './components/DemoPanel.jsx';
import { BackIcon } from './components/Icons.jsx';

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
  // 지원 기록 { [기회 id]: { s: 지원함·합격·불합격, at } } (이 기기에만 저장)
  const [applied, setApplied] = useState(validStored?.applied ?? {});
  const [notifyOn, setNotifyOn] = useState(validStored?.notifyOn ?? true);
  // 감자 돌보기: 물·햇빛·거름과 기운 (이 기기에만 저장)
  const [care, setCare] = useState(() => ({ ...emptyCare(), ...(validStored?.care ?? {}) }));
  // 알림 세부 설정과 화면 모드 (이 기기에만 저장)
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, theme: 'system', ...(validStored?.prefs ?? {}) }));

  // 화면 상태
  const [tab, setTab] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [pathStart, setPathStart] = useState(null); // 나 탭에서 '내 기록'을 누르면 로드맵을 내 기록부터
  const [q, setQ] = useState('');
  const [type, setType] = useState([]); // 고른 기회 유형들 (비면 전체)
  const [mode, setMode] = useState(null);
  const [nameDraft, setNameDraft] = useState(''); // 시작 화면에서 입력 중인 이름
  const [toast, setToast] = useState('');
  // 앱을 열 때마다 감자 얼굴 시작 화면부터 (시작하기를 누르면 닫힘)
  const [welcomed, setWelcomed] = useState(false);
  const [days, setDays] = useState(0); // 시연용 미접속 일수
  const [clock, setClock] = useState('auto'); // 시연용 감자 시간: 지금 · 새벽 · 낮 · 노을 · 밤
  const [sky, setSky] = useState('auto'); // 시연용 날씨: 지금 · 맑음 · 흐림 · 비 · 눈
  const [weather, setWeather] = useState(null); // 춘천 지금 날씨 { kind, temp }
  const [now, setNow] = useState(() => new Date());

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
        setTab('home');
        setDetailId(id);
      }),
    []
  );

  const scrollRef = useRef(null);
  const today = useMemo(() => startOfToday(), []);

  useEffect(() => {
    if (profile) storage.save({ profile, log, saved, applied, notifyOn, prefs, care });
  }, [profile, log, saved, applied, notifyOn, prefs, care]);

  // 홈 배경: 1분마다 시계를 다시 보고, 춘천 날씨는 앱을 열거나 돌아올 때 받는다(30분 저장)
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    const refresh = () => {
      setNow(new Date());
      if (import.meta.env.MODE !== 'test') fetchWeather().then((w) => w && setWeather(w));
    };
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(tick);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // 하루 첫 접속이면 물 1개 (앱으로 돌아올 때도 확인)
  useEffect(() => {
    if (!profile) return undefined;
    const water = () => setCare((c) => dailyWater(c, new Date()));
    water();
    const onVisible = () => document.visibilityState === 'visible' && water();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [!!profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // 진로 행동을 하면 햇빛·거름이 생긴다 (같은 행동은 한 번만)
  const reward = (kind, key) => {
    const r = earn(care, kind, key);
    if (r.care !== care) setCare(r.care);
    if (r.got) setToast(`${CARE[kind].label} 1개를 받았어요. 홈에서 감자에게 줘 보세요.`);
  };
  const giveCare = (kind) => {
    const next = give(care, kind, new Date());
    if (next) {
      setCare(next);
      logEvent('care_give', { kind });
    }
  };

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
    // 지원한 기회는 마감 알림에서 뺀다 (지원 끝났는데 조르지 않게)
    const send = () => syncWidget({ profile, log, demoDays: days, notifyOn, prefs, items, saved: savedToApply(saved, applied) });
    send();
    const onVisible = () => document.visibilityState === 'visible' && send();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [profile, log, days, notifyOn, prefs, items, saved, applied]);
  const progress = useMemo(() => progressOf(profile, log), [profile, log]);
  const mood = moodOf(days);
  const message = profile ? messageFor(mood, { progress, type: prefs.potatoType ?? null }) : '';
  const appName = APP_NAME;
  const detail = detailId ? all.find((it) => it.id === detailId) : null;

  // 지원했어요: 스크랩도 같이 켜고, 처음이면 거름 1개. 결과(합격·불합격)는 나중에 바꾼다
  const markApplied = (id, s) => {
    if (!s) {
      setApplied((a) => {
        const { [id]: _gone, ...rest } = a;
        return rest;
      });
      return;
    }
    logEvent(s === 'applied' ? 'apply' : 'apply_result', { id, s });
    setApplied((a) => ({ ...a, [id]: { s, at: a[id]?.at ?? new Date().toISOString() } }));
    if (s === 'applied') {
      if (!saved[id]) setSaved((v) => ({ ...v, [id]: true }));
      const r = earn(care, 'compost', `apply:${id}`);
      if (r.care !== care) setCare(r.care);
      setToast(r.got ? '지원 완료! 감자가 신났어. 거름 1개를 받았어요.' : '지원 완료! 감자가 신났어.');
    } else if (s === 'pass') setToast('합격 축하해! 로드맵에 한 줄 남기면 감자가 자라요.');
    else setToast('괜찮아. 지원해 본 것만으로 한 뼘 컸어.');
  };
  const nag = profile ? nagTarget(items, saved, applied, today) : null;

  const toggleSave = (id) => {
    logEvent('save', { id, on: !saved[id] });
    if (!saved[id]) reward('sun', `save:${id}`);
    setSaved((s) => ({ ...s, [id]: !s[id] }));
  };
  // 할 일을 끝내면 한 줄 기록을 남긴다. 기록을 지우면 다시 안 한 일이 된다
  const recordTask = (id, note) => {
    if (!log[id]) {
      logEvent('step_done', { task: id });
      reward('compost', `rec:${id}`);
      // 마지막 할 일까지 마치면 감자가 학사모를 쓴다 (이력서 재료가 다 모인 때)
      if (progress.count + 1 >= progress.total) setTimeout(() => setToast('할 일을 다 마쳤어요! 감자가 학사모를 받았어요. 내 기록에서 이력서 초안을 복사해 보세요.'), 900);
    }
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
    setPathStart(null);
    setTab(t);
  };

  const saveProfile = (next) => {
    const changed = !profile || profile.major !== next.major || profile.track !== next.track;
    if (!profile) logEvent('onboarding_done');
    setProfile(next);
    // 계열·직무를 바꿔도 남긴 기록은 지우지 않는다 (공통 할 일 기록은 그대로 이어진다)
    if (changed) {
      setQ('');
      setType([]);
      setMode(null);
      setDetailId(null);
    }
    if (!changed && profile) setToast('저장했어요.');
  };

  const reset = () => {
    storage.clear();
    setProfile(null);
    setLog({});
    setSaved({});
    setApplied({});
    setNotifyOn(true);
    setPrefs({ ...DEFAULT_PREFS, theme: 'system' });
    setCare(emptyCare());
    setTab('home');
    setDetailId(null);
    setQ('');
    setType([]);
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

  // 설정 (나 탭 안)
  const settingsProps = {
    notifyOn,
    onNotify: setNotifyOn,
    prefs,
    onPrefs: setPrefs,
    researchedAt: oppData.researchedAt,
    oppCount: all.length,
    oppTotal: oppData.opportunities?.length ?? all.length,
    name: profile?.name ?? null,
    onReset: reset,
    clock,
    onClock: setClock,
    sky,
    onSky: setSky,
    onTour: () => {
      setPrefs((p) => ({ ...p, tourDone: false }));
      goTab('home');
    },
    days,
    onDays: setDays,
    mood,
    metrics: metricsSummary(),
    account: authEnabled() ? { email: user?.email ?? null } : null,
    onLogin: () => setShowLogin(true),
    onLogout: () =>
      signOut().then(() => {
        setUser(null);
        setToast('로그아웃했어요. 이 기기에는 그대로 남아 있어요.');
      }),
    onCopyMetrics: () =>
      navigator.clipboard
        ?.writeText(exportText())
        .then(() => setToast('지표를 복사했어요. 팀 단톡방에 붙여 넣어 주세요.'))
        .catch(() => setToast('복사하지 못했어요.')),
    onTestNotification: !isNativeApp()
      ? null
      : () =>
          sendTestNotification({ mood, body: message })
            .then(() => setToast('10초 뒤에 알림이 와요. 지금 iPhone을 잠그면 Apple Watch에도 떠요.'))
            .catch((e) => setToast(e?.message || '알림을 보내지 못했어요.')),
  };

  let screen;
  const needLogin = authEnabled() && authReady && !user && ((!profile && !guest) || showLogin);
  const showWelcome = authReady && !welcomed;
  // 처음 홈에 오면 감자 사용법 안내
  const showTour = !!profile && !needLogin && !showWelcome && !detail && tab === 'home' && !prefs.tourDone;
  if (!authReady) {
    screen = null;
  } else if (showWelcome) {
    screen = <Welcome name={profile?.name} onStart={() => setWelcomed(true)} />;
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
        applied={applied[detail.id] ?? null}
        onApply={markApplied}
        onRoadmap={(stage) => {
          setDetailId(null);
          setPathStart(stage);
          setTab('path');
        }}
        researchedAt={oppData.researchedAt}
        onSource={() => {
          logEvent('source_open', { id: detail.id });
          reward('sun', `src:${detail.id}`);
        }}
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
        urgent={urgentSaved(items, savedToApply(saved, applied), today)}
        nag={nag && { id: nag.item.id, line: nagLine(nag), left: nag.left }}
        onOpen={setDetailId}
        outfit={prefs.potatoType ?? null}
        care={care}
        vital={vitalOf(care)}
        sleeping={clock === 'auto' ? isSleepTime(now) : clock === 'night'}
        time={clock === 'auto' ? timeOfDay(now) : clock}
        weather={sky === 'auto' ? weather?.kind ?? 'clear' : sky}
        temp={sky === 'auto' ? weather?.temp ?? null : null}
        onGive={giveCare}
        onTab={goTab}
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
        mood={mood}
        progress={progress}
        log={log}
        items={items}
        today={today}
        onRecord={recordTask}
        onClear={clearTask}
        onOpen={setDetailId}
        onCopyResume={copyResume}
        startView={pathStart}
        outfit={prefs.potatoType ?? null}
      />
    );
  } else if (tab === 'me') {
    screen = (
      <Me
        profile={profile}
        mood={mood}
        progress={progress}
        vital={vitalOf(care)}
        items={items}
        all={all}
        saved={saved}
        applied={applied}
        log={log}
        today={today}
        onOpen={setDetailId}
        onSave={toggleSave}
        onSaveProfile={saveProfile}
        onRecords={() => {
          setDetailId(null);
          setPathStart('rec');
          setTab('path');
        }}
        onCopyResume={copyResume}
        message={message}
        openDays={metricsSummary().openDays}
        onRoadmap={(stage) => {
          setDetailId(null);
          setPathStart(stage);
          setTab('path');
        }}
        settings={settingsProps}
        potatoType={prefs.potatoType ?? null}
        onPotatoType={(t) => {
          logEvent('potato_type', { type: t });
          setPrefs((p) => ({ ...p, potatoType: t }));
        }}
        onFindOpps={(types) => {
          setQ('');
          setMode(null);
          setType(types);
          goTab('opps');
        }}
      />
    );
  } else {
    screen = (
      <Community
        profile={profile}
        signedIn={!!user}
        onLogin={() => setShowLogin(true)}
        onToast={setToast}
        onTrack={logEvent}
      />
    );
  }

  return (
    <div className="stage">
      <div className="phone" aria-label={`${appName} 앱 화면`}>
        {profile && !needLogin && !showWelcome && (
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
          </header>
        )}

        <div className={`content${showWelcome ? ' is-welcome' : profile && !needLogin && !detail && tab === 'home' ? ' is-home' : ''}${profile && !needLogin && !showWelcome ? ' has-tabbar' : ''}`} ref={scrollRef}>
          {screen}
        </div>

        {profile && !needLogin && !showWelcome && <TabBar tab={detail ? null : tab} onTab={goTab} />}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}

        {showTour && <Tour onDone={() => setPrefs((p) => ({ ...p, tourDone: true }))} />}
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
          setWelcomed(false);
          setDays(0);
          setDetailId(null);
          setTab('home');
        }}
        onReset={reset}
        clock={clock}
        onClock={setClock}
        sky={sky}
        onSky={setSky}
      />
    </div>
  );
}
