/* 커뮤니티 예시 글 (11/23)
   처음 들어온 사람이 빈 게시판을 보지 않도록, 글이 적은 게시판에 "예시" 표시를 달아 보여 준다.
   서버(Supabase)에 넣지 않은 앱 안 글이라 공감·댓글·신고는 안 되고, 실제 사람이 쓴 글처럼 보이지 않게 늘 "예시"로 표시한다.
   특정 기관·사람에 대한 평가는 넣지 않았다. */

const A = (school, major, grade) => ({ school, major, grade });
const C = (body, author) => ({ body, author });

export const EXAMPLE_POSTS = [
  {
    id: 'ex-advice-1',
    board: 'advice',
    title: '1학년 때 공고 3개만 읽어 둬도 3학년이 편해요',
    body: '저는 3학년 2학기에 처음 채용 공고를 열어 봤는데, 원하는 직무가 요구하는 게 생각보다 구체적이더라고요(툴, 자격증, 포트폴리오 형식). 1학년 때 관심 직무 공고 3개만 읽고 자주 나오는 단어를 적어 두면, 2~3학년에 뭘 해야 할지 훨씬 덜 헤매요. 로드맵 1학년 할 일에 있는 그거 맞아요.',
    author: A('한림대학교', 'dmc', 4),
    like_count: 24,
    comments: [C('공고를 어디서 찾는지도 알려 주세요!', A('강원대학교', 'dmc', 1)), C('기회 탭이랑 나라일터·워크넷 같은 데서 직무 이름으로 검색해 보세요. 지역은 상관없어요.', A('한림대학교', 'dmc', 4))],
  },
  {
    id: 'ex-advice-2',
    board: 'advice',
    title: '포트폴리오, 처음부터 거창하지 않아도 돼요',
    body: '학교 과제로 만든 보고서 하나, 공모전에 냈던 기획서 하나도 충분히 시작점이 돼요. 중요한 건 "무엇을 했고, 내가 맡은 부분은 뭐였고, 결과가 어땠는지"를 한 줄씩이라도 남겨 두는 거예요. 나중에 이력서 쓸 때 그 한 줄이 제일 아쉬웠어요.',
    author: A('강원대학교', 'biz', 4),
    like_count: 17,
    comments: [C('기록 남기기 미루고 있었는데 오늘 하나 써야겠어요.', A('한림대학교', 'social', 2))],
  },
  {
    id: 'ex-question-1',
    board: 'question',
    title: '서포터즈 처음인데 SNS 팔로워가 적어도 괜찮을까요?',
    body: '기관 SNS 서포터즈에 지원해 보고 싶은데 제 인스타 팔로워가 100명도 안 돼요. 보통 팔로워 수를 많이 보나요? 아니면 콘텐츠 기획을 더 보나요?',
    author: A('강원대학교', 'dmc', 1),
    like_count: 6,
    comments: [C('모집 공고마다 달라서 자격 요건을 꼭 확인해 보세요. 요건에 없으면 기획안이나 예시 콘텐츠를 성의 있게 준비하는 게 더 중요했어요.', A('한림대학교', 'dmc', 3))],
  },
  {
    id: 'ex-question-2',
    board: 'question',
    title: '학부연구생은 몇 학년부터 연락드리는 게 좋아요?',
    body: '실험 쪽 진로를 생각 중이라 학부연구생을 해 보고 싶은데, 2학년이 연락드리기엔 너무 이른가요? 메일에는 뭘 적어야 할지도 모르겠어요.',
    author: A('강원대학교', 'bio', 2),
    like_count: 9,
    comments: [C('연구실마다 달라서 학과 공지부터 확인해 보고, 관심 있는 연구 주제와 들은 과목, 가능한 시간을 짧게 적어서 보내면 돼요.', A('강원대학교', 'bio', 4))],
  },
  {
    id: 'ex-review-1',
    board: 'review',
    title: '지역 기관 SNS 서포터즈 한 학기 해 본 후기',
    body: '한 달에 콘텐츠 2~3개 정도 만들었어요. 처음엔 사진만 올리면 되는 줄 알았는데 기획안 쓰고, 피드백 받고, 고치는 과정이 진짜 실무 연습이었어요. 끝나고 만든 콘텐츠를 모아서 포트폴리오 첫 장으로 썼어요. 로드맵에 한 줄씩 기록해 둔 게 도움이 많이 됐어요.',
    author: A('한림대학교', 'dmc', 3),
    like_count: 15,
    comments: [C('활동하면서 수업이랑 병행하기 힘들진 않았나요?', A('한림성심대학교', 'dmc', 1)), C('시험 기간엔 미리 만들어 두면 괜찮았어요!', A('한림대학교', 'dmc', 3))],
  },
  {
    id: 'ex-review-2',
    board: 'review',
    title: '겨울방학 현장실습 다녀온 이야기',
    body: '4주 동안 현장에서 일해 보니 수업에서 배운 것과 실제로 쓰는 게 어떻게 다른지 감이 왔어요. 실습 끝나는 날 담당자분께 "어떤 걸 더 준비하면 좋을지" 물어본 게 제일 잘한 일 같아요. 신청은 학교 현장실습 공지를 꼭 챙겨 보세요.',
    author: A('강원대학교', 'eng', 3),
    like_count: 11,
    comments: [],
  },
  {
    id: 'ex-free-1',
    board: 'free',
    title: '같이 공모전 나갈 사람은 어디서 구해요?',
    body: '기획 공모전 하나 나가 보고 싶은데 혼자는 자신이 없어서요. 다들 팀원은 어떻게 구하세요? 과 단톡방 말고 다른 방법이 있을까요?',
    author: A('한림대학교', 'it', 2),
    like_count: 4,
    comments: [C('학교 비교과 프로그램에서 만난 사람들이랑 팀 꾸린 적 있어요. 여기 질문 게시판에 올려 봐도 좋을 듯!', A('강원대학교', 'biz', 3))],
  },
  {
    id: 'ex-free-2',
    board: 'free',
    title: '시험 기간이라 감자가 화났어요',
    body: '일주일 동안 앱을 못 열었더니 감자가 빨개져 있네요… 시험 끝나면 물이랑 거름 잔뜩 줄게.',
    author: A('한림성심대학교', 'health', 2),
    like_count: 21,
    comments: [C('ㅋㅋㅋ 저도 짜증 표정 보고 바로 들어왔어요', A('송곡대학교', 'arts', 1))],
  },
];

/* 글이 이만큼보다 적은 게시판에만 예시를 보여 준다 */
export const EXAMPLE_UNDER = 3;

/* 지금 보는 게시판·계열 거르기에 맞는 예시. 전체 탭이면 게시판마다 하나씩 */
export function examplesFor({ board = 'all', major = null } = {}) {
  let list = EXAMPLE_POSTS.filter((p) => (board === 'all' ? true : p.board === board));
  if (major) list = list.filter((p) => p.author.major === major);
  if (board === 'all') list = list.filter((p, i, a) => a.findIndex((q) => q.board === p.board) === i);
  return list;
}

export const exampleById = (id) => EXAMPLE_POSTS.find((p) => p.id === id) ?? null;
