import Mascot from '../components/Mascot.jsx';
import ProfileForm from '../components/ProfileForm.jsx';

/* 시작 설정: 랜딩 문구 → 세 가지 입력. 입력한 이름이 바로 앱 이름(○○ 자리)에 들어간다 */
export default function Onboarding({ logoName, onNameDraft, onSubmit }) {
  return (
    <div className="screen onboarding">
      <p className="brand-lg">
        <span className="nm">{logoName}</span> 키우기
      </p>

      <section className="landing">
        <p className="kicker">YOUR CAREER, IN CHUNCHEON</p>
        <h1 className="headline xl">
          춘천엔 일자리 없다며?
          <br />
          직접 확인해 보세요.
        </h1>
        <p className="lead">전공과 관심 직무만 고르면 춘천에서 갈 수 있는 4단계 경로와 기회를 보여드려요.</p>
        <div className="landing-char">
          <Mascot mood="happy" size={64} />
          <p>
            <b>“{logoName === '○○' ? '이름부터 알려줘.' : `${logoName}, 같이 춘천에서 커 보자.`}”</b>
            <small>이름을 넣으면 앱 이름이 바뀌어요.</small>
          </p>
        </div>
      </section>

      <section className="landing-form">
        <p className="kicker">
          <span>01 / </span>START
        </p>
        <ProfileForm submitLabel="내 경로 만들기" onNameDraft={onNameDraft} onSubmit={onSubmit} />
        <p className="fine">입력은 세 가지뿐이에요. 로그인 없이 이 기기에만 저장되고, 언제든 설정에서 바꿀 수 있어요.</p>
      </section>
    </div>
  );
}
