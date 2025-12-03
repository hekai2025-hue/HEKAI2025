import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  // process.cwd() 在 vite 配置文件中通常是可用的，如果报错可以使用 process.cwd() || '.'
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // 定义全局常量替换
    define: {
      // 安全地注入 API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // 避免注入整个 process.env，因为包含系统变量可能导致崩溃
      // 如果有库依赖 process.env.NODE_ENV，Vite 默认已经处理了
      'process.env': {} 
    },
    server: {
      host: true, // 允许局域网访问
      port: 5173
    }
  }
})
