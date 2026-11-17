/* 기획안 10장: 첫 출시는 로그인 없이 기기에 저장한다.
   저장소를 못 쓰는 환경(사생활 보호 모드 등)에서도 앱은 그대로 동작해야 한다. */
const KEY = 'oo-kiugi:v2';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 저장 실패는 무시: 이번 접속 동안만 유지된다 */
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}
