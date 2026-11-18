import { useState } from 'react';
import Mascot, { GROW_LABELS } from '../components/Mascot.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import PageHead from '../components/PageHead.jsx';
import { ChevronIcon, SearchIcon } from '../components/Icons.jsx';
import { nextIndex } from '../lib/growth.js';

const SHORTCUTS = [
  { no: '02', en: 'OPPORTUNITIES', tab: 'opps', title: '춘천 기회 찾기', desc: '서포터즈부터 채용까지 한 목록에서 봐요.' },
  { no: '03', en: 'MY PATH', tab: 'path', title: '내 성장 경로', desc: '전공·직무별 4단계와 단계마다의 기회.' },
  { no: '04', en: 'SENIORS', tab: 'senior', title: '선배 이야기', desc: '춘천에 남은 같은 전공 선배의 경로.' },
];

/* 홈: 검색창, 캐릭터와 말풍선, 진행 상황, 다음 단계, 추천 기회 (기획안 6장) */
export default function Home({ name, track, mood, message, done, items, today, saved, urgent = [], onOpen, onSave, onTab, onSearch }) {
  const [q, setQ] = useState('');
  const dc = done.filter(Boolean).length;
  const ni = nextIndex(done);
  const next = ni === -1 ? null : track.levels[ni];
  // 다음 단계의 기회를 먼저, 모두 마쳤으면 마감이 가까운 순서로
  const picks = (next ? items.filter((it) => it.step === ni) : items).slice(0, 3);

  return (
    <div className="screen">
      <PageHead
        no="01"
        en="TODAY"
        title={next ? `${name}, 오늘은 ${ni + 1}단계 해볼까?` : `${name}, 4단계 다 왔다.`}
        lead="다음 단계와 지금 지원할 수 있는 기회를 모았어요."
      />

      <form
        className="searchbar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(q.trim());
        }}
      >
        <SearchIcon size={18} />
        <input
          type="search"
          placeholder="춘천 기회 검색"
          aria-label="춘천 기회 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <section className="card status">
        <div className="status-top">
          <Mascot mood={mood} size={96} grow={dc} />
          <p className="bubble" aria-live="polite">{message}</p>
        </div>
        <div className="progress">
          <div className="progress-label">
            <span>
              내 성장 경로 · <span className="grow-label">{GROW_LABELS[dc]}</span>
            </span>
            <b>{dc} / 4단계 완료</b>
          </div>
          <div className="bar" role="progressbar" aria-label="성장 경로 진행" aria-valuemin={0} aria-valuemax={4} aria-valuenow={dc}>
            <i style={{ width: `${dc * 25}%` }} />
          </div>
        </div>
      </section>

      {urgent.length > 0 && (
        <section className="section urgent" aria-label="마감 임박 스크랩">
          <div className="section-head">
            <h2>스크랩한 기회 마감 임박</h2>
            <span className="badge warn">{urgent.length}건</span>
          </div>
          <div className="list">
            {urgent.map((it) => (
              <OpportunityCard key={it.id} item={it} today={today} saved onOpen={onOpen} onSave={onSave} />
            ))}
          </div>
        </section>
      )}

      <button type="button" className="card next" onClick={() => onTab('path')}>
        <span className="next-body">
          <span className="eyebrow">{next ? `다음 단계 · ${ni + 1}단계` : '모든 단계 완료'}</span>
          <span className="next-title">{next ? next.t : '4단계를 모두 마쳤어요'}</span>
        </span>
        <ChevronIcon />
      </button>

      <section className="section">
        <div className="section-head">
          <h2>{next ? '다음 단계 추천 기회' : '마감이 가까운 기회'}</h2>
          <button type="button" className="link" onClick={() => onTab('opps')}>
            전체 보기
          </button>
        </div>
        {picks.length ? (
          <div className="list">
            {picks.map((it) => (
              <OpportunityCard key={it.id} item={it} today={today} saved={!!saved[it.id]} onOpen={onOpen} onSave={onSave} />
            ))}
          </div>
        ) : (
          <p className="empty">지금 모집 중인 기회가 없어요.</p>
        )}
      </section>

      <section className="section">
        <p className="motto">
          막막함을 다음 행동으로.
          <span>정보는 정확하게, 말투는 가볍게.</span>
        </p>
        <div className="shortcuts">
          {SHORTCUTS.map((s) => (
            <button key={s.tab} type="button" className="shortcut" onClick={() => onTab(s.tab)}>
              <span className="kicker">
                <span>{s.no} / </span>
                {s.en}
              </span>
              <b>{s.title}</b>
              <small>{s.desc}</small>
              <span className="go">
                살펴보기 <ChevronIcon size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
