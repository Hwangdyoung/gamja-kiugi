import { useState } from 'react';
import { MAJORS } from '../lib/data.js';

/* 시작 설정: 이름 · 학교 · 계열 · 관심 직무 (기획안 5장)
   학교마다 학과 이름이 달라서 학과 대신 계열(12개)을 고른다. 경로와 기회도 계열 단위로 만든다.
   시작 화면과 설정 시트가 같이 쓴다. */
export const SCHOOLS = ['강원대학교', '한림대학교', '춘천교육대학교', '한림성심대학교', '송곡대학교', '기타'];

export default function ProfileForm({ profile, doneCount = 0, submitLabel, onNameDraft, onSubmit }) {
  const [name, setName] = useState(profile?.name ?? '');
  const [school, setSchool] = useState(profile?.school ?? '');
  const [major, setMajor] = useState(profile?.major ?? '');
  const [track, setTrack] = useState(profile?.track ?? null);
  const [err, setErr] = useState('');

  const willReset =
    profile && doneCount > 0 && (major !== profile.major || (track && track !== profile.track));

  const submit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return setErr('이름을 입력해 주세요.');
    if (!school) return setErr('학교를 선택해 주세요.');
    if (!major) return setErr('계열을 선택해 주세요.');
    if (!track) return setErr('관심 직무를 선택해 주세요.');
    onSubmit({ name: v, school, major, track });
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
          placeholder="감자가 부를 이름"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr('');
            onNameDraft?.(e.target.value.trim());
          }}
        />
      </div>

      <div className="field">
        <label htmlFor="school">학교</label>
        <select
          id="school"
          className="input"
          value={school}
          onChange={(e) => {
            setSchool(e.target.value);
            setErr('');
          }}
        >
          <option value="">학교 선택</option>
          {SCHOOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="major">계열</label>
        <select
          id="major"
          className="input"
          value={major}
          onChange={(e) => {
            setMajor(e.target.value);
            setTrack(null);
            setErr('');
          }}
        >
          <option value="">계열 선택</option>
          {Object.entries(MAJORS).map(([k, m]) => (
            <option key={k} value={k}>
              {m.label}
            </option>
          ))}
        </select>
        {major && <p className="field-hint">{MAJORS[major].sub}</p>}
      </div>

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
          <p className="hint">계열을 먼저 골라 주세요.</p>
        )}
      </fieldset>

      {willReset && <p className="notice">계열·직무를 바꾸면 완료한 단계 {doneCount}개가 초기화됩니다.</p>}
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
