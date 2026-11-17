# 내 iPhone에서 감자 위젯 시연하기

웹 앱을 Capacitor로 감싼 iPhone 앱 + 홈 화면 위젯입니다. 앱스토어 등록 없이, 무료 Apple 계정으로 내 iPhone에만 설치합니다.

- 무료 계정으로 설치한 앱은 **7일 뒤 실행이 안 됩니다.** 발표 1~2일 전에 다시 설치하세요(아래 5번만 다시 하면 됨).
- 필요한 것: Mac, Xcode(무료), iPhone, 연결 케이블, Apple ID

## 1. Xcode 준비 (처음 한 번)

1. Mac App Store에서 **Xcode** 설치 (10GB 이상).
2. Xcode를 한 번 열고, 약관 동의 → 추가 구성요소 설치 화면에서 **iOS** 선택.
3. 터미널에서 아래를 실행 (Mac 암호 입력):
   ```sh
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```
4. Xcode 메뉴 **Settings… → Accounts → + → Apple ID**로 로그인.

## 2. iPhone 준비 (처음 한 번)

1. 케이블로 Mac에 연결 → iPhone에서 **이 컴퓨터 신뢰** → 암호 입력.
2. iPhone **설정 → 개인정보 보호 및 보안 → 개발자 모드** 켜기 → 재시동 → 켜기 확인.
   (메뉴가 안 보이면 Xcode에서 iPhone을 한 번 연결한 뒤 다시 보세요.)

## 3. 프로젝트 열기

```sh
npm run build
npx cap sync ios
npx cap open ios
```

## 4. Xcode에서 한 번만 하는 설정

### 4-1. 위젯 타깃 (완료됨)
위젯 타깃 `GamjaWidgetExtension`과 코드(`ios/App/GamjaWidget/`)는 이미 프로젝트에 들어 있습니다.
위젯 최소 iOS는 17.0입니다. Xcode가 "Update to recommended settings"를 권하면 **Cancel**을 누르세요
(최소 iOS가 올라가면 예전 iPhone에 설치가 안 됩니다).

### 4-2. 서명과 App Group (App, GamjaWidget 두 타깃 모두)
왼쪽 파란 **App** 프로젝트 → TARGETS에서 각각 선택 → **Signing & Capabilities** 탭:
1. **Team**: 내 이름 (Personal Team)
2. Bundle Identifier가 이미 쓰인다는 오류가 나면 끝에 글자를 붙여 바꿉니다 (두 타깃 모두 같은 앞부분 유지).
3. **+ Capability → App Groups** → **+** → `group.com.hwangdyoung.gamjakiugi` (두 타깃 모두 같은 이름에 체크)
4. GamjaWidget 타깃 **General → Minimum Deployments**를 내 iPhone의 iOS 버전 이하로.

## 5. 실행

1. Xcode 위쪽에서 스킴 **App**, 기기는 **내 iPhone** 선택 → ▶ (Run)
2. 처음 한 번: iPhone **설정 → 일반 → VPN 및 기기 관리 → (내 Apple ID) → 신뢰**
3. 앱에서 시작 설정을 마칩니다.

## 6. 위젯 붙이고 시연하기

1. 홈 화면 빈 곳을 길게 누르기 → 왼쪽 위 **편집 → 위젯 추가** → **감자 키우기** → 중간 크기 → 추가
2. 앱 오른쪽 위 **톱니(설정) → 시연: 마지막 접속 후 N일** 슬라이더를 4일이나 7일로
3. 홈 화면으로 나가면 위젯 감자가 그 표정으로 바뀝니다.
4. 실제로도 앱을 안 열면 하루가 지날 때마다 위젯이 바뀝니다 (앱을 열면 다시 웃음).

## 7. 미접속 알림과 Apple Watch

- 앱을 처음 열면 알림 허용을 묻습니다 → **허용**.
- 앱은 마지막 접속 후 **2·4·7·14·21·28일째 오전 10시**에 감자 알림을 기기 안에 미리 예약합니다
  (기획안 7장: 표정이 바뀌는 날만, 분노 이후 주 1회, 밤 9시~아침 9시 제외). 서버는 필요 없습니다.
- 앱을 다시 열면 예약을 지우고 그날부터 다시 셉니다. 설정에서 **푸시 알림**을 끄면 예약이 모두 지워집니다.
- **Apple Watch**: 따로 설치할 것이 없습니다. iPhone이 잠겨 있고 워치를 차고 있으면 iOS가 같은 알림을 워치로 넘깁니다.
  (iPhone **Watch 앱 → 알림 → 감자 키우기**가 "iPhone 알림 미러링"이면 됩니다.)

