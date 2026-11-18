import { Capacitor, registerPlugin } from '@capacitor/core';
import { getTrack } from './growth.js';
import { notificationPlan } from './notify.js';

/* iPhone 앱(Capacitor)으로 실행될 때만 홈 화면 위젯과 미접속 알림을 갱신한다.
   웹(Vercel)에서는 아무 일도 하지 않는다.
   iOS 쪽 구현: ios/App/App/AppDelegate.swift 의 WidgetBridgePlugin, GamjaNotifications */
const WidgetBridge = registerPlugin('WidgetBridge');

export const isNativeApp = () => Capacitor.isNativePlatform();

export function syncWidget({ profile, done, demoDays, notifyOn, items = [], saved = {} }) {
  if (!isNativeApp()) return;
  const next = done.indexOf(false); // -1이면 모두 완료
  const track = getTrack(profile);
  WidgetBridge.update({
    hasProfile: !!profile,
    name: profile?.name ?? '',
    nextStep: next === -1 ? 0 : next + 1,
    demoDays,
    // 미접속 알림 + 스크랩한 기회 마감 임박 알림. 알림을 끄면 빈 목록 → 예약된 감자 알림이 모두 지워진다
    notifications: profile && notifyOn ? notificationPlan({ done, track, items, saved }) : [],
  }).catch(() => {
    /* App Group 설정이 안 됐으면 위젯만 갱신되지 않는다. 앱 사용에는 지장 없음 */
  });
}

/* 발표용: 지금 표정의 알림을 10초 뒤에 보낸다 (그사이 iPhone을 잠그면 Apple Watch에 뜬다) */
export function sendTestNotification({ mood, body }) {
  if (!isNativeApp()) return Promise.reject(new Error('iPhone 앱에서만 보낼 수 있어요.'));
  return WidgetBridge.testNotification({ mood, body });
}

/* 감자 알림을 눌러 앱이 열렸을 때 갈 곳. onOpen({ target: 'opp:<id>' | 'home', kind: 'due' | 'away' })
   - 앱이 꺼져 있다가 알림으로 켜진 경우: 켜지자마자 한 번 가져온다
   - 앱이 켜져 있을 때 누른 경우: 이벤트로 받는다
   돌려주는 함수를 부르면 듣기를 멈춘다. 웹에서는 아무것도 하지 않는다. */
export function listenNotificationOpen(onOpen) {
  if (!isNativeApp()) return () => {};
  let handle;
  WidgetBridge.consumeNotificationTarget()
    .then((r) => r?.target && onOpen(r))
    .catch(() => {});
  WidgetBridge.addListener('notificationOpen', (r) => r?.target && onOpen(r)).then((h) => {
    handle = h;
  });
  return () => handle?.remove();
}
