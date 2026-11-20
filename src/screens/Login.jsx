import { useState } from 'react';
import Mascot from '../components/Mascot.jsx';
import { signIn, signUp } from '../lib/auth.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* 로그인 화면: 이메일·비밀번호로 로그인.
   아래에 "가입하기"(같은 자리에서 가입 모드로 바뀜)와 "로그인 없이 둘러보기" 두 개.
   가입은 비밀번호를 한 번 더 받는다. 메일 확인은 없이 바로 시작한다. */
export default function Login({ onDone, onGuest }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const signup = mode === 'signup';

  const submit = async (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL.test(v)) return setErr('이메일 주소를 다시 확인해 주세요.');
    if (password.length < 6) return setErr('비밀번호는 6자 이상으로 해 주세요.');
    if (signup && password !== again) return setErr('비밀번호가 서로 달라요.');
    setBusy(true);
    setErr('');
    try {
      const user = signup ? await signUp(v, password) : await signIn(v, password);
      onDone(user, signup);
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  const switchTo = (m) => {
    setMode(m);
    setErr('');
    setAgain('');
  };
  const edit = (set) => (e) => {
    set(e.target.value);
    setErr('');
  };

  return (
    <div className="screen login">
      <section className="hero">
        <Mascot mood="happy" size={96} />
        <p className="hero-bubble">{signup ? '반가워! 이메일이랑 비밀번호만 정하면 돼.' : '어서 와! 로그인하면 폰을 바꿔도 이어서 키울 수 있어.'}</p>
      </section>

      <form className="form card login-card" onSubmit={submit} noValidate>
        <h1 className="login-title">{signup ? '가입하기' : '로그인'}</h1>
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" className="input" type="email" inputMode="email" autoComplete="email" placeholder="학교 메일도 괜찮아요" value={email} onChange={edit(setEmail)} />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            placeholder="6자 이상"
            value={password}
            onChange={edit(setPassword)}
          />
        </div>
        {signup && (
          <div className="field">
            <label htmlFor="password2">비밀번호 확인</label>
            <input id="password2" className="input" type="password" autoComplete="new-password" placeholder="한 번 더" value={again} onChange={edit(setAgain)} />
          </div>
        )}
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <button className="btn primary block" type="submit" disabled={busy}>
          {busy ? '확인하는 중…' : signup ? '가입하고 시작하기' : '로그인'}
        </button>
      </form>

      <div className="login-alt">
        {signup ? (
          <button type="button" className="btn outline block" onClick={() => switchTo('login')}>
            이미 계정이 있어요 · 로그인
          </button>
        ) : (
          <button type="button" className="btn outline block" onClick={() => switchTo('signup')}>
            처음이에요 · 가입하기
          </button>
        )}
        <button type="button" className="btn ghost block guest" onClick={onGuest}>
          로그인 없이 둘러보기
        </button>
      </div>
      <p className="fine">로그인하면 진행 상황이 계정에 저장되고, 커뮤니티에 글을 쓸 수 있어요. 이메일은 로그인에만 써요.</p>
    </div>
  );
}
