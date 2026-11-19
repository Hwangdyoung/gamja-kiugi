import { useState } from 'react';
import OpportunityCard from '../components/OpportunityCard.jsx';
import { SearchIcon } from '../components/Icons.jsx';
import PageHead from '../components/PageHead.jsx';
import { GROUPS, TYPES } from '../lib/data.js';
import { daysLeft, opensIn } from '../lib/opportunities.js';

const MODES = [
  { id: null, label: '전체' },
  { id: 'exp', label: '경험 쌓기' },
  { id: 'job', label: '일 경험·채용' },
  { id: 'saved', label: '스크랩' },
];

/* 목록을 상황별로 나눈다: 마감 임박 → 모집 중 → 곧 열려요(정기) → 수시·정기 */
function sections(list, today) {
  const urgent = [];
  const open = [];
  const soon = [];
  const rest = [];
  list.forEach((it) => {
    const left = daysLeft(it, today);
    if (left !== null) (left <= 7 ? urgent : open).push(it);
    else if (opensIn(it, today) !== null) soon.push(it);
    else rest.push(it);
  });
  soon.sort((a, b) => opensIn(a, today) - opensIn(b, today));
  return [
    { id: 'urgent', title: '마감 임박', sub: '7일 안에 마감해요', items: urgent },
    { id: 'open', title: '지금 모집 중', items: open },
    { id: 'soon', title: '곧 열려요', sub: '이번 달·다음 달에 모집이 열리는 정기 프로그램', items: soon },
    { id: 'rest', title: '수시·정기 모집', sub: '공고가 수시로 뜨거나 다음 모집을 기다리는 중', items: rest },
  ].filter((s) => s.items.length);
}

/* 기회: 검색 · 분류(경험/일) · 유형 칩 · 온라인/우리 학교 · 상황별 묶음 */
export default function Opportunities({ items, hiddenCount, today, q, onQuery, type, onType, mode, onMode, saved, onOpen, onSave }) {
  const [online, setOnline] = useState(false);
  const [ours, setOurs] = useState(false);
  const query = q.trim().toLowerCase();
  const types = mode === 'exp' || mode === 'job' ? GROUPS[mode] : TYPES;
  const hasOurs = items.some((it) => it.ours);
  const savedCount = items.filter((it) => saved[it.id]).length;

  const list = items.filter((it) => {
    if (mode === 'saved' && !saved[it.id]) return false;
    if ((mode === 'exp' || mode === 'job') && !GROUPS[mode].includes(it.type)) return false;
    if (type !== '전체' && it.type !== type) return false;
    if (online && !it.online) return false;
    if (ours && !it.ours) return false;
    if (query && !`${it.title} ${it.org} ${it.type} ${it.target}${it.online ? ' 온라인' : ''}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const groups = sections(list, today);
  const filtered = query || type !== '전체' || mode || online || ours;

  return (
    <div className="screen">
      <PageHead no="02" en="OPPORTUNITIES" title="할 게 없다며? 여기 있는데." lead="내 로드맵에 맞는 춘천·온라인 기회예요. 마감 지난 기회는 자동으로 내려요." />

      <div className="searchbar">
        <SearchIcon size={18} />
        <input type="search" placeholder="기회 이름, 기관 검색" aria-label="기회 검색" value={q} onChange={(e) => onQuery(e.target.value)} />
      </div>

      <div className="seg" role="tablist" aria-label="기회 분류">
        {MODES.map((m) => (
          <button
            key={m.label}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => {
              onMode(m.id);
              onType('전체');
            }}
          >
            {m.label}
            {m.id === 'saved' && <small>{savedCount}</small>}
          </button>
        ))}
      </div>

      <div className="chips" role="group" aria-label="기회 유형">
        {['전체', ...types].map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => onType(t)}>
            {t}
          </button>
        ))}
        <span className="chips-sep" aria-hidden="true" />
        <button type="button" className="chip" aria-pressed={online} onClick={() => setOnline((v) => !v)}>
          온라인
        </button>
        {hasOurs && (
          <button type="button" className="chip" aria-pressed={ours} onClick={() => setOurs((v) => !v)}>
            우리 학교
          </button>
        )}
      </div>

      <p className="count">
        <b>{list.length}건</b>
        {query && ` · "${q.trim()}" 검색`}
        {hiddenCount > 0 && ` · 마감 지난 ${hiddenCount}건은 숨겼어요`}
      </p>

      {groups.length ? (
        groups.map((g) => (
          <section key={g.id} className="opp-group" aria-label={g.title}>
            <div className="section-head">
              <h2>
                {g.title} <span className="muted">{g.items.length}</span>
              </h2>
            </div>
            {g.sub && <p className="muted small group-sub">{g.sub}</p>}
            <div className="list">
              {g.items.map((it) => (
                <OpportunityCard key={it.id} item={it} today={today} saved={!!saved[it.id]} onOpen={onOpen} onSave={onSave} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="empty">
          <p>{mode === 'saved' ? '스크랩한 기회가 없어요. 카드 오른쪽 책갈피를 눌러 모아 보세요.' : '조건에 맞는 기회가 없어요.'}</p>
          {filtered && (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                onQuery('');
                onType('전체');
                onMode(null);
                setOnline(false);
                setOurs(false);
              }}
            >
              조건 초기화
            </button>
          )}
        </div>
      )}
      <p className="disclaimer">조사한 시점 기준이에요. 지원 전에 원문 공고를 꼭 확인해 주세요.</p>
    </div>
  );
}
