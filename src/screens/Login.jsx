import { useState } from 'react';
import Mascot from '../components/Mascot.jsx';
import { signInOrUp } from '../lib/auth.js';

/* 로그인: 이메일 + 비밀번호. 처음이면 그대로 가입, 가입한 적 있으면 로그인 (버튼 하나).
   "로그인 없이 둘러보기"를 남겨 둔다(가입 단계 이탈을 줄이고, 발표 시연도 막히지 않게). */
export default function Login({ onDone, onGuest }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr('이메일 주소를 다시 확인해 주세요.');
    if (password.length < 6) return setErr('비밀번호는 6자 이상으로 해 주세요.');
    setBusy(true);
    setErr('');
    try {
      const { user, created } = await signInOrUp(v, password);
      onDone(user, created);
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  const clear = () => setErr('');

  return (
    <div className="screen login">
      <p className="brand-lg">
        <span className="nm">감자</span> 키우기
      </p>
      <section className="hero">
        <Mascot mood="happy" size={104} />
        <p className="hero-bubble">어디서 열어도 이어서 키우게, 이메일 하나만 알려줘.</p>
      </section>

      <form className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="학교 메일도 괜찮아요"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear();
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="6자 이상"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear();
            }}
          />
        </div>
        {err && (
          <p className="error" role="alert">
            {err}
          </p>
        )}
        <button className="btn primary block" type="submit" disabled={busy}>
          {busy ? '확인하는 중…' : '시작하기'}
        </button>
        <p className="fine">처음이면 이 이메일로 바로 가입돼요. 가입한 적 있으면 로그인돼요.</p>
      </form>

      <button type="button" className="link guest" onClick={onGuest}>
        로그인 없이 둘러보기
      </button>
      <p className="fine">로그인하면 진행 상황이 계정에 저장돼 폰을 바꿔도 이어서 키울 수 있어요. 이메일은 로그인에만 써요.</p>
    </div>
  );
}
