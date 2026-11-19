/* 감자 돌보기 (11/20): 물 · 햇빛 · 거름
   감자는 땅에서 크는 작물이라 먹이 대신 물·햇빛·거름을 준다.
   셋 다 진로 행동을 해야만 생긴다. 감자를 챙기는 게 곧 기회를 보는 일이 되게:
   - 물: 하루 한 번 앱을 열면 1개 (최대 3개까지 모아 둠)
   - 햇빛: 기회 원문을 처음 열거나, 기회를 처음 스크랩하면 1개 (기회마다 한 번)
   - 거름: 로드맵 할 일에 한 줄 기록을 처음 남기면 1개 (할 일마다 한 번)
   주면 감자 기운이 오른다. 기운은 하루에 조금씩 빠진다.
   기운은 표정(미접속 일수)과 따로 움직이고, 감자 움직임(생생함·시듦)에만 쓴다. 레벨·점수는 두지 않는다. */
export const CARE = {
  water: { label: '물', max: 3, vital: 15, how: '물은 하루 한 번 앱을 열면 생겨.', thanks: ['꿀꺽꿀꺽, 시원해!', '물 맛 좋다~', '촉촉해졌어!'] },
  sun: { label: '햇빛', max: 5, vital: 20, how: '햇빛은 기회 원문을 열거나 스크랩하면 생겨.', thanks: ['따뜻해~ 광합성 중', '햇볕 좋다!', '눈부셔, 근데 좋아'] },
  compost: { label: '거름', max: 12, vital: 35, how: '거름은 로드맵 할 일에 한 줄 기록하면 생겨.', thanks: ['영양 만점! 쑥쑥 클게', '이거 네 기록으로 만든 거지?', '힘이 불끈!'] },
};
export const CARE_KINDS = ['water', 'sun', 'compost'];
const DAILY_DROP = 12;
const DAY = 86400000;

export const emptyCare = () => ({ stock: { water: 0, sun: 0, compost: 0 }, vital: 60, at: null, waterDay: null, rewarded: {} });

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/* 지금 기운 (마지막으로 돌본 뒤 지난 날만큼 빠진다) */
export function vitalOf(care, now = new Date()) {
  if (!care.at) return care.vital;
  const days = Math.floor((now.getTime() - new Date(care.at).getTime()) / DAY);
  return Math.max(0, care.vital - DAILY_DROP * Math.max(0, days));
}

export function vitalLabel(v) {
  if (v >= 70) return '팔팔해';
  if (v >= 40) return '괜찮아';
  return '시들시들';
}

/* 하루 첫 접속이면 물 1개 */
export function dailyWater(care, now = new Date()) {
  const today = dayKey(now);
  if (care.waterDay === today) return care;
  return { ...care, waterDay: today, stock: { ...care.stock, water: Math.min(CARE.water.max, care.stock.water + 1) } };
}

/* 진로 행동으로 얻기. key가 이미 보상받은 행동이면 그대로. { care, got } */
export function earn(care, kind, key) {
  if (key && care.rewarded[key]) return { care, got: false };
  const max = CARE[kind].max;
  const rewarded = key ? { ...care.rewarded, [key]: true } : care.rewarded;
  if (care.stock[kind] >= max) return { care: { ...care, rewarded }, got: false };
  return { care: { ...care, rewarded, stock: { ...care.stock, [kind]: care.stock[kind] + 1 } }, got: true };
}

/* 주기. 가진 게 없으면 null */
export function give(care, kind, now = new Date()) {
  if (care.stock[kind] < 1) return null;
  return {
    ...care,
    stock: { ...care.stock, [kind]: care.stock[kind] - 1 },
    vital: Math.min(100, vitalOf(care, now) + CARE[kind].vital),
    at: now.toISOString(),
  };
}

/* 감자를 눌렀을 때 하는 말 */
const POKE = {
  happy: ['왜 불러?', '헤헤, 간지러워', '오늘 할 일 봤어?', '나 잘 크고 있지?'],
  neutral: ['음… 왔어?', '심심했어', '나 좀 봐 줘'],
  annoyed: ['흥, 이제 왔어?', '건드리지 마, 삐졌어', '할 일이나 하고 와'],
  angry: ['지금 누르기만 할 거야?!', '화났다고!', '기회부터 보고 와!'],
};
export const pokeLine = (mood, n) => POKE[mood][n % POKE[mood].length];
export const TICKLE = ['으하하 그만그만!', '간지러워 죽겠어!', '어지러워~'];
export const SLEEPY = ['쿨… 쿨…', '음냐… 5분만…', '졸려… 내일 보자'];

/* 밤 11시~아침 7시에는 감자가 잔다 */
export const isSleepTime = (d = new Date()) => d.getHours() >= 23 || d.getHours() < 7;
