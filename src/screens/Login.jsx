import { useState } from 'react';
import Mascot from '../components/Mascot.jsx';
import { sendCode, verifyCode } from '../lib/auth.js';

/* 로그인: 이메일 → 6자리 코드. 비밀번호 없이, 앱을 벗어나지 않고 끝난다.
   "로그인 없이 둘러보기"를 남겨 둔다(가입 단계 이탈을 줄이고, 발표 시연도 막히지 않게). */
export default function Login({ onDone, onGuest }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const send = async (e) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr('이메일 주소를 다시 확인해 주세요.');
    setBusy(true);
    setErr('');
    try {
      await sendCode(v);
      setSent(true);
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setErr('메일로 온 6자리 숫자를 넣어 주세요.');
    setBusy(true);
    setErr('');
    try {
      onDone(await verifyCode(email.trim(), code));
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  return (
    <div className="screen login">
      <p className="brand-lg">
        <span className="nm">감자</span> 키우기
      </p>
      <section className="hero">
        <Mascot mood="happy" size={104} />
        <p className="hero-bubble">{sent ? '메일 확인해 봐. 숫자 6개 왔지?' : '어디서 열어도 이어서 키우게, 이메일 하나만 알려줘.'}</p>
      </section>

      {!sent ? (
        <form className="form" onSubmit={send} noValidate>
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
                setErr('');
              }}
            />
          </div>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn primary block" type="submit" disabled={busy}>
            {busy ? '보내는 중…' : '로그인 코드 받기'}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={verify} noValidate>
          <div className="field">
            <label htmlFor="code">{email}로 보낸 코드</label>
            <input
              id="code"
              className="input code-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setErr('');
              }}
            />
          </div>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn primary block" type="submit" disabled={busy}>
            {busy ? '확인하는 중…' : '확인하고 시작하기'}
          </button>
          <button
            type="button"
            className="link"
            onClick={() => {
              setSent(false);
              setCode('');
              setErr('');
            }}
          >
            이메일 다시 쓰기
          </button>
        </form>
      )}

      <button type="button" className="link muted guest" onClick={onGuest}>
        로그인 없이 둘러보기
      </button>
      <p className="fine">로그인하면 진행 상황이 계정에 저장돼 폰을 바꿔도 이어서 키울 수 있어요. 이메일은 로그인에만 써요.</p>
    </div>
  );
}
