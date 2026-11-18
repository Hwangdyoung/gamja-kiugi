import { useState } from 'react';
import { MAJORS } from '../lib/data.js';
import { FIELDS, SCHOOLS, fieldOf, guessField } from '../lib/fields.js';

/* 시작 설정: 이름 · 학교 · 학과 · (계열 자동) · 관심 직무 (기획안 5장, v2에서 학과 검색 추가)
   학교마다 같은 공부를 하는 학과도 이름이 달라서, 학과 이름을 쓰면 계열을 찾아 경로를 고른다.
   시작 화면과 설정 시트가 같이 쓴다. */
export default function ProfileForm({ profile, doneCount = 0, submitLabel, onNameDraft, onSubmit }) {
  const [name, setName] = useState(profile?.name ?? '');
  const [school, setSchool] = useState(profile?.school ?? '');
  const [dept, setDept] = useState(profile?.dept ?? '');
  const [major, setMajor] = useState(profile?.major ?? null);
  const [picked, setPicked] = useState(!!profile?.major); // 계열을 직접 골랐는지(그럼 자동 추천이 덮어쓰지 않음)
  const [track, setTrack] = useState(profile?.track ?? null);
  const [err, setErr] = useState('');

  const guess = guessField(dept);
  const guessReady = guess && MAJORS[guess];
  const willReset =
    profile && doneCount > 0 && (major !== profile.major || (track && track !== profile.track));

  const onDept = (v) => {
    setDept(v);
    setErr('');
    const g = guessField(v);
    if (!picked && g && MAJORS[g] && g !== major) {
      setMajor(g);
      setTrack(null);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return setErr('이름을 입력해 주세요.');
    if (!major) return setErr('계열을 선택해 주세요.');
    if (!track) return setErr('관심 직무를 선택해 주세요.');
    onSubmit({ name: v, school, dept: dept.trim(), major, track });
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

      <div className="field-row">
        <div className="field">
          <label htmlFor="school">학교</label>
          <select id="school" className="input" value={school} onChange={(e) => setSchool(e.target.value)}>
            <option value="">선택 안 함</option>
            {SCHOOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dept">학과</label>
          <input
            id="dept"
            className="input"
            type="text"
            maxLength={20}
            placeholder="예: 미디어커뮤니케이션"
            value={dept}
            onChange={(e) => onDept(e.target.value)}
          />
        </div>
      </div>
      {dept.trim().length >= 2 && (
        <p className={`field-hint${guess && !guessReady ? ' warn' : ''}`} role="status">
          {!guess && '이 학과는 자동으로 못 찾았어요. 아래에서 가까운 계열을 골라 주세요.'}
          {guessReady && `${fieldOf(guess).label} 계열 경로로 안내할게요.`}
          {guess && !guessReady && `${fieldOf(guess).label} 계열은 아직 준비 중이에요. 지금은 아래 두 계열 중 가까운 쪽을 골라 주세요.`}
        </p>
      )}

      <fieldset className="field">
        <legend>계열</legend>
        <div className="choices two">
          {FIELDS.filter((f) => MAJORS[f.id]).map((f) => (
            <label key={f.id} className="choice">
              <input
                type="radio"
                name="major"
                value={f.id}
                checked={major === f.id}
                onChange={() => {
                  setMajor(f.id);
                  setPicked(true);
                  setTrack(null);
                  setErr('');
                }}
              />
              <span>
                <b>{f.label}</b>
                <small>{MAJORS[f.id].sub}</small>
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
          <p className="hint">학과를 쓰거나 계열을 먼저 골라 주세요.</p>
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
