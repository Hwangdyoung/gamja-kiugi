/* 전공·직무별 4단계 성장 경로와 춘천 기회
   - 기회는 2026.11.18에 웹에서 조사한 실제 기관·프로그램이다. 각 기회에 원문 링크(src)를 단다.
   - due: 지금 모집 중이면 마감일('YYYY-MM-DD'), 아니면 null.
   - when: 매년·매 학기 돌아오는 프로그램은 지난 모집 일정을 적어 다음 모집 시기를 가늠하게 한다.
   - 지원 전에는 반드시 원문에서 일정을 다시 확인해야 한다(앱 화면에도 안내). 주 1회 다시 조사해 갱신한다(기획안 8장). */
// 기획안 5장: 기회 목록의 유형 칩
export const TYPES = ['서포터즈', '공모전', '프로젝트', '인턴', '현장실습', '취업'];

// 기획안 5장 P1 빠른 필터
export const GROUPS = {
  job: ['인턴', '현장실습', '취업'],
  exp: ['서포터즈', '공모전', '프로젝트'],
};

export const RESEARCHED_AT = '2026.11.18';

const o = (t, type, org, due, target, src, when = null) => ({ t, type, org, due, target, src, when });

// ---- 조사한 실제 기회 (출처는 각 src) ----
const SNS_CONTEST = o('2026 춘천여행 SNS 공모전', '공모전', '춘천시', '2026-11-20', '누구나 (유튜브·인스타그램·블로그)',
  'https://linkareer.com/activity/310916');
const DICA_CONTEST = o('2026 춘천 디카시 공모전', '공모전', '춘천 디카시 공모전 운영처', '2026-08-31', '누구나',
  'https://ilovecontest.com/bbs/board.php?bo_table=contest&wr_id=5523');
const MIME_CALL = o('춘천마임축제 국내참가작 공모', '공모전', '춘천마임축제', null, '누구나 (공연 팀)',
  'https://www.contestkorea.com/sub/view.php?int_gbn=1&Txt_bcode=031810001&str_no=202512090032',
  '매년 11월~1월 접수 (지난 공모 11.1~1.5)');
const TALENT_SUPPORTERS = o('춘천인재육성장학재단 서포터즈', '서포터즈', '(재)춘천인재육성장학재단', null, '춘천시에 주소를 둔 대학(원)생 10명 내외',
  'https://biz.kangwon.ac.kr/biz/community/notice.do?mode=view&articleNo=563635',
  '매년 6월 모집 (2026년 6.8~6.22, 활동 7~12월)');
const RISE_SUPPORTERS = o('강원대 RISE(앵커)사업단 대학생 서포터즈', '서포터즈', '강원대학교 RISE사업단', null, '강원대 춘천캠퍼스 재학생 약 10명',
  'https://scphys.kangwon.ac.kr/physics/community/notice.do?mode=view&articleNo=564581',
  '2026년 2기 6.22~7.3 모집');
const WORK_EXP = o('미래내일 일경험 사업 (프로젝트형)', '인턴', '강원대학교 산학협력단 미래내일 일경험 사업단', null, '만 15~34세 미취업 청년 (재학생 가능)',
  'https://www.economicpost.co.kr/177778',
  '상·하반기 모집 (2026 하반기 ~9.6)');
const WORK24_CC = o('고용24 청년 일경험 · 춘천 공고', '인턴', '고용노동부 고용24', null, '청년',
  'https://yw.work24.go.kr/search?query=%EC%B6%98%EC%B2%9C',
  '수시로 올라오는 춘천 일경험 공고 목록');
const CCCF_JOBS = o('춘천문화재단 채용', '취업', '춘천문화재단', null, '공고별 상이',
  'https://www.cccf.or.kr/home/community/job',
  '수시 채용 (2026년 2차 4.16~4.20 등)');