**발표 시연**: 앱 → 톱니 → 시연 슬라이더를 원하는 일수로 → **지금 표정으로 알림 미리 보내기 (10초 뒤)** →
바로 iPhone 화면을 잠그면 10초 뒤 iPhone 잠금 화면과 Apple Watch에 알림이 뜹니다.

## 8. Apple Watch 앱과 워치 페이스 컴플리케이션

iPhone 앱에 워치 앱(`GamjaWatch Watch App`)과 컴플리케이션(`GamjaWatchExtension`, 폴더 `ios/App/GamjaWatch`)이 들어 있습니다.
iPhone에서 ▶로 설치하면 짝지은 Apple Watch에도 워치 앱이 함께 설치됩니다(워치의 Watch 앱 설정에 따라 수동 설치가 필요할 수 있음).

- iPhone 앱이 이름·다음 단계·시연 일수·마지막 접속 시각을 **WatchConnectivity**로 워치에 보냅니다
  (iPhone과 워치는 저장소를 함께 쓰지 못함).
- 워치 앱: 지금 감자 표정과 문구를 보여주고, 받은 값을 워치 저장소에 적어 컴플리케이션을 다시 그립니다.
- 워치 문구는 두 줄: "감자 화났다!!" / "춘천 공고 당장 확인해" (신났다·멈췄다·짜증났다·화났다).
- 컴플리케이션 4종: **동그라미**(감자 얼굴), **직사각형**(감자 + 두 줄 문구 + "N일째 미접속"), **코너**(얼굴 + "N일째"), **인라인**("감자 화났다!! · 7일째").
  iPhone 위젯처럼 8일 치를 미리 예약해 폰을 안 열어도 하루마다 바뀝니다.

**워치 페이스에 붙이기**: 워치 화면을 길게 누르기 → (컴플리케이션 칸이 많은 **모듈** 페이스 추천) **편집** →
옆으로 넘겨 **컴플리케이션** → 칸 선택 → **감자 키우기**.

**발표 시연**: iPhone 앱 → 톱니 → 시연 슬라이더를 7일로 → 몇 초 뒤 워치 페이스의 감자가 화난 얼굴로 바뀝니다.
결과 화면 예: `docs/watch-complication-angry.png`

**주의**: 워치 컴플리케이션 그림은 크기 제한이 있습니다(동그라미 약 112px 이하).
`ios/App/GamjaWatch/Assets.xcassets`의 그림을 바꿀 때는 작게 유지하세요: 동그라미 `face_*` 100×100(한도 약 112), 코너 `corner_*` 80×80(한도 약 86), 직사각형 `potato_*` 104×120.
너무 크면 컴플리케이션이 회색 자리표시로만 보입니다.

## 구조

| 파일 | 역할 |
| --- | --- |
| `capacitor.config.json` | 앱 이름·번들 ID·웹 빌드 폴더 |
| `ios/App/App/AppDelegate.swift` | `WidgetBridgePlugin`: 웹 → App Group 저장소(이름·다음 단계·시연 일수·마지막 접속 시각) → 위젯 새로고침. `GamjaNotifications`: 미접속 알림 예약·시연용 알림 |
| `ios/App/App/SceneDelegate.swift` | 플러그인을 등록하는 `MainViewController`로 앱 화면을 띄움 |
| `src/lib/notify.js` | 알림 규칙과 4주 치 예약 목록(`notificationSchedule`) |
| `ios/App/GamjaWatch Watch App/` | 워치 앱: iPhone에서 상태 받기(`WatchDelegate`), 감자 화면 |
| `ios/App/GamjaWatch/` | 워치 컴플리케이션 4종(`GamjaWatchWidget.swift`) |
| `GamjaState.swift` (두 워치 폴더에 같은 파일) | 워치용 표정·문구 계산. 고칠 때 둘 다 고침 |
| `src/lib/nativeWidget.js` | 웹에서 위 플러그인 호출 (iPhone 앱일 때만) |
| `ios/App/GamjaWidget/GamjaWidget.swift` | 위젯: 미접속 일수 계산, 표정·문구, 8일 치 장면 미리 예약 |
| `ios/App/GamjaWidget/Assets.xcassets` | 위젯용 감자 그림 4장 |

## 안 될 때

- **위젯이 계속 "앱을 열고 시작 설정을 해 줘."** → App Group 이름이 두 타깃에서 같은지, 둘 다 체크됐는지 확인.
- **무료 계정이 App Groups를 거부** → Claude에게 알려 주세요. 위젯 안에서 날짜를 넘기는 시연 버튼 방식으로 바꿀 수 있습니다.
- **"Untrusted Developer"** → 5-2번 신뢰 설정.
- **7일 뒤 앱이 안 열림** → 무료 계정 제한. 5번을 다시 하면 됩니다.
