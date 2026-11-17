import { useState } from 'react';
import { MAJORS } from '../lib/data.js';

/* 이름·전공·관심 직무 세 가지만 받는다 (기획안 5장 시작 설정).
   시작 화면과 설정 시트가 같이 쓴다. */
export default function ProfileForm({ profile, doneCount = 0, submitLabel, onNameDraft, onSubmit }) {
  const [name, setName] = useState(profile?.name ?? '');
  const [major, setMajor] = useState(profile?.major ?? null);
  const [track, setTrack] = useState(profile?.track ?? null);
  const [err, setErr] = useState('');

  const willReset =
    profile && doneCount > 0 && (major !== profile.major || (track && track !== profile.track));

  const submit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return setErr('이름을 입력해 주세요.');
    if (!major) return setErr('전공을 선택해 주세요.');
    if (!track) return setErr('관심 직무를 선택해 주세요.');
    onSubmit({ name: v, major, track });
  };

  return (
    <form className="form" autoComplete="off" noValidate onSubmit={submit}>
      <div className="field">
        <label htmlFor="name">이름</label>
        <input
          id="name"
          className="input"
          type="text"
          maxLength={8}
          placeholder="앱 이름에 들어갈 이름"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr('');
            onNameDraft?.(e.target.value.trim());
          }}
        />
      </div>

      <fieldset className="field">
        <legend>전공</legend>
        <div className="choices">
          {Object.entries(MAJORS).map(([k, m]) => (
            <label key={k} className="choice">
              <input
                type="radio"
                name="major"
                value={k}
                checked={major === k}
                onChange={() => {
                  setMajor(k);
                  setTrack(null);
                  setErr('');
                }}
              />
              <span>
                <b>{m.label}</b>
                <small>{m.sub}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>관심 직무</legend>
        {major ? (
          <div className="choices two">
            {Object.entries(MAJORS[major].tracks).map(([k, t]) => (
              <label key={k} className="choice">
                <input
                  type="radio"
                  name="track"
                  value={k}
                  checked={track === k}
                  onChange={() => {
                    setTrack(k);
                    setErr('');
                  }}
                />
                <span>
                  <b>{t.label}</b>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="hint">전공을 먼저 선택해 주세요.</p>
        )}
      </fieldset>

      {willReset && (
        <p className="notice">전공·직무를 바꾸면 완료한 단계 {doneCount}개가 초기화됩니다.</p>
      )}
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <button className="btn primary block" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