const GICA_JOBS = o('강원정보문화산업진흥원 채용', '취업', '강원정보문화산업진흥원', null, '공고별 상이',
  'https://www.gica.or.kr/Home/H40000/H40300/boardList',
  '수시 공개채용 (2026년 2차 5.15~5.25 등)');
const KNU_WINTER_FIELD = o('강원대 동계 현장실습학기제', '현장실습', '강원대학교 대학일자리플러스센터', null, '강원대 재학생',
  'https://internship.kangwon.ac.kr/',
  '2026 동계 12.22~2.21 진행 · 신청은 현장실습 시스템 공지 확인');
const PLANT_INTERN = o('진로탐색 인턴십', '인턴', '강원대 식물의학전공', null, '강원대 재학생',
  'https://plantmedicine.kangwon.ac.kr/applybio/community/under-notice.do?mode=view&articleNo=560753',
  '매년 초 모집 (2026년 1차 ~2월)');
const BIO_DEPT = o('학과 연구실 학부연구생', '프로젝트', '강원대 생명건강공학과', null, '재학생',
  'https://bio-health.kangwon.ac.kr/bio-health/index.do',
  '연구실별 수시 모집 · 학과 공지 확인');
const BIO_JOB_TALK = o('바이오 분야 직무 상담 (휴젤·바디텍메드 등)', '프로젝트', '강원대 생명건강공학과', null, '재학생',
  'https://bio-health.kangwon.ac.kr/bio-health/index.do',
  '학기마다 열림 · 학과 공지 확인');
const BIO_MATCHING = o('바이오 분야 기업면접 매칭데이', '취업', '이노비즈협회 강원지회 (강원형 미래인력 양성사업)', null, '바이오·식품 분야 구직 청년',
  'https://www.kwnews.co.kr/article/20261112501216',
  '2026.11.12 춘천ICT벤처센터 개최 · 도내 13개사 참여');
const CBF_JOBS = o('춘천바이오산업진흥원 공개채용', '취업', '(재)춘천바이오산업진흥원', null, '공고별 상이 (연구개발 원급 등)',
  'https://www.cbf.or.kr/main.php',
  '수시 공개채용 (2026년 4차 9.30 공고)');
const HUGEL_JOBS = o('휴젤 춘천 거두공장 품질관리 채용', '취업', '휴젤(주)', null, '이공계 학사 이상 신입·경력',
  'https://www.saramin.co.kr/zf_user/company-info/view-inner-recruit/csn/QnNLM001SFRBWGk1ODlCcHd4NlNTUT09/company_nm/%ED%9C%B4%EC%A0%A4(%EC%A3%BC)',
  '수시 채용 (QC 이화학·미생물시험 등)');
const EUBIO_JOBS = o('유바이오로직스 채용', '취업', '(주)유바이오로직스', null, '신입·경력 (품질·생산·연구)',
  'https://www.saramin.co.kr/zf_user/company-info/view-inner-recruit/csn/RVVzNTRkekV1dVc3S2pKVDd0TTcwUT09/company_nm/(%EC%A3%BC)%EC%9C%A0%EB%B0%94%EC%9D%B4%EC%98%A4%EB%A1%9C%EC%A7%81%EC%8A%A4',
  '부문별 수시 채용');

const DMC_SENIOR = {
  who: '디지털미디어콘텐츠 전공 선배 A (예시)',
  now: '춘천 콘텐츠 기업 재직',
  steps: ['3학년 때 춘천 축제 콘텐츠 제작 참여', '4학년 때 지역 스타트업 마케팅 인턴', '졸업 후 춘천 콘텐츠 기업 입사'],
};

