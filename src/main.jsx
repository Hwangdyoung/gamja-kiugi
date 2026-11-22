import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { isNativeApp } from './lib/nativeWidget.js';
// 이탈방지턱과 같은 Pretendard. 외부 CDN 없이 빌드에 함께 묶는다(글자 조각별로 나눠 필요한 조각만 받음).
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles.css';

// iPhone 앱 안에서는 폰 화면만 꽉 채운다 (시연 도구는 설정 시트에 있음)
if (isNativeApp()) document.documentElement.classList.add('native');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
