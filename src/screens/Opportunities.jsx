import OpportunityCard from '../components/OpportunityCard.jsx';
import { SearchIcon } from '../components/Icons.jsx';
import PageHead from '../components/PageHead.jsx';
import { GROUPS, TYPES } from '../lib/data.js';

/* 기회: 유형 칩, 검색, 스크랩, 빠른 필터(P1) */
export default function Opportunities({ items, hiddenCount, today, q, onQuery, type, onType, mode, onMode, saved, onOpen, onSave }) {
  const query = q.trim().toLowerCase();
  const modeSet = mode ? GROUPS[mode] : null;
  const list = items.filter((it) => {
    if (modeSet && !modeSet.includes(it.type)) return false;
    if (type === '스크랩' && !saved[it.id]) return false;
    if (type !== '전체' && type !== '스크랩' && it.type !== type) return false;
    if (query && !`${it.title} ${it.org} ${it.type} ${it.target}${it.online ? ' 온라인' : ''}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const savedCount = items.filter((it) => saved[it.id]).length;

  return (
    <div className="screen">
      <PageHead
        no="02"
        en="OPPORTUNITIES"
        title="할 게 없다며? 여기 있는데."
        lead="내 로드맵에 맞는 서포터즈·공모전·프로젝트·인턴·현장실습·채용이에요. 춘천에서 하는 것과 온라인으로 하는 것을 같이 모았고, 마감 지난 기회는 자동으로 내려요."
      />

      <div className="searchbar">
        <SearchIcon size={18} />
        <input
          type="search"
          placeholder="기회 이름, 기관 검색"
          aria-label="기회 검색"
          value={q}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>

      <div className="quick" role="group" aria-label="빠른 필터">
        <button type="button" aria-pressed={mode === 'job'} onClick={() => onMode(mode === 'job' ? null : 'job')}>
          내 직무가 더 중요해요
        </button>
        <button type="button" aria-pressed={mode === 'exp'} onClick={() => onMode(mode === 'exp' ? null : 'exp')}>
          경험부터 쌓고 싶어요
        </button>
      </div>

      <div className="chips" role="group" aria-label="기회 유형">
        {['전체', ...TYPES, '스크랩'].map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => onType(t)}>
            {t === '스크랩' ? `스크랩 ${savedCount}` : t}
          </button>
        ))}
      </div>

      <p className="count">
        <b>{list.length}건</b>
        {query && ` · "${q.trim()}" 검색`}
        {hiddenCount > 0 && ` · 마감 지난 ${hiddenCount}건은 숨겼어요`}
      </p>
      <p className="disclaimer">조사한 시점 기준이에요. 지원 전에 원문 공고를 꼭 확인해 주세요.</p>

      {list.length ? (
        <div className="list">
          {list.map((it) => (
            <OpportunityCard key={it.id} item={it} today={today} saved={!!saved[it.id]} onOpen={onOpen} onSave={onSave} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>조건에 맞는 기회가 없어요.</p>
          {(query || type !== '전체' || mode) && (
            <button
              type="button"
              className="btn ghost sm"
              onClick={() => {
                onQuery('');
                onType('전체');
                onMode(null);
              }}
            >
              조건 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
}
