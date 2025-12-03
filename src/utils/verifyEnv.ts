export const verifyApiKey = (): boolean => {
  const key = process.env.API_KEY;
  
  // 检查 API_KEY 是否存在
  if (!key) {
    console.warn('⚠️ API_KEY is missing from environment variables');
    return false;
  }
  
  // 检查是否为占位符
  if (key === 'your_actual_api_key_here' || key.length < 10) {
    console.warn('⚠️ API_KEY appears to be a placeholder value');
    return false;
  }
  
  // 检查其他相关密钥
  const services = [
    { name: 'ALPHA_VANTAGE_API_KEY', value: process.env.ALPHA_VANTAGE_API_KEY },
    { name: 'IEX_CLOUD_API_KEY', value: process.env.IEX_CLOUD_API_KEY },
    { name: 'COINGECKO_API_KEY', value: process.env.COINGECKO_API_KEY }
  ];
  
  services.forEach(service => {
    if (!service.value) {
      console.warn(`⚠️ ${service.name} is missing`);
    }
  });
  
  console.log('✅ All API keys are properly configured');
  return true;
};
