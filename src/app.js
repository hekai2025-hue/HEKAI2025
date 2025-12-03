cat > src/app.js << 'EOF'
const config = require('./config');

// 安全启动检查
if (!config.isSecure()) {
  console.warn('⚠️ WARNING: Using placeholder API key. Replace with real key in .env file');
}

console.log('🚀 Application starting with secure configuration...');
console.log('Environment:', config.app.env);
console.log('Port:', config.app.port);
console.log('API Base URL:', config.api.baseUrl);

// 模拟API调用（安全方式）
function callExternalAPI() {
  const apiKey = config.getApiKey();
  
  // 在真实应用中，这里会使用 axios/fetch 调用外部API
  console.log('🔐 Making API call with key (masked):', apiKey.substring(0, 3) + '***');
  
  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: config.app.env
  };
}

// 启动应用
const apiResponse = callExternalAPI();
console.log('✅ API Response:', JSON.stringify(apiResponse, null, 2));

// 导出用于测试
module.exports = { callExternalAPI };
EOF
