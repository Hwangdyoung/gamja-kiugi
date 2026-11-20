/* 홈 배경의 시각·날씨 (11/20)
   - 시각: 기기 시계로 새벽·낮·노을·밤
   - 날씨: 춘천 지금 날씨(Open-Meteo, 키 없이 쓰는 공개 날씨 API). 위치 권한을 묻지 않고 춘천 좌표로만 묻는다
     (앱이 춘천 대학생용이라). 30분 동안은 저장해 둔 값을 쓰고, 못 받으면 맑음으로 그린다. */
const CHUNCHEON = { lat: 37.88, lon: 127.73 };
const KEY = 'gamja:weather';
const FRESH = 30 * 60 * 1000;

export const WEATHER_LABEL = { clear: '맑음', cloudy: '흐림', rain: '비', snow: '눈' };
export const TIME_LABEL = { dawn: '새벽', day: '낮', dusk: '노을', night: '밤' };

/* 새벽 5~7시, 낮 7~17시, 노을 17~19시, 밤 19~5시 */
export function timeOfDay(d = new Date()) {
  const h = d.getHours();
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'dusk';
  return 'night';
}

/* WMO 날씨 코드 → 네 가지 */
export function weatherKind(code) {
  if (code == null) return 'clear';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rain';
  if (code === 3 || code === 45 || code === 48) return 'cloudy';
  return 'clear';
}

function cached() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && Date.now() - v.at < FRESH ? v : null;
  } catch {
    return null;
  }
}

/* { kind, temp } 또는 null */
export async function fetchWeather(fetcher = globalThis.fetch) {
  const c = cached();
  if (c) return { kind: c.kind, temp: c.temp };
  if (!fetcher) return null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${CHUNCHEON.lat}&longitude=${CHUNCHEON.lon}&current=weather_code,temperature_2m&timezone=Asia%2FSeoul`;
    const res = await fetcher(url);
    if (!res.ok) return null;
    const cur = (await res.json()).current;
    const out = { kind: weatherKind(cur.weather_code), temp: Math.round(cur.temperature_2m) };
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...out, at: Date.now() }));
    } catch {
      /* 무시 */
    }
    return out;
  } catch {
    return null;
  }
}
