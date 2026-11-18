import UIKit
import Capacitor
import WidgetKit
import UserNotifications
import WatchConnectivity

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // 앱을 보고 있을 때도 감자 알림 배너가 뜨게 한다 (시연용 "미리 보내기")
        UNUserNotificationCenter.current().delegate = self
        WatchSync.shared.activate()
        return true
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .sound])
    }

    /// 감자 알림을 누르면: 알림에 담긴 목적지("opp:<기회 id>" 또는 "home")를 웹 화면에 넘겨 그 화면을 연다.
    /// 앱이 꺼져 있다가 알림으로 켜졌을 때는 웹이 아직 준비 전이라, 보관해 두었다가 웹이 가져가게 한다.
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let info = response.notification.request.content.userInfo
        let target = info["target"] as? String ?? "home"
        let kind = info["kind"] as? String ?? "away"
        GamjaNotificationTarget.pending = ["target": target, "kind": kind]
        NotificationCenter.default.post(name: .gamjaNotificationOpened, object: nil)
        completionHandler()
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// MARK: - 감자 위젯 연결
// 웹 화면(React)이 이름·진행 단계·시연용 미접속 일수를 보내면 App Group 저장소에 적고
// 위젯을 다시 그리게 한다. 위젯은 같은 저장소의 "마지막 접속 시각"으로 표정을 정한다.
// (새 파일을 Xcode 프로젝트에 등록하지 않아도 되도록 이미 있는 이 파일에 둔다.)

/// 앱과 위젯이 함께 쓰는 저장소 이름. Xcode의 App Groups 설정과 똑같아야 한다.
let gamjaAppGroup = "group.com.hwangdyoung.gamjakiugi"

@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "testNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "consumeNotificationTarget", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        // 앱이 켜져 있을 때 알림을 누르면 바로 웹에 알린다
        NotificationCenter.default.addObserver(forName: .gamjaNotificationOpened, object: nil, queue: .main) { [weak self] _ in
            guard let self, let pending = GamjaNotificationTarget.pending else { return }
            GamjaNotificationTarget.pending = nil
            self.notifyListeners("notificationOpen", data: pending)
        }
    }

    /// 앱이 알림으로 켜졌다면 그 목적지를 한 번만 돌려준다 (없으면 빈 값)
    @objc func consumeNotificationTarget(_ call: CAPPluginCall) {
        let pending = GamjaNotificationTarget.pending ?? [:]
        GamjaNotificationTarget.pending = nil
        call.resolve(pending)
    }

    @objc func update(_ call: CAPPluginCall) {
        NSLog("[GamjaWidget] update 호출: %@", String(describing: call.options))
        guard let store = UserDefaults(suiteName: gamjaAppGroup) else {
            call.reject("App Group 저장소를 열 수 없어요")
            return
        }
        let now = Date()
        store.set(call.getBool("hasProfile") ?? false, forKey: "hasProfile")
        store.set(call.getString("name") ?? "", forKey: "name")
        store.set(call.getInt("nextStep") ?? 1, forKey: "nextStep")   // 0이면 4단계 모두 완료
        store.set(call.getInt("demoDays") ?? 0, forKey: "demoDays")   // 시연 도구 슬라이더 값
        store.set(now.timeIntervalSince1970, forKey: "lastOpen")      // 앱을 쓰고 있으니 지금이 마지막 접속
        WidgetCenter.shared.reloadAllTimelines()

        // Apple Watch 앱·컴플리케이션에도 같은 상태를 보낸다
        WatchSync.shared.send([
            "hasProfile": call.getBool("hasProfile") ?? false,
            "name": call.getString("name") ?? "",
            "nextStep": call.getInt("nextStep") ?? 1,
            "demoDays": call.getInt("demoDays") ?? 0,
            "lastOpen": now.timeIntervalSince1970,
        ])

        // 미접속 알림 다시 예약: 앱을 열 때마다 "마지막 접속"이 바뀌므로 지우고 새로 건다
        let schedule = (call.getArray("notifications") as? [[String: Any]]) ?? []
        GamjaNotifications.reschedule(schedule, from: now)
        call.resolve()
    }

    /// 발표용: 지금 표정의 알림을 10초 뒤에 보낸다. 그사이 iPhone을 잠그면 Apple Watch에 뜬다.
    @objc func testNotification(_ call: CAPPluginCall) {
        let mood = call.getString("mood") ?? "angry"
        let body = call.getString("body") ?? ""
        GamjaNotifications.authorize { granted in
            guard granted else { call.reject("알림이 꺼져 있어요. 설정 앱에서 감자 키우기 알림을 켜 주세요."); return }
            GamjaNotifications.add(id: "gamja-test", mood: mood, body: body,
                                   trigger: UNTimeIntervalNotificationTrigger(timeInterval: 10, repeats: false))
            call.resolve()
        }
    }
}

/// 알림을 눌러 들어온 목적지를 웹이 가져갈 때까지 보관
enum GamjaNotificationTarget {
    static var pending: [String: String]?
}

extension Notification.Name {
    static let gamjaNotificationOpened = Notification.Name("gamjaNotificationOpened")
}

