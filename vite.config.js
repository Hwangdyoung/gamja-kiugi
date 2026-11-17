import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 상대 경로로 빌드해야 dist 폴더를 어디에 올려도(Artifact, 정적 호스팅) 그대로 열린다
  base: './',
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
  },
});
