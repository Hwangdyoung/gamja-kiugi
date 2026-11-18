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
