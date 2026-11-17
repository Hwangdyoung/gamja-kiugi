import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// 이탈방지턱과 같은 Pretendard. 외부 CDN 없이 빌드에 함께 묶는다.
import 'pretendard/dist/web/variable/pretendardvariable.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
