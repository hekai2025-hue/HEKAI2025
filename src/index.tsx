import { createRoot } from 'react-dom/client';
import App from './App';
import { verifyApiKey } from './utils/verifyEnv';

// 在开发环境中验证 API 密钥
if (process.env.NODE_ENV === 'development') {
  verifyApiKey();
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
