/* 화면 머리: 번호 붙은 영문 소제목 + B급 큰 제목 + 건조한 설명
   (기획안 4장: 관심을 끄는 곳에만 B급, 정보는 정확하고 건조하게) */
export default function PageHead({ no, en, title, lead }) {
  return (
    <header className="page-head">
      <p className="kicker">
        {no && <span>{no} / </span>}
        {en}
      </p>
      <h1 className="headline">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}
