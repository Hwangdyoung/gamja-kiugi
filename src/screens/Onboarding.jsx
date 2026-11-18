import Mascot from '../components/Mascot.jsx';
import ProfileForm from '../components/ProfileForm.jsx';

/* 시작 설정: 처음 온 사람이 3초 안에 "무슨 앱인지" 알게 한다.
   ① 감자가 말을 거는 첫 화면 → ② 이 앱이 해 주는 세 가지 → ③ 안 오면 감자가 화난다 → ④ 세 가지 입력.
   입력은 한 화면에 그대로 둔다(단계를 나누면 시작 설정 완료율이 떨어짐, 기획안 11장). */
const HOW = [
  { no: '01', title: '전공별 4단계 경로', desc: '서포터즈부터 취업까지, 춘천에서 밟을 순서를 보여줘요.' },
  { no: '02', title: '춘천 기회 한 목록', desc: '공고뿐 아니라 공모전·프로젝트·현장실습까지 모았어요.' },
  { no: '03', title: '감자가 챙겨 줘요', desc: '마감 임박이나 오래 안 들어오면 감자가 알려줘요.' },
];

const MOOD_STRIP = [
  { mood: 'happy', label: '오늘' },
  { mood: 'neutral', label: '2일' },
  { mood: 'annoyed', label: '4일' },
  { mood: 'angry', label: '7일' },
];

export default function Onboarding({ nameDraft, onNameDraft, onSubmit }) {
  return (
    <div className="screen onboarding">
      <p className="brand-lg">
        <span className="nm">감자</span> 키우기
      </p>

      <section className="hero">
        <Mascot mood="happy" size={112} />
        <p className="hero-bubble" aria-live="polite">
          {nameDraft ? `${nameDraft}, 같이 춘천에서 커 보자.` : '안녕, 나는 감자. 춘천에서 같이 클래?'}
        </p>
      </section>

      <section className="landing">
        <p className="kicker">YOUR CAREER, IN CHUNCHEON</p>
        <h1 className="headline xl">
          춘천엔 일자리 없다며?
          <br />
          직접 확인해 보세요.
        </h1>
        <p className="lead">전공과 관심 직무만 고르면 춘천에서 갈 수 있는 길과 지금 열린 기회를 보여드려요.</p>
      </section>

      <ol className="how">
        {HOW.map((h) => (
          <li key={h.no}>
            <span className="how-no">{h.no}</span>
            <span>
              <b>{h.title}</b>
              <small>{h.desc}</small>
            </span>
          </li>
        ))}
      </ol>

      <section className="mood-strip" aria-label="앱을 안 열면 감자 표정이 변해요">
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

      <section className="landing-form">
        <p className="kicker">
          <span>START / </span>세 가지만 알려줘
        </p>
        <ProfileForm submitLabel="감자 키우기 시작" onNameDraft={onNameDraft} onSubmit={onSubmit} />
        <p className="fine">로그인 없이 이 기기에만 저장되고, 언제든 설정에서 바꿀 수 있어요.</p>
      </section>
    </div>
  );
}
