// 감자 키우기 홈 화면 위젯
// - 앱(웹 화면)이 App Group 저장소에 남긴 "마지막 접속 시각"으로 미접속 일수를 계산한다.
// - 앱이 꺼져 있어도 앞으로 8일 치 장면을 미리 만들어 두어, 날이 지날 때마다 표정이 바뀐다.
// - 시연 도구의 슬라이더 값(demoDays)을 더해, 발표에서 며칠 뒤 모습을 바로 보여줄 수 있다.

import WidgetKit
import SwiftUI

/// 앱과 같은 App Group. Xcode의 App Groups 설정과 똑같아야 한다.
private let appGroup = "group.com.hwangdyoung.gamjakiugi"
private let day: TimeInterval = 86_400

// MARK: - 표정과 문구 (웹 앱 src/lib/growth.js와 같은 규칙)

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

    var color: Color {
        switch self {
        case .happy: return Color(red: 0.12, green: 0.62, blue: 0.36)
        case .neutral: return Color(red: 0.36, green: 0.40, blue: 0.47)
        case .annoyed: return Color(red: 0.77, green: 0.42, blue: 0.07)
        case .angry: return Color(red: 0.82, green: 0.25, blue: 0.17)
        }
    }
}

/// 받침이 있으면 첫 번째, 없으면 두 번째 조사. 한글이 아니면 "이(가)"처럼 둘 다.
private func josa(_ name: String, _ withBatchim: String, _ without: String) -> String {
    guard let scalar = name.unicodeScalars.last, (0xAC00...0xD7A3).contains(scalar.value) else {
        return "\(withBatchim)(\(without))"
    }
    return (scalar.value - 0xAC00) % 28 != 0 ? withBatchim : without
}

private func message(mood: Mood, name: String, nextStep: Int) -> String {
    // 주어는 사용자 이름이 아니라 늘 "감자" (웹 src/lib/growth.js, 워치와 같음)
    let n = "감자"
    let i = josa(n, "이", "가")
    let allDone = nextStep == 0
    switch mood {
    case .happy:
        return allDone ? "축하해! \(n)\(josa(n, "은", "는")) 4단계를 다 마쳤어." : "\(n)\(i) 오늘도 성장 중!"
    case .neutral:
        return "\(n)\(i) 멈춰 있어요."
    case .annoyed:
        return allDone ? "4단계까지 와놓고 여기서 멈출 거야?" : "\(nextStep)단계 아직이야? 이대로 졸업할 거야?"
    case .angry:
        return "\(n)\(i) 화났다. 새 기회 확인하러 와."
    }
}

// MARK: - 타임라인

struct GamjaEntry: TimelineEntry {
    let date: Date
    let days: Int
    let mood: Mood
    let message: String
    let ready: Bool   // 앱에서 시작 설정을 마쳤는지
}

struct GamjaProvider: TimelineProvider {
    private func entry(at date: Date) -> GamjaEntry {
        let store = UserDefaults(suiteName: appGroup)
        let ready = store?.bool(forKey: "hasProfile") ?? false
        let lastOpen = store?.double(forKey: "lastOpen") ?? 0
        guard ready, lastOpen > 0 else {
            return GamjaEntry(date: date, days: 0, mood: .happy, message: "앱을 열고 시작 설정을 해 줘.", ready: false)
        }
        let realDays = max(0, Int(date.timeIntervalSince1970 - lastOpen) / Int(day))
        let days = realDays + (store?.integer(forKey: "demoDays") ?? 0)
        let mood = Mood(days: days)
        let text = message(mood: mood, name: store?.string(forKey: "name") ?? "", nextStep: store?.integer(forKey: "nextStep") ?? 1)
        return GamjaEntry(date: date, days: days, mood: mood, message: text, ready: true)
    }

    func placeholder(in context: Context) -> GamjaEntry {
        GamjaEntry(date: .now, days: 0, mood: .happy, message: "감자가 오늘도 성장 중!", ready: true)
    }

    func getSnapshot(in context: Context, completion: @escaping (GamjaEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : entry(at: .now))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GamjaEntry>) -> Void) {
        let now = Date()
        var entries = [entry(at: now)]
        // 마지막 접속 시각 기준으로 하루가 지날 때마다 장면을 하나씩 미리 만든다 (8일 치)
        let lastOpen = UserDefaults(suiteName: appGroup)?.double(forKey: "lastOpen") ?? 0
        if lastOpen > 0 {
            for n in 1...8 {
                let date = Date(timeIntervalSince1970: lastOpen + Double(n) * day)
                if date > now { entries.append(entry(at: date)) }
            }
        }
        completion(Timeline(entries: entries, policy: .after(entries.last!.date.addingTimeInterval(day))))
    }
}

// MARK: - 화면

struct GamjaWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: GamjaEntry

    private var meta: String {
        guard entry.ready else { return "시작 전" }
        return entry.days == 0 ? "오늘 접속했어요" : "\(entry.days)일째 미접속"
    }

    var body: some View {
        switch family {
        case .systemSmall: small
        default: medium
        }
    }

    private var status: some View {
        HStack(spacing: 5) {
            Circle().fill(entry.mood.color).frame(width: 7, height: 7)
            Text(meta).font(.system(size: 12, weight: .bold)).foregroundStyle(entry.mood.color)
        }
    }

    private var medium: some View {
        HStack(spacing: 10) {
            Image(entry.mood.imageName)
                .resizable()
                .scaledToFit()
                .frame(width: 118)
            VStack(alignment: .leading, spacing: 6) {
                Text("감자 키우기")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)
                Text(entry.message)
                    .font(.system(size: 17, weight: .heavy))
                    .foregroundStyle(Color(red: 0.11, green: 0.14, blue: 0.2))
                    .lineLimit(3)
                    .minimumScaleFactor(0.8)
                Spacer(minLength: 0)
                status
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.vertical, 4)
    }

    private var small: some View {
        VStack(spacing: 4) {
            Image(entry.mood.imageName)
                .resizable()
                .scaledToFit()
                .frame(maxHeight: .infinity)
            status
        }
    }
}

// MARK: - 위젯 등록

struct GamjaWidget: Widget {
    let kind = "GamjaWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GamjaProvider()) { entry in
            if #available(iOS 17.0, *) {
                GamjaWidgetView(entry: entry)
                    .containerBackground(.white, for: .widget)
            } else {
                GamjaWidgetView(entry: entry)
                    .padding()
                    .background(Color.white)
            }
        }
        .configurationDisplayName("감자 키우기")
        .description("앱을 안 열수록 감자가 화를 내요.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct GamjaWidgetBundle: WidgetBundle {
    var body: some Widget {
        GamjaWidget()
    }
}
