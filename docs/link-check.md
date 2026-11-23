# 기회 링크 점검

## 2026.11.23 계열별 기회 11개 추가

추천 기회가 계열마다 거의 같아서(3학년은 24개 직무 중 21개가 미래내일·고용24), 자기 기회가 적던 계열에 실제 프로그램을 더함. 모든 링크 열리는 것 확인(HTTP 200). 대부분 지금은 모집이 끝나 "정기 모집"(months)으로 넣음

| id | 기회 | 넣은 계열 |
| --- | --- | --- |
| kspo-intern | 국민체육진흥공단 청년인턴 | 예체능·체육 |
| sports-industry-intern | 스포츠산업 인턴십 | 예체능·체육 |
| nhis-intern | 국민건강보험공단 체험형 청년인턴 (본부 원주) | 간호, 보건·의료기사, 공공행정 |
| ccaf-volunteer | 춘천공연예술제 자원활동가 | 예체능·공연 |
| redcross-gw-jobs | 대한적십자사 강원혈액원 채용 | 간호, 보건·의료기사 |
| boostcamp | 부스트캠프 웹·모바일 (온라인) | IT·개발 |
| godsaeng-intern | 갓생 인턴십 (스마트팜·푸드테크) | 농림·스마트팜, 농림·식품 |
| smartfarm-incubator | 스마트팜 청년창업 보육센터 | 농림·스마트팜 |
| kbsi-equip | 연구장비분야 전문인력양성과정 | 자연과학·연구, 바이오·연구 |
| kbsi-jobs | 한국기초과학지원연구원 채용 (춘천센터 포함) | 자연과학 |
| data-ai-challenge | 데이터+AI 혁신 챌린지 | IT·데이터, 자연과학·분석 |

아직 남은 것: 인문·사회·경영·교육·공학·미디어 계열은 3학년에 여전히 공통 일경험(미래내일·고용24)이 뜸. 다음에 계열별로 더 찾기

## 2026.11.23 손본 것

- 기관 첫 화면으로만 가던 링크 8개(9개 항목)를 채용·공지 게시판으로 바꿈. 모두 열리는 것 확인(HTTP 200)

| id | 바꾼 링크 |
| --- | --- |
| knuh-nurse | 강원대학교병원 채용안내 목록 |
| hallym-nurse | 한림대학교의료원 인재채용 사이트 (recruit.hallym.or.kr) |
| gwe-jobs | 강원특별자치도교육청 학교인력채용 게시판 |
| cc-museum | 국립춘천박물관 채용/공고 게시판 |
| ccei-startup | 강원창조경제혁신센터 공지사항 |
| cbf-jobs | 춘천바이오산업진흥원 채용공고 게시판 |
| knu-bio-job-talk · knu-bio-undergrad-research | 강원대 생명건강공학과 학과 공지사항 |
| gojobs | 나라일터 채용공고 목록 |

- 마감 지난 2개는 지우지 않고 해마다 여는 정기 모집으로 바꿈 (제목의 "2026" 뺌, `due` 없음, `months`로 "곧 열려요"·알림). 매년 열리는지는 아직 확인 못 해서 "다음 공고 확인 필요"라고 적어 둠
  - cc-travel-sns-contest: 회차별 접수, 2026년엔 3~11월 → 3월에 열림
  - cc-dica-poem-contest: 2026년엔 8.17~9.1 접수 → 8월에 열림
- `researchedAt`을 2026.11.23으로

## 2026.11.22 다시 점검

- 원문 링크 32개 모두 다시 열어 봄: **32개 모두 정상(HTTP 200)**
- 마감이 지난 기회 2개 (앱은 마감 지난 기회를 목록에서 자동으로 숨김) → 11.23에 정기 모집으로 바꿈
  - cc-travel-sns-contest (2026 춘천여행 SNS 공모전, 11.20 마감)
  - cc-dica-poem-contest (2026 춘천 디카시 공모전, 8.31 마감)
- 곧 마감: policy-contest (11.26)
- 아래 "첫 화면으로만 가는 링크 8개" → 11.23에 바꿈

## 2026.11.20 점검

`src/data/opportunities.json`의 원문 링크 32개를 모두 열어 봤습니다. **32개 모두 정상(HTTP 200)** 으로 열립니다.

### 공고가 아니라 기관 첫 화면으로만 가는 링크 (8개)

열리긴 하지만 해당 공고·안내 페이지가 아니라 기관 홈페이지 첫 화면입니다. 발표 전에 채용·공지 게시판 주소로 바꾸면 더 좋습니다.

| id | 기회 | 지금 링크 |
| --- | --- | --- |
| knuh-nurse | 강원대학교병원 신규 간호사 채용 | knuh.or.kr 첫 화면 |
| hallym-nurse | 한림대학교의료원 신입간호사 모집 | hallym.or.kr 첫 화면 |
| gwe-jobs | 강원특별자치도교육청 채용 | gwe.go.kr 첫 화면 |
| cc-museum | 국립춘천박물관 학예 청년인턴·기간제 | chuncheon.museum.go.kr 첫 화면 |
| ccei-startup | 강원창조경제혁신센터 창업 프로그램 | ccei.creativekorea.or.kr/gangwon 첫 화면 |
| cbf-jobs | 춘천바이오산업진흥원 공개채용 | cbf.or.kr 첫 화면 |
| knu-bio-job-talk · knu-bio-undergrad-research | 강원대 생명건강공학과 직무 상담 · 학부연구생 | 학과 첫 화면 |
| gojobs | 나라일터 공공기관 채용 | gojobs.go.kr 첫 화면 (지역 검색 필요) |

### 공식 기관이 아닌 곳으로 가는 링크

공모전 모음 사이트·기사·대학 공지로 연결됩니다. 내용은 맞지만, 공식 공고를 찾으면 바꾸는 게 좋습니다.

- cc-travel-sns-contest, policy-contest → 링커리어
- cc-dica-poem-contest → 아이러브콘테스트
- cc-mime-festival-call → 콘테스트코리아
- cc-streetreporter → 씽굿
- future-work-experience, bio-matching-day → 신문 기사
- eubio-jobs, hugel-qc-jobs → 사람인 기업 채용 페이지
- fiscal-data-contest → 한양대 공지(기획예산처 공고를 옮겨 실음, 원문을 못 찾음)
