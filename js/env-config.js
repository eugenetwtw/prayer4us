// 環境變數配置
// 此檔案用於處理本地開發和 Vercel 部署時的環境變數

// 全局環境變數對象
window.ENV = window.ENV || {};

// 檢查API配置函數
async function checkApiConfig() {
  // 如果已經設置了環境變數，直接返回
  if (window.ENV.apiKeyConfigured !== undefined) {
    return window.ENV.apiKeyConfigured;
  }
  
  // 檢查是否在 Vercel 環境中
  const isVercelEnv = window.location.hostname.includes('vercel.app') || 
                      window.location.hostname.includes('now.sh') ||
                      !window.location.hostname.includes('localhost');
  
  if (isVercelEnv) {
    try {
      console.log('正在從 Next.js API 路由檢查環境變數...');
      
      // 使用完整的 URL 路徑，添加時間戳防止緩存
      const timestamp = new Date().getTime();
      const apiUrl = `${window.location.origin}/api/env?t=${timestamp}`;
      console.log('API URL:', apiUrl);
      
      // 嘗試從 Next.js API 路由獲取環境變數配置狀態
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.error(`API 回應錯誤: ${response.status}`, await response.text());
        throw new Error(`API 回應錯誤: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API 回應:', data);
      
      if (data.apiKeyConfigured) {
        console.log('API金鑰已配置');
        window.ENV.apiKeyConfigured = true;
        return true;
      } else {
        console.warn('API金鑰未配置');
        window.ENV.apiKeyConfigured = false;
        return false;
      }
    } catch (error) {
      console.warn('無法檢查API配置:', error);
      console.error('詳細錯誤:', error.message);
      window.ENV.apiKeyConfigured = false;
      return false;
    }
  } else {
    console.log('在本地環境中，使用 .env.js 中的環境變數');
    // 在本地環境中，如果有設置 OPENAI_API_KEY，則認為已配置
    window.ENV.apiKeyConfigured = !!window.ENV.OPENAI_API_KEY;
    return window.ENV.apiKeyConfigured;
  }
}

// 導出函數
window.checkApiConfig = checkApiConfig;
