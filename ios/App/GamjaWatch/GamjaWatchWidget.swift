// 감자 키우기 워치 페이스 컴플리케이션 (WidgetKit, watchOS)
// - 동그라미: 감자 얼굴
// - 직사각형: 감자 + 문구 + "N일째 미접속"
// - 코너: 감자 얼굴 + 일수
// - 인라인: "감자 7일째 기다림"
// 마지막 접속 시각 기준으로 8일 치 장면을 미리 예약해, 폰을 안 열어도 하루마다 바뀐다.

import WidgetKit
import SwiftUI

struct GamjaWatchEntry: TimelineEntry {
    let date: Date
    let state: GamjaState
}

struct GamjaWatchProvider: TimelineProvider {
    func placeholder(in context: Context) -> GamjaWatchEntry {
        GamjaWatchEntry(date: .now, state: GamjaState(ready: true, days: 0, mood: .happy, message: "하늘이 오늘도 성장 중!", short: "감자 웃는 중"))
    }

    func getSnapshot(in context: Context, completion: @escaping (GamjaWatchEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : GamjaWatchEntry(date: .now, state: .load(at: .now)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GamjaWatchEntry>) -> Void) {
        let now = Date()
        var entries = [GamjaWatchEntry(date: now, state: .load(at: now))]
        let lastOpen = GamjaState.lastOpen()
        if lastOpen > 0 {
            for n in 1...8 {
                let date = Date(timeIntervalSince1970: lastOpen + Double(n) * gamjaDay)
                if date > now { entries.append(GamjaWatchEntry(date: date, state: .load(at: date))) }
            }
        }
        completion(Timeline(entries: entries, policy: .after(entries.last!.date.addingTimeInterval(gamjaDay))))
    }
}

struct GamjaWatchWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: GamjaWatchEntry

    var body: some View {
        let s = entry.state
        switch family {
        case .accessoryCircular:
            Image(s.mood.faceName)
                .resizable()
                .scaledToFit()
                .widgetAccentable(false)
        case .accessoryCorner:
            Image(s.mood.faceName)
                .resizable()
                .scaledToFit()
                .widgetLabel(s.ready ? (s.days == 0 ? "웃는 중" : "\(s.days)일째") : "감자")
        case .accessoryInline:
            Text(s.short)
        default: // accessoryRectangular
            HStack(spacing: 6) {
                Image(s.mood.imageName)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 42)
                VStack(alignment: .leading, spacing: 1) {
                    Text(s.message)
                        .font(.system(size: 13, weight: .bold))
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                    Text(s.meta)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(s.mood.color)
                }
                Spacer(minLength: 0)
            }
        }
    }
}

@main
struct GamjaWatchWidget: Widget {
    let kind = "GamjaWatchWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GamjaWatchProvider()) { entry in
            GamjaWatchWidgetView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("감자 키우기")
        .description("앱을 안 열수록 감자가 화를 내요.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryCorner, .accessoryInline])
    }
}
