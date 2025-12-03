mkdir -p src

cat > src/config.js << 'EOF'
require('dotenv').config();

// 验证必需的环境变量
const requiredEnvVars = ['API_KEY', 'SECRET_KEY'];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
  console.error('❌ FATAL ERROR: Missing required environment variables:');
  missingVars.forEach((varName) => console.error(`- ${varName}`));
  console.error('\nPlease create a .env file based on .env.example');
  process.exit(1);
}

// 安全导出配置
module.exports = {
  // API 配置
  api: {
    key: process.env.API_KEY,
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
    timeout: parseInt(process.env.API_TIMEOUT || '5000'),
  },
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  },
  
  // 应用配置
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
  },
  
  // 安全方法
  getApiKey: () => {
    if (process.env.NODE_ENV === 'production' && !process.env.API_KEY) {
      throw new Error('API_KEY is required in production');
    }
    return process.env.API_KEY || 'default_test_key';
  },
  
  // 检查是否安全
  isSecure: () => {
    return !(process.env.API_KEY && process.env.API_KEY.includes('your_actual_api_key'));
  }
};
EOF
