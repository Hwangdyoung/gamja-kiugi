import { useCallback, useEffect, useState } from 'react';
import PageHead from '../components/PageHead.jsx';
import { ChatIcon, HeartIcon, PencilIcon } from '../components/Icons.jsx';
import { SeniorDetail, SeniorRow, collect } from '../components/SeniorStories.jsx';
import {
  BOARDS,
  BOARD_LABEL,
  BODY_MAX,
  COMMENT_MAX,
  TITLE_MAX,
  addComment,
  authorLine,
  authorOf,
  communityEnabled,
  createPost,
  deleteComment,
  deletePost,
  getPost,
  listPosts,
  report,
  timeAgo,
  toggleLike,
} from '../lib/community.js';
import { EXAMPLE_UNDER, exampleById, examplesFor } from '../lib/communityExamples.js';

const TABS = [{ id: 'all', label: '전체' }, ...BOARDS];

/* 커뮤니티 (11/20, 선배 탭을 바꿈)
   게시판 탭(전체 · 선배 조언 · 질문 · 후기 · 자유) → 최신순/공감순 · 우리 계열만 → 글 목록.
   선배 조언 탭 맨 위에는 원래 있던 선배 이야기(가상 사례)를 둔다.
   읽기는 누구나, 쓰기·공감·댓글·신고는 로그인한 사람. 글쓴이는 "익명 감자 · 학교 · 계열 · 학년"으로만 보인다.
   글이 적은 게시판에는 "예시" 표시를 단 앱 안 예시 글을 아래에 보여 준다(lib/communityExamples.js). */
