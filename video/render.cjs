/* 소개 영상 프레임 뽑기.
   node video/render.cjs stills 1 3 6 …   → 그 시각 장면을 still-<t>.png로
   node video/render.cjs frames            → 30fps 전 프레임을 frames/00000.png…
   PW=playwright 경로, OUT=저장 폴더, URL=개발 서버 주소 */
const { chromium } = require(process.env.PW || 'playwright');
const path = require('path');
const fs = require('fs');
const [mode = 'stills', ...rest] = process.argv.slice(2);
const OUT = process.env.OUT || path.join(__dirname, 'out');
const URL = process.env.URL || 'http://localhost:5173/video/index.html?render';
const FPS = 30;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(URL);
  await p.waitForFunction(() => window.__seek && document.fonts.status === 'loaded');
  await p.evaluate(() => document.fonts.load('40px Jua'));
  // 그림을 미리 다 불러 둔다 (모든 장면을 한 번씩 그려 봄)
  for (let s = 0; s < 40; s += 2) await p.evaluate((t) => window.__seek(t), s + 1);
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(800);
  const stage = p.locator('.stage');
  const snap = async (t, file) => {
    await p.evaluate((x) => window.__seek(x), t);
    await stage.screenshot({ path: file });
  };
  if (mode === 'stills') {
    for (const t of rest.map(Number)) await snap(t, path.join(OUT, `still-${t}.png`));
  } else {
    const dur = await p.evaluate(() => window.__DURATION);
    const n = Math.round(dur * FPS);
    for (let f = 0; f < n; f++) {
      await snap(f / FPS, path.join(OUT, `${String(f).padStart(5, '0')}.png`));
      if (f % 150 === 0) console.log(`frame ${f}/${n}`);
    }
  }
  await b.close();
})();
