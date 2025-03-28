// 環境變數配置
// 此檔案用於處理本地開發和 Vercel 部署時的環境變數

// 全局環境變數對象
window.ENV = window.ENV || {};

// 獲取API金鑰函數
async function getApiKey() {
  // 如果已經設置了環境變數，直接返回
  if (window.ENV.OPENAI_API_KEY) {
    return window.ENV.OPENAI_API_KEY;
  }
  
  // 在 Vercel 環境中，嘗試從 __NEXT_DATA__ 獲取環境變數
  // 這是 Vercel 注入到頁面的數據對象
  try {
    // 檢查是否在 Vercel 環境中
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('now.sh')) {
      
      // 嘗試從 Vercel 的 API 獲取環境變數
      const response = await fetch('/api/env');
      if (response.ok) {
        const data = await response.json();
        if (data.OPENAI_API_KEY) {
          window.ENV.OPENAI_API_KEY = data.OPENAI_API_KEY;
          return data.OPENAI_API_KEY;
        }
      }
    }
  } catch (error) {
    console.warn('無法從 Vercel 獲取環境變數:', error);
  }
  
  // 在本地環境中，嘗試從 window.ENV 獲取 API 金鑰
  // 這個對象應該在 .env.js 中被設置
  try {
    // 如果沒有設置，返回空字符串
    return window.ENV.OPENAI_API_KEY || '';
  } catch (error) {
    console.error('無法獲取環境變數:', error);
    return '';
  }
}

// 導出 getApiKey 函數
window.getApiKey = getApiKey;
