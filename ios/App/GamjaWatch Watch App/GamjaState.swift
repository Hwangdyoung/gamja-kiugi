// 워치 앱과 워치 컴플리케이션이 함께 쓰는 감자 상태 계산
// (같은 파일이 GamjaWatch, GamjaWatch Watch App 두 폴더에 들어 있다. 고칠 때는 둘 다 고친다.)
// 표정 규칙은 웹 앱 src/lib/growth.js, iPhone 위젯 GamjaWidget.swift와 같다.
// 워치 문구는 화면이 작아서 "감자 화났다!!" + 줄바꿈 + "새 기회 당장 확인해"처럼 두 줄로 짧게 쓴다.

import SwiftUI

private let sharedGroup = "group.com.hwangdyoung.gamjakiugi"
let gamjaDay: TimeInterval = 86_400

enum Mood: String {
    case happy, neutral, annoyed, angry

    /// 0~1일 웃음, 2~3일 무표정, 4~6일 짜증, 7일 이상 분노
    init(days: Int) {
        switch days {
        case ...1: self = .happy
        case 2...3: self = .neutral
        case 4...6: self = .annoyed
        default: self = .angry
        }
    }

    var imageName: String { "potato_\(rawValue)" }
    /// 동그란 컴플리케이션용 얼굴 확대 그림
    var faceName: String { "face_\(rawValue)" }

    var color: Color {
        switch self {
        case .happy: return Color(red: 0.30, green: 0.80, blue: 0.50)
        case .neutral: return Color(red: 0.75, green: 0.78, blue: 0.82)
        case .annoyed: return Color(red: 1.00, green: 0.66, blue: 0.25)
        case .angry: return Color(red: 1.00, green: 0.40, blue: 0.32)
        }
    }
}

struct GamjaState {
    let ready: Bool
    let days: Int
    let mood: Mood
    /// 첫 줄: "감자 화났다!!"
    let title: String
    /// 둘째 줄: "새 기회 당장 확인해"
    let sub: String

    /// 두 줄을 한 줄로 (공간이 넉넉하지 않은 곳)
    var message: String { "\(title) \(sub)" }

    var meta: String {
        guard ready else { return "iPhone에서 시작해 줘" }
        return days == 0 ? "오늘 접속했어요" : "\(days)일째 미접속"
    }

    /// 한 줄 컴플리케이션: "감자 화났다!! · 7일째"
    var inline: String {
        guard ready else { return "감자 키우기" }
        return days == 0 ? title : "\(title) · \(days)일째"
    }

    /// 코너 컴플리케이션 아래 글자
    var corner: String {
        guard ready else { return "감자" }
        return days == 0 ? "오늘 접속" : "\(days)일째"
    }

    static func lastOpen() -> Double {
        UserDefaults(suiteName: sharedGroup)?.double(forKey: "lastOpen") ?? 0
    }

    static func lines(mood: Mood, name n: String, nextStep: Int) -> (String, String) {
        switch mood {
        case .happy: return nextStep == 0 ? ("\(n) 다 컸다!!", "이제 지원서 쓰자") : ("\(n) 신났다!!", "오늘도 같이 크자")
        case .neutral: return ("\(n) 멈췄다!!", "새 기회 한 번만 봐 줘")
        case .annoyed: return ("\(n) 짜증났다!!", nextStep == 0 ? "다 해놓고 지원 안 해?" : "\(nextStep)학년 거 언제 해?")
        case .angry: return ("\(n) 화났다!!", "새 기회 당장 확인해")
        }
    }

    static func load(at date: Date) -> GamjaState {
        let store = UserDefaults(suiteName: sharedGroup)
        let lastOpen = store?.double(forKey: "lastOpen") ?? 0
        guard store?.bool(forKey: "hasProfile") == true, lastOpen > 0 else {
            return GamjaState(ready: false, days: 0, mood: .happy, title: "감자 키우기", sub: "iPhone에서 앱을 열어 줘")
        }
        let realDays = max(0, Int(date.timeIntervalSince1970 - lastOpen) / Int(gamjaDay))
        let days = realDays + (store?.integer(forKey: "demoDays") ?? 0)
        let mood = Mood(days: days)
        // 첫 줄 주어는 사용자 이름이 아니라 늘 "감자" (서비스 이름 감자 키우기에 맞춤)
        let (title, sub) = lines(mood: mood, name: "감자", nextStep: store?.integer(forKey: "nextStep") ?? 1)
        return GamjaState(ready: true, days: days, mood: mood, title: title, sub: sub)
    }
}
