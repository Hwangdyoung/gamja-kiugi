import { useEffect, useMemo, useRef, useState } from 'react';
import { doneCount, getTrack, messageFor, moodOf } from './lib/growth.js';
import { buildItems, isOpen, startOfToday } from './lib/opportunities.js';
import * as storage from './lib/storage.js';
import { isNativeApp, sendTestNotification, syncWidget } from './lib/nativeWidget.js';
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

  // iPhone 앱이면 홈 화면 위젯에 이름·진행·시연 일수를 보낸다. 앱으로 돌아올 때마다 "지금 접속"으로 기록
  useEffect(() => {
    const send = () => syncWidget({ profile, done, demoDays: days, notifyOn });
    send();
    const onVisible = () => document.visibilityState === 'visible' && send();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [profile, done, days, notifyOn]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const track = getTrack(profile);
  // 마감이 지난 기회는 목록에서 자동으로 내린다 (기획안 8장)
  const all = useMemo(() => buildItems(profile, today), [profile, today]);
  const items = useMemo(
    () =>
      all
        .filter((it) => isOpen(it, today))
        .sort((a, b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity)),
    [all, today]
  );
  const hiddenCount = all.length - items.length;
  const mood = moodOf(days);
  const message = profile ? messageFor(mood, { name: profile.name, done, track }) : '';
  const appName = APP_NAME;
  const detail = detailId ? all.find((it) => it.id === detailId) : null;

  const toggleSave = (id) => setSaved((s) => ({ ...s, [id]: !s[id] }));
  const goTab = (t) => {
    setDetailId(null);
    setTab(t);
  };

  const saveProfile = (next) => {
    const changed = !profile || profile.major !== next.major || profile.track !== next.track;
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
  };

  let screen;
  if (!profile) {
    screen = <Onboarding nameDraft={nameDraft} onNameDraft={setNameDraft} onSubmit={saveProfile} />;
  } else if (detail) {
    screen = (
      <OpportunityDetail
        item={detail}
        today={today}
        saved={!!saved[detail.id]}
        onSave={toggleSave}
        onSource={() => setToast('예시 데이터라 원문이 없어요. 실제 공고를 모으면 원문 링크로 연결돼요.')}
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
        onToggle={(i) => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
        onOpen={setDetailId}
      />
    );
  } else {
    screen = <Seniors profile={profile} />;
  }

  return (
    <div className="stage">
      <div className="phone" aria-label={`${appName} 앱 화면`}>
        {profile && (
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

        <div className="content" ref={scrollRef}>
          {screen}
        </div>

        {profile && <TabBar tab={detail ? null : tab} onTab={goTab} />}

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
