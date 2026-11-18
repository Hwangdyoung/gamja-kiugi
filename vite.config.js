import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

/* 춘천 기회 데이터(src/data/opportunities.json)를 사이트의 /data/opportunities.json 으로도 내보낸다.
   앱은 켤 때 이 주소에서 최신 목록을 받는다(src/lib/opportunityData.js). 파일은 하나만 고치면 된다. */
const DATA_SRC = new URL('./src/data/opportunities.json', import.meta.url);
const opportunityFile = () => ({
  name: 'opportunity-data-file',
  configureServer(server) {
    server.middlewares.use('/data/opportunities.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(readFileSync(DATA_SRC));
    });
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'data/opportunities.json', source: readFileSync(DATA_SRC) });
  },
});

export default defineConfig({
  plugins: [react(), opportunityFile()],
  // 상대 경로로 빌드해야 dist 폴더를 어디에 올려도(Artifact, 정적 호스팅) 그대로 열린다
  base: './',
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
  },
});
