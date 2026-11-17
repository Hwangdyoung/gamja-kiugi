// 워치 앱과 워치 컴플리케이션이 함께 쓰는 감자 상태 계산
// (같은 파일이 GamjaWatch, GamjaWatchWidget 두 폴더에 들어 있다. 고칠 때는 둘 다 고친다.)
// 규칙은 웹 앱 src/lib/growth.js, iPhone 위젯 GamjaWidget.swift와 같다.

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

private func josa(_ name: String, _ withBatchim: String, _ without: String) -> String {
    guard let scalar = name.unicodeScalars.last, (0xAC00...0xD7A3).contains(scalar.value) else {
        return "\(withBatchim)(\(without))"
    }
    return (scalar.value - 0xAC00) % 28 != 0 ? withBatchim : without
}

struct GamjaState {
    let ready: Bool
    let days: Int
    let mood: Mood
    let message: String
    /// 짧은 문구 (인라인·코너 컴플리케이션)
    let short: String

    var meta: String {
        guard ready else { return "iPhone에서 시작해 줘" }
        return days == 0 ? "오늘 접속했어요" : "\(days)일째 미접속"
    }

    static func lastOpen() -> Double {
        UserDefaults(suiteName: sharedGroup)?.double(forKey: "lastOpen") ?? 0
    }

    static func load(at date: Date) -> GamjaState {
        let store = UserDefaults(suiteName: sharedGroup)
        let lastOpen = store?.double(forKey: "lastOpen") ?? 0
        guard store?.bool(forKey: "hasProfile") == true, lastOpen > 0 else {
            return GamjaState(ready: false, days: 0, mood: .happy, message: "iPhone에서 감자 키우기를 열어 줘.", short: "감자 키우기")
        }
        let realDays = max(0, Int(date.timeIntervalSince1970 - lastOpen) / Int(gamjaDay))
        let days = realDays + (store?.integer(forKey: "demoDays") ?? 0)
        let mood = Mood(days: days)
        let raw = store?.string(forKey: "name") ?? ""
        let n = raw.isEmpty ? "감자" : raw
        let i = josa(n, "이", "가")
        let nextStep = store?.integer(forKey: "nextStep") ?? 1
        let message: String
        switch mood {
        case .happy: message = nextStep == 0 ? "4단계 다 마쳤어!" : "\(n)\(i) 오늘도 성장 중!"
        case .neutral: message = "\(n)\(i) 멈춰 있어요."
        case .annoyed: message = nextStep == 0 ? "4단계까지 와놓고 서울 갈 거야?" : "\(nextStep)단계 아직이야? 서울 갈 거야?"
        case .angry: message = "\(n)\(i) 화났다. 춘천 공고 확인하러 와."
        }
        let short = days == 0 ? "감자 웃는 중" : "감자 \(days)일째 기다림"
        return GamjaState(ready: true, days: days, mood: mood, message: message, short: short)
    }
}
