// 감자 키우기 Apple Watch 앱
// - iPhone 앱이 보낸 "마지막 접속 시각·이름·다음 단계·시연 일수"를 받아 워치 저장소에 적고
//   워치 페이스 컴플리케이션(GamjaWatchWidget)을 다시 그리게 한다.
// - 앱 화면에는 지금 감자 표정과 문구를 보여준다.

import SwiftUI
import WatchKit
import WatchConnectivity
import WidgetKit

/// 워치 앱과 워치 컴플리케이션이 함께 쓰는 저장소 (워치 안에서만 쓰임)
let watchGroup = "group.com.hwangdyoung.gamjakiugi"

@main
struct GamjaWatchApp: App {
    @WKApplicationDelegateAdaptor(WatchDelegate.self) private var delegate

    var body: some Scene {
        WindowGroup {
            WatchHomeView()
        }
    }
}

// MARK: - iPhone에서 받기

final class WatchDelegate: NSObject, WKApplicationDelegate, WCSessionDelegate {
    func applicationDidFinishLaunching() {
        activate()
    }

    /// 워치 앱이 꺼져 있을 때 iPhone이 컴플리케이션용 데이터를 보내면 시스템이 이 작업으로 깨운다
    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        for task in backgroundTasks {
            if let connectivity = task as? WKWatchConnectivityRefreshBackgroundTask {
                activate()
                // 받을 데이터가 다 들어올 시간을 조금 준 뒤 끝낸다
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    connectivity.setTaskCompletedWithSnapshot(false)
                }
            } else {
                task.setTaskCompletedWithSnapshot(false)
            }
        }
    }

    private func activate() {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        if session.delegate == nil { session.delegate = self }
        if session.activationState != .activated { session.activate() }
    }

    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        // 워치가 꺼져 있는 동안 iPhone이 남긴 최신 상태
        if !session.receivedApplicationContext.isEmpty { save(session.receivedApplicationContext) }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        save(applicationContext)
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
        save(userInfo)
    }

    private func save(_ info: [String: Any]) {
        guard let store = UserDefaults(suiteName: watchGroup) else { return }
        for key in ["hasProfile", "name", "nextStep", "demoDays", "lastOpen"] {
            if let value = info[key] { store.set(value, forKey: key) }
        }
        WidgetCenter.shared.reloadAllTimelines()
        NotificationCenter.default.post(name: .gamjaUpdated, object: nil)
    }
}

extension Notification.Name {
    static let gamjaUpdated = Notification.Name("gamjaUpdated")
}

// MARK: - 워치 앱 화면

struct WatchHomeView: View {
    @State private var state = GamjaState.load(at: .now)

    var body: some View {
        ScrollView {
            VStack(spacing: 4) {
                // 감자를 화면 너비 가득 크게
                Image(state.mood.imageName)
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity)
                    .frame(height: 130)
                Text(state.title)
                    .font(.system(size: 20, weight: .heavy))
                    .foregroundStyle(state.mood == .happy ? Color.white : state.mood.color)
                Text(state.sub)
                    .font(.system(size: 15, weight: .semibold))
                    .multilineTextAlignment(.center)
                Text(state.meta)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.secondary)
                    .padding(.top, 2)
            }
            .padding(.horizontal, 2)
        }
        .onReceive(NotificationCenter.default.publisher(for: .gamjaUpdated)) { _ in
            state = GamjaState.load(at: .now)
        }
        .onAppear { state = GamjaState.load(at: .now) }
    }
}
