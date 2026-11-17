import UIKit
import Capacitor
import WidgetKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
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
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise)
    ]

    @objc func update(_ call: CAPPluginCall) {
        guard let store = UserDefaults(suiteName: gamjaAppGroup) else {
            call.reject("App Group 저장소를 열 수 없어요")
            return
        }
        store.set(call.getBool("hasProfile") ?? false, forKey: "hasProfile")
        store.set(call.getString("name") ?? "", forKey: "name")
        store.set(call.getInt("nextStep") ?? 1, forKey: "nextStep")   // 0이면 4단계 모두 완료
        store.set(call.getInt("demoDays") ?? 0, forKey: "demoDays")   // 시연 도구 슬라이더 값
        store.set(Date().timeIntervalSince1970, forKey: "lastOpen")   // 앱을 쓰고 있으니 지금이 마지막 접속
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}

/// 위 플러그인을 등록하는 화면. Main.storyboard가 이 클래스를 쓴다.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WidgetBridgePlugin())
    }
}
