# 기회 링크 점검

## 2026.11.22 다시 점검

- 원문 링크 32개 모두 다시 열어 봄: **32개 모두 정상(HTTP 200)**
- 마감이 지난 기회 2개 (앱은 마감 지난 기회를 목록에서 자동으로 숨김. 데이터에서 빼거나 내년 모집 시기(`when`·`months`)로 바꿀지 팀에서 정하기)
  - cc-travel-sns-contest (2026 춘천여행 SNS 공모전, 11.20 마감)
  - cc-dica-poem-contest (2026 춘천 디카시 공모전, 8.31 마감)
- 곧 마감: policy-contest (11.26)
- 아래 "첫 화면으로만 가는 링크 8개"는 그대로임

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
