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
        #if DEBUG
        // 시뮬레이터 확인용: GAMJA_DEMO_DAYS=7 처럼 넘기면 그 일수의 표정으로 연다 (출시 빌드에는 없음)
        if let raw = ProcessInfo.processInfo.environment["GAMJA_DEMO_DAYS"], let days = Int(raw),
           let store = UserDefaults(suiteName: watchGroup) {
            store.set(days, forKey: "demoDays")
            store.set(Date().timeIntervalSince1970, forKey: "lastOpen")
        }
        #endif
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
        #if DEBUG
        // 시뮬레이터 확인 중에는 iPhone이 남긴 값으로 덮어쓰지 않는다
        if ProcessInfo.processInfo.environment["GAMJA_DEMO_DAYS"] != nil { return }
        #endif
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

    /// 아이보리 배경 위 글자색
    private static let ivory = Color(red: 1.00, green: 0.98, blue: 0.93)
    private static let ink = Color(red: 0.16, green: 0.14, blue: 0.12)
    private static let inkSoft = Color(red: 0.45, green: 0.42, blue: 0.38)

    /// 밝은 배경에서도 잘 보이게 표정 색을 진하게
    private var titleColor: Color {
        switch state.mood {
        case .happy: return Color(red: 0.13, green: 0.55, blue: 0.30)
        case .neutral: return Self.inkSoft
        case .annoyed: return Color(red: 0.85, green: 0.45, blue: 0.05)
        case .angry: return Color(red: 0.90, green: 0.25, blue: 0.20)
        }
    }

    /// 표정별 그라데이션 세기: 웃음 0, 무표정 0.35, 짜증 0.7, 분노 1
    private var glow: Double {
        switch state.mood {
        case .happy: return 0
        case .neutral: return 0.35
        case .annoyed: return 0.7
        case .angry: return 1
        }
    }

    /// 위쪽은 흰 시계가 보여야 해서 웃을 때도 이만큼은 남긴다
    private var topGlow: Double { max(glow, 0.7) }

    /// 아이보리 → 감자색(0.72, 0.55, 0.38) 사이 색. amount × 세기만큼 감자색 쪽으로
    private func edge(_ amount: Double, _ strength: Double) -> Color {
        let t = amount * strength
        return Color(red: 1.00 + (0.72 - 1.00) * t,
                     green: 0.98 + (0.55 - 0.98) * t,
                     blue: 0.93 + (0.38 - 0.93) * t)
    }

    var body: some View {
        // 스크롤 없이 한 화면에 고정: 화면 맨 위(시계 줄)까지 써서 감자를 130pt로 크게, 글자는 아래에 붙인다
        ZStack {
        // 아이보리 배경 + 위아래 감자색 그라데이션. 아래는 화날수록 진하고 웃을 때는 없다. 위는 시계 때문에 늘 조금 남긴다
        LinearGradient(stops: [
            .init(color: edge(1.0, topGlow), location: 0),
            .init(color: edge(0.55, topGlow), location: 0.12),
            .init(color: Self.ivory, location: 0.30),
            .init(color: Self.ivory, location: 0.70),
            .init(color: edge(0.55, glow), location: 0.88),
            .init(color: edge(1.0, glow), location: 1),
        ], startPoint: .top, endPoint: .bottom)
        .ignoresSafeArea()
        VStack(spacing: 2) {
            Spacer(minLength: 0)
            Image(state.mood.imageName)
                .resizable()
                .scaledToFit()
                .frame(maxWidth: .infinity)
                .frame(height: 130)
            Text(state.title)
                .font(.system(size: 20, weight: .heavy))
                .foregroundStyle(titleColor)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(state.sub)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Self.ink)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
            Text(state.meta)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Self.inkSoft)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 4)
        .ignoresSafeArea(edges: .top)
        }
        .toolbar(.hidden, for: .navigationBar)
        .onReceive(NotificationCenter.default.publisher(for: .gamjaUpdated)) { _ in
            state = GamjaState.load(at: .now)
        }
        .onAppear { state = GamjaState.load(at: .now) }
    }
}
