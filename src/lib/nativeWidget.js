import { Capacitor, registerPlugin } from '@capacitor/core';

/* iPhone 앱(Capacitor)으로 실행될 때만 홈 화면 위젯에 상태를 보낸다.
   웹(Vercel)에서는 아무 일도 하지 않는다.
   iOS 쪽 구현: ios/App/App/AppDelegate.swift 의 WidgetBridgePlugin */
const WidgetBridge = registerPlugin('WidgetBridge');

export const isNativeApp = () => Capacitor.isNativePlatform();

export function syncWidget({ profile, done, demoDays }) {
  if (!isNativeApp()) return;
  const next = done.indexOf(false); // -1이면 모두 완료
  WidgetBridge.update({
    hasProfile: !!profile,
    name: profile?.name ?? '',
    nextStep: next === -1 ? 0 : next + 1,
    demoDays,
  }).catch(() => {
    /* App Group 설정이 안 됐으면 위젯만 갱신되지 않는다. 앱 사용에는 지장 없음 */
  });
}
