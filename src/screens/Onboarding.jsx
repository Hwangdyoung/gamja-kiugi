import { useEffect, useRef, useState } from "react";
import Mascot from "../components/Mascot.jsx";
import ProfileForm from "../components/ProfileForm.jsx";
import { BagIcon, DropIcon, PathIcon } from "../components/Icons.jsx";

/* 시작 설정: 처음 온 사람이 3초 안에 "무슨 앱인지" 알게 한다.
   ① 감자가 말을 거는 첫 화면 → ② 이 앱이 해 주는 세 가지 → ③ 안 오면 감자가 화난다 → ④ 세 가지 입력.
   1쪽: 소개(감자·앱이 하는 일·표정 변화) → "시작하기" → 2쪽: 나를 알려줘(이름·학교·계열·직무). */
const HOW = [
  {
    Icon: PathIcon,
    title: "학년별 로드맵",
    desc: "1학년 탐색부터 4학년 지원까지, 지금 학년에 할 일을 골라 줘요. 끝낸 일은 한 줄씩 기록해요.",
  },
  {
    Icon: BagIcon,
    title: "지금 할 수 있는 기회 한 목록",
    desc: "춘천에서 하는 활동에, 춘천에서도 온라인으로 할 수 있는 공모전·기자단까지 모았어요.",
  },
  {
    Icon: DropIcon,
    title: "감자가 챙겨 줘요",
    desc: "마감 임박이나 오래 안 들어오면 감자가 알려줘요.",
  },
];

const MOOD_STRIP = [
  { mood: "happy", label: "오늘" },
  { mood: "neutral", label: "2일" },
  { mood: "annoyed", label: "4일" },
  { mood: "angry", label: "7일" },
];

export default function Onboarding({
  nameDraft,
  onNameDraft,
  onSubmit,
  signedIn = false,
}) {
  const [page, setPage] = useState("intro");
  const top = useRef(null);
  // 쪽을 넘기면 맨 위부터 보여준다
  useEffect(() => {
    top.current?.closest(".content")?.scrollTo?.(0, 0);
  }, [page]);

  if (page === "form") {
    return (
      <div className="screen onboarding" ref={top}>
        <button
          type="button"
          className="link back-link"
          onClick={() => setPage("intro")}
        >
          ← 처음으로
        </button>
        <section className="hero">
          <Mascot mood="happy" size={96} />
          <p className="hero-bubble" aria-live="polite">
            {nameDraft
              ? `${nameDraft}, 춘천에서도 같이 커 보자.`
              : "이름부터 알려줘. 내가 불러 줄게."}
          </p>
        </section>
        <section className="landing-form">
          <h1 className="headline">나를 알려줘</h1>
          <ProfileForm
            submitLabel="감자 키우기 시작"
            onNameDraft={onNameDraft}
            onSubmit={onSubmit}
          />
          <p className="fine">
            {signedIn
              ? "내 계정에 저장되고, 언제든 설정에서 바꿀 수 있어요."
              : "이 기기에 저장되고, 언제든 설정에서 바꿀 수 있어요."}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="screen onboarding" ref={top}>
      <p className="brand-lg">
        <span className="nm">감자</span> 키우기
      </p>

      <section className="hero">
        <Mascot mood="happy" size={112} />
        <p className="hero-bubble" aria-live="polite">
          안녕, 나는 감자. 춘천에 있는 동안 같이 클래?
        </p>
      </section>

      <section className="landing">
        <h1 className="headline xl">
          춘천이라 할 게 없다며?
          <br />
          전공 경험, 여기서도 쌓여요.
        </h1>
        <p className="lead">
          학년과 계열, 관심 직무만 고르면 학교 다니는 동안 할 일과 지금 열린
          기회를 보여드려요. 남긴 기록은 어디에 지원하든 써요.
        </p>
      </section>

      <ol className="how">
        {HOW.map((h) => (
          <li key={h.title}>
            <span className="how-icon" aria-hidden="true">
              <h.Icon size={20} />
            </span>
            <span>
              <b>{h.title}</b>
              <small>{h.desc}</small>
            </span>
          </li>
        ))}
      </ol>

      <section
        className="mood-strip"
        aria-label="앱을 안 열면 감자 표정이 변해요"
      >
        <div className="mood-row">
          {MOOD_STRIP.map((m) => (
            <figure key={m.mood}>
              <Mascot mood={m.mood} size={44} />
              <figcaption>{m.label}</figcaption>
            </figure>
          ))}
        </div>
        <p>
          <b>안 들어오면 감자가 화나요.</b>
          <small>홈 화면 위젯과 Apple Watch에서도 표정이 바뀌어요.</small>
        </p>
      </section>

      <button
        type="button"
        className="btn primary block"
        onClick={() => setPage("form")}
      >
        시작하기
      </button>
    </div>
  );
}