export const MAJORS = {
  dmc: {
    label: '디지털미디어콘텐츠',
    sub: '콘텐츠 · 미디어 · 홍보',
    tracks: {
      mkt: {
        label: '마케팅형',
        senior: DMC_SENIOR,
        levels: [
          { tag: '서포터즈', t: '지역 기관 SNS 서포터즈', d: '춘천 기관을 SNS로 알리는 활동이에요. 포트폴리오 첫 줄이 생겨요.', o: [TALENT_SUPPORTERS, RISE_SUPPORTERS] },
          { tag: '공모전', t: '춘천 홍보 콘텐츠 공모전', d: '춘천을 알리는 콘텐츠를 직접 만들어 내 봐요.', o: [SNS_CONTEST, DICA_CONTEST] },
          { tag: '인턴', t: '청년 일경험·인턴', d: '기관·기업 실무를 가까이서 경험하는 단계예요.', o: [WORK_EXP, WORK24_CC] },
          { tag: '취업 지원', t: '지역 재단·진흥원 홍보직무 지원', d: '쌓은 경험으로 춘천 안에서 직무에 지원해요.', o: [CCCF_JOBS, GICA_JOBS] },
        ],
      },
      plan: {
        label: '콘텐츠 기획형',
        senior: DMC_SENIOR,
        levels: [
          { tag: '공모전', t: '지역 콘텐츠 공모전 도전', d: '기획서 한 편으로 시작해요. 수상 경력은 다음 단계의 근거가 돼요.', o: [SNS_CONTEST, DICA_CONTEST] },
          { tag: '축제', t: '지역 축제 콘텐츠 참여', d: '축제 콘텐츠가 만들어지는 과정을 직접 겪어요.', o: [MIME_CALL, TALENT_SUPPORTERS] },
          { tag: '인턴', t: '청년 일경험·인턴', d: '작은 팀에서 기획부터 실행까지 맡아 봐요.', o: [WORK_EXP, WORK24_CC] },
          { tag: '취업 지원', t: '춘천 콘텐츠 기관 입사 지원', d: '포트폴리오를 들고 춘천 기관에 지원해요.', o: [GICA_JOBS, CCCF_JOBS] },
        ],
      },
    },
  },
  bio: {
    label: '바이오메디컬',
    sub: '연구 · 실험 · 품질',
    tracks: {
      res: {
        label: '연구형',
        goal: '춘천에서 연구자의 길에 들어섰습니다.',
        senior: null,
        levels: [
          { tag: '탐색', t: '관련 연구실·직무 탐색', d: '어떤 연구실과 기업이 있는지 직접 찾아가 물어봐요.', o: [PLANT_INTERN, BIO_JOB_TALK] },
          { tag: '연구', t: '학부연구생·연구보조', d: '연구실에서 실험 보조를 맡아 경험을 쌓아요.', o: [BIO_DEPT, WORK_EXP] },
          { tag: '현장실습', t: '바이오 기업 현장실습', d: '춘천·강원권 바이오 기업의 현장을 경험해요.', o: [KNU_WINTER_FIELD, WORK24_CC] },
          { tag: '취업 지원', t: '연구개발 직무 지원', d: '춘천 바이오 기관·기업 연구직에 지원해요.', o: [CBF_JOBS, EUBIO_JOBS] },
        ],
      },
      qa: {
        label: '품질관리형',
        senior: null,
        levels: [
          { tag: '탐색', t: '바이오 기업·직무 탐색', d: '품질관리가 어떤 일인지부터 알아봐요.', o: [BIO_JOB_TALK, PLANT_INTERN] },
          { tag: '매칭', t: '바이오 기업 만나 보기', d: '도내 바이오 기업 면접·상담 자리에 나가 봐요.', o: [BIO_MATCHING, WORK_EXP] },
          { tag: '현장실습', t: '바이오 기업 현장실습', d: '실제 품질관리 현장을 경험해요.', o: [KNU_WINTER_FIELD, WORK24_CC] },
          { tag: '취업 지원', t: '품질관리 직무 지원', d: '현장 경험을 근거로 직무에 지원해요.', o: [HUGEL_JOBS, EUBIO_JOBS, CBF_JOBS] },
        ],
      },
    },
  },
};

export const MOODS = { happy: '웃음', neutral: '무표정', annoyed: '짜증', angry: '분노' };
