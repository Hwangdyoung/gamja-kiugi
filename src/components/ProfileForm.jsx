import { useState } from 'react';
import { MAJORS } from '../lib/data.js';
import { GRADES } from '../lib/roadmap.js';

/* 시작 설정: 이름 · 학교 · 학년 · 계열 · 관심 직무 (기획안 5장)
   - 학교: 재학생 전용 프로그램(현장실습학기제, 학부연구생 등)을 내 학교 것만 보여 주려고 묻는다
   - 학년: 로드맵에서 "지금 할 일"을 고르려고 묻는다
   - 학교마다 학과 이름이 달라서 학과 대신 계열(12개)을 고른다.
   시작 화면과 설정 시트가 같이 쓴다. 계열·직무를 바꿔도 남긴 기록은 지우지 않는다. */
export const SCHOOLS = ['강원대학교', '한림대학교', '춘천교육대학교', '한림성심대학교', '송곡대학교', '기타'];

export default function ProfileForm({ profile, submitLabel, onNameDraft, onSubmit }) {
  const [name, setName] = useState(profile?.name ?? '');
  const [school, setSchool] = useState(profile?.school ?? '');
  const [grade, setGrade] = useState(profile?.grade ?? 0);
  const [major, setMajor] = useState(profile?.major ?? '');
  const [track, setTrack] = useState(profile?.track ?? null);
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const v = name.trim();
    if (!v) return setErr('이름을 입력해 주세요.');
    if (!school) return setErr('학교를 선택해 주세요.');
    if (!grade) return setErr('학년을 선택해 주세요.');
    if (!major) return setErr('계열을 선택해 주세요.');
    if (!track) return setErr('관심 직무를 선택해 주세요.');
    onSubmit({ name: v, school, grade, major, track });
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
        <p className="field-hint">학교마다 재학생만 할 수 있는 프로그램이 있어서, 우리 학교 것만 골라 보여 드려요.</p>
      </div>

      <div className="field">
        <label htmlFor="grade">학년</label>
        <select
          id="grade"
          className="input"
          value={grade}
          onChange={(e) => {
            setGrade(+e.target.value);
            setErr('');
          }}
        >
          <option value={0}>학년 선택</option>
          {GRADES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <p className="field-hint">지금 학년에 맞는 할 일부터 보여 드려요.</p>
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
