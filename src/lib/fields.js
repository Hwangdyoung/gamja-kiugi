/* 학과 이름 → 계열
   춘천의 대학마다 같은 공부를 하는 학과도 이름이 다르다(디지털미디어콘텐츠 / 미디어커뮤니케이션 / 영상문화 …).
   그래서 경로와 기회는 "계열" 단위로 만들고, 사용자가 쓴 학과 이름의 낱말로 계열을 찾아 준다.
   - 맞는 계열이 있으면 자동으로 고르고, 사용자가 바꿀 수 있다.
   - 아직 경로를 만들지 않은 계열이면 "준비 중"이라고 알려 주고 가까운 계열을 고르게 한다. */

export const SCHOOLS = ['강원대학교', '한림대학교', '춘천교육대학교', '한림성심대학교', '송곡대학교', '기타'];

/* 계열: id가 MAJORS의 key와 같으면 경로가 준비된 계열 */
export const FIELDS = [
  {
    id: 'dmc',
    label: '미디어·콘텐츠',
    words: ['미디어', '콘텐츠', '컨텐츠', '영상', '방송', '언론', '신문', '광고', '홍보', '커뮤니케이션', '디자인', '애니메이션', '문화', '저널리즘', '디지털'],
  },
  {
    id: 'bio',
    label: '바이오·의생명',
    words: ['바이오', '생명', '의생명', '생물', '약학', '제약', '의약', '식품', '보건', '임상', '생화학', '의공', '메디컬', '분자', '의료', '화학생명'],
  },
  { id: 'it', label: 'IT·소프트웨어', words: ['컴퓨터', '소프트웨어', '정보', '데이터', '인공지능', 'AI', '전자', '통신', '프로그래밍'] },
  { id: 'biz', label: '경영·경제', words: ['경영', '경제', '회계', '무역', '금융', '관광', '마케팅', '세무'] },
  { id: 'edu', label: '교육', words: ['교육', '유아', '초등'] },
  { id: 'social', label: '인문·사회', words: ['사회', '행정', '정치', '심리', '국어', '영어', '사학', '철학', '법'] },
];

export const fieldOf = (id) => FIELDS.find((f) => f.id === id);
export const isReady = (id, majors) => !!majors[id];

/* 학과 이름에 들어 있는 낱말로 계열을 고른다. 여러 계열에 걸리면 가장 긴 낱말이 맞은 쪽 */
export function guessField(dept) {
  const q = (dept || '').replace(/\s/g, '');
  if (q.length < 2) return null;
  let best = null;
  let bestLen = 0;
  for (const f of FIELDS) {
    for (const w of f.words) {
      if (q.toLowerCase().includes(w.toLowerCase()) && w.length > bestLen) {
        best = f.id;
        bestLen = w.length;
      }
    }
  }
  return best;
}
