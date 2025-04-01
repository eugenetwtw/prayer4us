// 環境變數配置檢查
// 此檔案只用於檢查API是否配置，不處理任何敏感信息

// 全局環境變數對象
window.ENV = window.ENV || {};

// 檢查API配置函數
async function checkApiConfig() {
  // 如果已經設置了環境變數，直接返回
  if (window.ENV.apiKeyConfigured !== undefined) {
    return window.ENV.apiKeyConfigured;
  }
  
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
    
    // 只檢查 apiKeyConfigured 屬性
    window.ENV.apiKeyConfigured = !!data.apiKeyConfigured;
    console.log(window.ENV.apiKeyConfigured ? 'API金鑰已配置' : 'API金鑰未配置');
    return window.ENV.apiKeyConfigured;
  } catch (error) {
    console.warn('無法檢查API配置:', error);
    window.ENV.apiKeyConfigured = false;
    return false;
  }
}

// 導出函數
window.checkApiConfig = checkApiConfig;
