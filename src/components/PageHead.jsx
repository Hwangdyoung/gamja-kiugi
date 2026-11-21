/* 화면 머리: 큰 제목(감자 목소리 글꼴) + 건조한 설명 한 줄.
   영문 소제목·번호는 두지 않는다. 제목이 혼자 말하게. */
export default function PageHead({ title, lead }) {
  return (
    <header className="page-head">
      <h1 className="headline">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}