// MARK: - 감자 미접속 알림 (기획안 7장)
// 기기 안에서 미리 예약하는 로컬 알림이라 서버가 필요 없다.
// iPhone이 잠겨 있고 Apple Watch를 차고 있으면 iOS가 같은 알림을 워치로 자동으로 넘긴다.
enum GamjaNotifications {
    /// 밤 9시~아침 9시를 피해 오전 10시에 보낸다
    static let sendHour = 10
    /// 예약 알림 이름 앞부분. 예전 버전의 "gamja-day-"도 지울 때 함께 지운다
    static let prefix = "gamja-plan-"
    static let oldPrefixes = ["gamja-day-"]

    static func authorize(_ done: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            DispatchQueue.main.async { done(granted) }
        }
    }

    /// schedule: [{ at: 1763000000000(밀리초), kind: "away"|"due", mood: "neutral", body: "…" }, …]
    /// 웹(src/lib/notify.js notificationPlan)이 미접속 알림과 마감 임박 알림을 합쳐, 하루 한 번·오전 10시로 맞춰 보낸다.
    static func reschedule(_ schedule: [[String: Any]], from lastOpen: Date) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { pending in
            let mine = pending.map(\.identifier).filter { id in ([prefix] + oldPrefixes).contains { id.hasPrefix($0) } }
            center.removePendingNotificationRequests(withIdentifiers: mine)
            guard !schedule.isEmpty else { return }
            authorize { granted in
                guard granted else { return }
                var count = 0
                for (i, item) in schedule.enumerated() {
                    guard let at = (item["at"] as? NSNumber)?.doubleValue,
                          let mood = item["mood"] as? String,
                          let body = item["body"] as? String else { continue }
                    let fireDate = Date(timeIntervalSince1970: at / 1000)
                    guard fireDate > Date() else { continue }
                    let parts = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: fireDate)
                    add(id: "\(prefix)\(i)", mood: mood, body: body,
                        trigger: UNCalendarNotificationTrigger(dateMatching: parts, repeats: false),
                        target: item["target"] as? String ?? "home",
                        kind: item["kind"] as? String ?? "away")
                    count += 1
                }
                NSLog("[GamjaWidget] 알림 %d개 예약", count)
            }
        }
    }

    static func add(id: String, mood: String, body: String, trigger: UNNotificationTrigger,
                    target: String = "home", kind: String = "away") {
        let content = UNMutableNotificationContent()
        content.userInfo = ["target": target, "kind": kind]
        content.title = "감자 키우기"
        content.body = body
        content.sound = .default
        if let attachment = potatoAttachment(mood: mood) { content.attachments = [attachment] }
        UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: id, content: content, trigger: trigger)) { error in
            if let error { NSLog("[GamjaWidget] 알림 예약 실패: %@", error.localizedDescription) }
        }
    }

    /// 표정별 감자 그림(Assets.xcassets의 potato_*)을 알림에 붙인다. 알림 첨부는 파일만 받아서 임시 파일로 저장한다.
    private static func potatoAttachment(mood: String) -> UNNotificationAttachment? {
        guard let image = UIImage(named: "potato_\(mood)"), let data = image.pngData() else { return nil }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("potato-\(mood)-\(UUID().uuidString).png")
        do {
            try data.write(to: url)
            return try UNNotificationAttachment(identifier: "potato", url: url)
        } catch {
            return nil
        }
    }
}

// MARK: - Apple Watch로 보내기
// iPhone과 워치는 저장소를 함께 쓰지 못해서 WatchConnectivity로 보낸다.
// - applicationContext: 워치 앱이 켜질 때 받는 "최신 상태" 한 벌
// - complicationUserInfo: 워치 페이스에 컴플리케이션이 있으면 워치 앱을 깨워서 바로 반영 (하루 횟수 제한 있음)
final class WatchSync: NSObject, WCSessionDelegate {
    static let shared = WatchSync()
    private var pending: [String: Any]?

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    func send(_ info: [String: Any]) {
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        guard session.activationState == .activated else { pending = info; return }
        guard session.isPaired, session.isWatchAppInstalled else {
            NSLog("[GamjaWidget] 워치 없음 (paired=%d, installed=%d)", session.isPaired, session.isWatchAppInstalled)
            pending = info   // 나중에 워치 앱이 설치되면 보낸다
            return
        }
        do { try session.updateApplicationContext(info) } catch { NSLog("[GamjaWidget] 워치 전송 실패: %@", error.localizedDescription) }
        if session.isComplicationEnabled, session.remainingComplicationUserInfoTransfers > 0 {
            session.transferCurrentComplicationUserInfo(info)
        }
        NSLog("[GamjaWidget] 워치로 보냄 (컴플리케이션 %@)", session.isComplicationEnabled ? "있음" : "없음")
    }

    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        if state == .activated, let info = pending {
            pending = nil
            DispatchQueue.main.async { self.send(info) }
        }
    }

    /// 워치 앱이 설치되거나 워치를 바꾸면 남아 있던 상태를 보낸다
    func sessionWatchStateDidChange(_ session: WCSession) {
        if let info = pending {
            pending = nil
            DispatchQueue.main.async { self.send(info) }
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {}

    /// 다른 워치로 바꾸면 다시 연결
    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }
}

/// 위 플러그인을 등록하는 화면. SceneDelegate가 이 클래스를 쓴다.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        NSLog("[GamjaWidget] capacitorDidLoad, bridge=%@", bridge == nil ? "nil" : "ok")
        bridge?.registerPluginInstance(WidgetBridgePlugin())
    }
}
