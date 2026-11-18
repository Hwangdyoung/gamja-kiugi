/* 로그인과 진행 상황 동기화 (Supabase)
   - 이메일로 6자리 코드를 받아 로그인한다(비밀번호 없음). iPhone 앱 안에서도 다른 앱으로 갔다 오지 않아도 된다.
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
  [/rate limit|security purposes|seconds/i, '잠시 뒤에 다시 보내 주세요. 코드는 1분에 한 번 보낼 수 있어요.'],
  [/invalid|expired|otp/i, '코드가 맞지 않거나 시간이 지났어요. 새 코드를 받아 주세요.'],
  [/email/i, '이메일 주소를 다시 확인해 주세요.'],
];
const ko = (e) => (KO_ERRORS.find(([re]) => re.test(e?.message || '')) || [null, '잠시 문제가 생겼어요. 다시 해 주세요.'])[1];

export async function sendCode(email) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw new Error(ko(error));
}

export async function verifyCode(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error(ko(error));
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
