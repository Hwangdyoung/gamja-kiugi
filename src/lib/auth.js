/* 로그인과 진행 상황 동기화 (Supabase)
   - 이메일+비밀번호. 메일을 보내지 않아서 무료 요금제의 메일 한도에 안 걸리고, iPhone 앱 안에서 끝난다.
   - 로그인하면 진행 상황(프로필·완료 단계·스크랩·알림 설정)을 계정에 저장해, 폰을 바꿔도 이어서 쓴다.
   - 테스트 지표 이벤트도 계정에 쌓여 팀이 한 곳에서 본다.
   - .env 에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 가 없으면 로그인 기능은 꺼지고, 예전처럼 기기에만 저장한다.
   테이블: supabase/schema.sql */
import { createClient } from '@supabase/supabase-js';

const URL_ = import.meta.env?.VITE_SUPABASE_URL;
const KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

export const supabase = URL_ && KEY ? createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
export const authEnabled = () => !!supabase;

export async function currentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session?.user ?? null));
  return () => data.subscription.unsubscribe();
}

const KO_ERRORS = [
  [/rate limit|security purposes|seconds/i, '잠시 뒤에 다시 해 주세요.'],
  [/already registered|already exists/i, '이미 가입한 이메일이에요. 로그인해 주세요.'],
  [/password.*(6|short|weak)/i, '비밀번호는 6자 이상으로 해 주세요.'],
  [/not confirmed/i, '이메일 확인이 켜져 있어요. Supabase에서 Confirm email을 꺼 주세요.'],
  [/email/i, '이메일 주소를 다시 확인해 주세요.'],
];
const ko = (e) => (KO_ERRORS.find(([re]) => re.test(e?.message || '')) || [null, '잠시 문제가 생겼어요. 다시 해 주세요.'])[1];

/* 로그인: 이메일+비밀번호 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (/invalid login credentials/i.test(error.message)) throw new Error('이메일이나 비밀번호가 맞지 않아요. 처음이면 아래에서 가입해 주세요.');
    throw new Error(ko(error));
  }
  return data.user;
}

/* 가입하고 바로 로그인 (Supabase에서 "Confirm email"을 꺼 둬서 메일 확인 없이 바로 쓴다 — docs/supabase-setup.md) */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(ko(error));
  // 이미 가입한 이메일이면 Supabase가 빈 사용자(identities 없음)를 돌려준다
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error('이미 가입한 이메일이에요. 로그인해 주세요.');
  if (!data.session) throw new Error('이메일 확인이 켜져 있어요. Supabase에서 Confirm email을 꺼 주세요.');
  return data.user;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

/* 계정에 저장된 진행 상황. 없으면 null */
export async function pullProgress(userId) {
  const { data, error } = await supabase.from('progress').select('profile, done, saved, notify_on').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return { profile: data.profile, done: data.done, saved: data.saved, notifyOn: data.notify_on };
}

export async function pushProgress(userId, { profile, done, saved, notifyOn }) {
  if (!supabase || !userId || !profile) return;
  await supabase
    .from('progress')
    .upsert({ user_id: userId, profile, done, saved, notify_on: notifyOn, updated_at: new Date().toISOString() });
}

/* 지표 이벤트를 계정에도 남긴다(실패해도 앱은 계속) */
export function pushEvent(userId, type, data = {}) {
  if (!supabase || !userId) return;
  supabase
    .from('events')
    .insert({ user_id: userId, type, data })
    .then(() => {}, () => {});
}
