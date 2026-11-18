/* 춘천 기회 데이터: 앱 코드와 분리된 JSON 한 파일 (src/data/opportunities.json)
   - 빌드할 때 그 파일을 앱 안에 넣어 두고(인터넷이 없을 때 쓰는 기본값),
     같은 파일을 사이트의 /data/opportunities.json 으로도 내보낸다(vite.config.js).
   - 앱은 켤 때 사이트에서 최신 파일을 받아 쓴다. 그래서 GitHub에서 JSON만 고쳐 올리면
     Vercel이 다시 배포되고, 웹·iPhone 앱 모두 다음에 열 때 새 목록을 본다(앱 재설치 필요 없음).
   - 받은 파일은 기기에 저장해 두고, 받기에 실패하면 저장본 → 앱에 넣은 기본값 순으로 쓴다.

   파일 모양:
   { researchedAt: "2026.11.18",
     opportunities: [{ id, title, type, org, due: "YYYY-MM-DD"|null, target, src, when|null }, …],
     paths: { "dmc.mkt": [[1단계 기회 id…], [2단계…], [3단계…], [4단계…]], … } } */
import bundled from '../data/opportunities.json';
import { MAJORS, TYPES } from './data.js';

export const BUNDLED = bundled;
const CACHE_KEY = 'gamja:opportunities';
// iPhone 앱 안에서는 상대 경로가 앱에 든 파일을 가리키므로, 배포된 사이트 주소로 받는다
export const REMOTE_URL = 'https://gamja-kiugi.vercel.app/data/opportunities.json';

/* 모양이 맞는 데이터인지 확인. 틀린 파일을 올려도 앱이 깨지지 않게, 맞지 않으면 버린다 */
export function isValidData(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.opportunities) || !d.paths) return false;
  const ids = new Set();
  for (const o of d.opportunities) {
    if (!o || typeof o.id !== 'string' || typeof o.title !== 'string' || !TYPES.includes(o.type)) return false;
    if (o.due != null && !/^\d{4}-\d{2}-\d{2}$/.test(o.due)) return false;
    ids.add(o.id);
  }
  for (const [mk, m] of Object.entries(MAJORS)) {
    for (const tk of Object.keys(m.tracks)) {
      const levels = d.paths[`${mk}.${tk}`];
      if (!Array.isArray(levels) || levels.length !== 4) return false;
      if (!levels.every((l) => Array.isArray(l) && l.every((id) => ids.has(id)))) return false;
    }
  }
  return true;
}

export function cachedData() {
  try {
    const d = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return isValidData(d) ? d : null;
  } catch {
    return null;
  }
}

/* 최신 데이터를 받아 온다. 실패하면 null (화면은 저장본·기본값을 계속 쓴다) */
export async function fetchLatest({ native = false, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') return null;
  const url = native ? REMOTE_URL : './data/opportunities.json';
  try {
    const res = await fetchImpl(`${url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const d = await res.json();
    if (!isValidData(d)) return null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(d));
    } catch {
      /* 저장 못 해도 이번 접속에는 쓴다 */
    }
    return d;
  } catch {
    return null;
  }
}