export default function Community({ profile, signedIn, onLogin, onToast, onTrack }) {
  const [view, setView] = useState({ kind: 'list' }); // list | post | write | senior | example
  const [board, setBoard] = useState('all');
  const [sort, setSort] = useState('new');
  const [ours, setOurs] = useState(false);
  const [posts, setPosts] = useState(null); // null = 불러오는 중
  const [err, setErr] = useState('');
  const [moreSeniors, setMoreSeniors] = useState(false);
  const enabled = communityEnabled();

  const load = useCallback(() => {
    if (!enabled) return;
    setPosts(null);
    setErr('');
    listPosts({ board, sort, major: ours ? profile.major : null })
      .then(setPosts)
      .catch((e) => {
        setErr(e.message);
        setPosts([]);
      });
  }, [enabled, board, sort, ours, profile.major]);
  useEffect(() => {
    if (view.kind === 'list') load();
  }, [load, view.kind]);

  const needLogin = () => {
    onToast('로그인하면 글쓰기·댓글·공감을 할 수 있어요.');
    onLogin();
  };

  if (view.kind === 'example') return <ExampleView p={exampleById(view.id)} onBack={() => setView({ kind: 'list' })} />;
  if (view.kind === 'senior') return <SeniorDetail s={view.s} onBack={() => setView({ kind: 'list' })} />;
  if (view.kind === 'write')
    return (
      <Write
        profile={profile}
        board={board === 'all' ? 'question' : board}
        onCancel={() => setView({ kind: 'list' })}
        onDone={(id, b) => {
          onTrack?.('post_create', { board: b });
          onToast('글을 올렸어요.');
          setBoard(b);
          setView({ kind: 'post', id });
        }}
      />
    );
  if (view.kind === 'post')
    return <PostView id={view.id} profile={profile} signedIn={signedIn} onNeedLogin={needLogin} onToast={onToast} onBack={() => setView({ kind: 'list' })} />;

  const seniors = collect(profile, 'all');
  // 실제 글이 적을 때만 예시 글 (불러오는 중이거나 오류면 안 보임)
  const fewPosts = !enabled || (posts !== null && !err && posts.length < EXAMPLE_UNDER);
  const examples = fewPosts ? examplesFor({ board, major: ours ? profile.major : null }) : [];
  if (sort === 'hot') examples.sort((a, b) => b.like_count - a.like_count);
  const shownSeniors = moreSeniors ? seniors : seniors.slice(0, 2);

  return (
    <div className="screen community">
      <PageHead title="같이 묻고, 같이 크자." lead="춘천 대학생끼리 묻고 답하는 곳이에요. 이름 없이 학교·계열·학년만 보여요." />

      <div className="seg" role="tablist" aria-label="게시판">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={board === t.id} onClick={() => setBoard(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="정렬과 거르기">
        <button type="button" className="chip" aria-pressed={sort === 'new'} onClick={() => setSort('new')}>
          최신순
        </button>
        <button type="button" className="chip" aria-pressed={sort === 'hot'} onClick={() => setSort('hot')}>
          공감순
        </button>
        <button type="button" className="chip" aria-pressed={ours} onClick={() => setOurs((v) => !v)}>
          우리 계열만
        </button>
      </div>

      {board === 'advice' && (
        <section className="cm-group" aria-label="선배 이야기">
          <div className="section-head">
            <h2>
              선배 이야기 <span className="muted">{seniors.length}</span>
            </h2>
          </div>
          <div className="list">
            {shownSeniors.map((s) => (
              <SeniorRow key={s.who} s={s} onOpen={(x) => setView({ kind: 'senior', s: x })} />
            ))}
          </div>
          {seniors.length > 2 && (
            <button type="button" className="link more-link" onClick={() => setMoreSeniors((v) => !v)}>
              {moreSeniors ? '접기' : `선배 이야기 ${seniors.length - 2}개 더 보기`}
            </button>
          )}
          <p className="disclaimer">선배 이야기는 실제 춘천 프로그램을 바탕으로 만든 가상 사례예요.</p>
        </section>
      )}

      <section className="cm-group" aria-label="글 목록">
        {board === 'advice' && (
          <div className="section-head">
            <h2>선배가 쓴 조언</h2>
          </div>
        )}
        {!enabled ? (
          <p className="notice-soft">커뮤니티 글쓰기는 로그인 기능을 켠 앱에서 열려요. 아래는 예시 글이에요.</p>
        ) : posts === null ? (
          <p className="fine">글을 불러오는 중…</p>
        ) : err ? (
          <div className="card empty">
            <p>{err}</p>
            <button type="button" className="btn outline sm" onClick={load}>
              다시 불러오기
            </button>
          </div>
        ) : posts.length ? (
          <div className="list">
            {posts.map((p) => (
              <PostRow key={p.id} p={p} showBoard={board === 'all'} onOpen={() => setView({ kind: 'post', id: p.id })} />
            ))}
          </div>
        ) : examples.length ? null : (
          <div className="card empty">
            <p>
              {ours ? '우리 계열 글이 아직 없어요.' : '아직 글이 없어요.'}
              <br />첫 글을 남겨 보세요.
            </p>
          </div>
        )}
      </section>

      {examples.length > 0 && (
        <section className="cm-group" aria-label="예시 글">
          <div className="section-head">
            <h2>예시 글</h2>
          </div>
          <p className="disclaimer">아직 글이 적어서, 이런 이야기를 나누면 된다는 걸 보여 주려고 만든 예시예요. 실제 사용자가 쓴 글이 아니에요.</p>
          <div className="list">
            {examples.map((p) => (
              <PostRow key={p.id} p={p} example showBoard={board === 'all'} onOpen={() => setView({ kind: 'example', id: p.id })} />
            ))}
          </div>
        </section>
      )}

      {enabled && (
        <button type="button" className="fab" onClick={() => (signedIn ? setView({ kind: 'write' }) : needLogin())}>
          <PencilIcon size={18} />
          글쓰기
        </button>
      )}
    </div>
  );
}

function PostRow({ p, showBoard, example, onOpen }) {
  return (
    <button type="button" className={`card post-row${example ? ' is-example' : ''}`} onClick={onOpen}>
      <span className="post-row-top">
        {example && <span className="tag tag-example">예시</span>}
        {showBoard && <span className={`tag board-${p.board}`}>{BOARD_LABEL[p.board]}</span>}
        <b>{p.title}</b>
      </span>
      <span className="post-row-body">{p.body}</span>
      <span className="post-meta">
        <span>{authorLine(p.author)}</span>
        {!example && <span>{timeAgo(p.created_at)}</span>}
        <span className="post-counts">
          <HeartIcon size={14} on={p.liked} /> {p.like_count}
          <ChatIcon size={14} /> {example ? p.comments.length : p.comment_count}
        </span>
      </span>
    </button>
  );
}

function Write({ profile, board: start, onCancel, onDone }) {
  const [board, setBoard] = useState(start);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const hint = BOARDS.find((b) => b.id === board).hint;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setErr('제목을 적어 주세요.');
    if (!body.trim()) return setErr('내용을 적어 주세요.');
    setBusy(true);
    setErr('');
    try {
      const id = await createPost({ board, title: title.trim(), body: body.trim(), author: authorOf(profile) });
      onDone(id, board);
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  return (
    <form className="screen write" onSubmit={submit} noValidate>
      <button type="button" className="link back-link" onClick={onCancel}>
        ← 취소
      </button>
      <h1 className="write-title">글쓰기</h1>
      <div className="seg" role="radiogroup" aria-label="게시판 고르기">
        {BOARDS.map((b) => (
          <button key={b.id} type="button" role="radio" aria-checked={board === b.id} aria-selected={board === b.id} onClick={() => setBoard(b.id)}>
            {b.label}
          </button>
        ))}
      </div>
      <p className="muted small">{hint}</p>
      <div className="field">
        <label htmlFor="post-title">제목</label>
        <input id="post-title" className="input" maxLength={TITLE_MAX} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="한 줄로" />
      </div>
      <div className="field">
        <label htmlFor="post-body">내용</label>
        <textarea id="post-body" className="input textarea" rows={8} maxLength={BODY_MAX} value={body} onChange={(e) => setBody(e.target.value)} placeholder="편하게 적어 주세요. 개인 연락처는 적지 말아 주세요." />
        <small className="count">
          {body.length} / {BODY_MAX}
        </small>
      </div>
      <p className="notice-soft">
        <b>{authorLine(authorOf(profile))}</b>(으)로 올라가요. 이름·이메일은 보이지 않아요.
      </p>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <button type="submit" className="btn primary block" disabled={busy}>
        {busy ? '올리는 중…' : '올리기'}
      </button>
    </form>
  );
}

function PostView({ id, profile, signedIn, onNeedLogin, onToast, onBack }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const load = useCallback(
    () =>
      getPost(id)
        .then((d) => (d ? setData(d) : setErr('지워졌거나 숨겨진 글이에요.')))
        .catch((e) => setErr(e.message)),
    [id]
  );
  useEffect(() => {
    load();
  }, [load]);

  const act = async (fn, done) => {
    if (!signedIn) return onNeedLogin();
    try {
      await fn();
      if (done) onToast(done);
      await load();
    } catch (e) {
      onToast(e.message);
    }
  };

  if (err)
    return (
      <div className="screen">
        <button type="button" className="link back-link" onClick={onBack}>
          ← 커뮤니티
        </button>
        <div className="card empty">
          <p>{err}</p>
        </div>
      </div>
    );
  if (!data) return <p className="fine screen">불러오는 중…</p>;
  const { post: p, comments } = data;

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    await act(() => addComment(p.id, text.trim(), authorOf(profile)));
    setText('');
    setBusy(false);
  };

  return (
    <div className="screen post-view">
      <button type="button" className="link back-link" onClick={onBack}>
        ← 커뮤니티
      </button>
      <article className="card post-full">
        <span className={`tag board-${p.board}`}>{BOARD_LABEL[p.board]}</span>
        <h1>{p.title}</h1>
        <p className="post-meta">
          <span>{authorLine(p.author)}</span>
          <span>{timeAgo(p.created_at)}</span>
        </p>
        <p className="post-text">{p.body}</p>
        <div className="post-actions">
          <button type="button" className={`like-btn${p.liked ? ' on' : ''}`} aria-pressed={p.liked} onClick={() => act(() => toggleLike(p.id))}>
            <HeartIcon size={18} on={p.liked} /> 공감 {p.like_count}
          </button>
          <span className="spacer" />
          {p.mine ? (
            confirmDel ? (
              <span className="record-actions">
                <button type="button" className="btn danger sm" onClick={() =>
                    deletePost(p.id)
                      .then(() => {
                        onToast('글을 지웠어요.');
                        onBack();
                      })
                      .catch((e) => onToast(e.message))
                  }>
                  지우기
                </button>
                <button type="button" className="link" onClick={() => setConfirmDel(false)}>
                  취소
                </button>
              </span>
            ) : (
              <button type="button" className="link danger-link" onClick={() => setConfirmDel(true)}>
                내 글 지우기
              </button>
            )
          ) : (
            <button type="button" className="link muted-link" onClick={() => act(() => report(p.id), '신고했어요. 신고가 쌓이면 글이 숨겨져요.')}>
              신고
            </button>
          )}
        </div>
      </article>

      <section className="cm-group" aria-label="댓글 목록">
        <div className="section-head">
          <h2>
            댓글 <span className="muted">{comments.length}</span>
          </h2>
        </div>
        {comments.length ? (
          <ul className="comments">
            {comments.map((c) => (
              <li key={c.id} className="comment">
                <p>{c.body}</p>
                <span className="post-meta">
                  <span>{authorLine(c.author)}</span>
                  <span>{timeAgo(c.created_at)}</span>
                  <span className="spacer" />
                  {c.mine ? (
                    <button type="button" className="link danger-link" onClick={() => act(() => deleteComment(c.id), '댓글을 지웠어요.')}>
                      지우기
                    </button>
                  ) : (
                    <button type="button" className="link muted-link" onClick={() => act(() => report(p.id, c.id), '신고했어요.')}>
                      신고
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fine">아직 댓글이 없어요.</p>
        )}
        <form className="comment-form" onSubmit={send}>
          <input
            className="input"
            aria-label="댓글"
            maxLength={COMMENT_MAX}
            placeholder={signedIn ? '댓글 남기기' : '로그인하면 댓글을 쓸 수 있어요'}
            value={text}
            onFocus={() => !signedIn && onNeedLogin()}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="btn primary sm" disabled={busy || !text.trim()}>
            등록
          </button>
        </form>
      </section>
    </div>
  );
}

/* 예시 글 보기: 읽기만 (공감·댓글·신고 없음) */
function ExampleView({ p, onBack }) {
  return (
    <div className="screen post-view">
      <button type="button" className="link back-link" onClick={onBack}>
        ← 커뮤니티
      </button>
      <article className="card post-full">
        <span className="post-tags">
          <span className="tag tag-example">예시</span>
          <span className={`tag board-${p.board}`}>{BOARD_LABEL[p.board]}</span>
        </span>
        <h1>{p.title}</h1>
        <p className="post-meta">
          <span>{authorLine(p.author)}</span>
        </p>
        <p className="post-text">{p.body}</p>
        <p className="disclaimer">커뮤니티 사용법을 보여 주려고 만든 예시 글이에요. 공감·댓글·신고는 실제 글에서 할 수 있어요.</p>
      </article>

      <section className="cm-group" aria-label="댓글 목록">
        <div className="section-head">
          <h2>
            댓글 <span className="muted">{p.comments.length}</span>
          </h2>
        </div>
        {p.comments.length ? (
          <ul className="comments">
            {p.comments.map((c, i) => (
              <li key={i} className="comment">
                <p>{c.body}</p>
                <span className="post-meta">
                  <span>{authorLine(c.author)}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="fine">아직 댓글이 없어요.</p>
        )}
      </section>
    </div>
  );
}
