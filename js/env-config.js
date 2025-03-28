// 環境變數配置
// 此檔案用於處理本地開發和 Vercel 部署時的環境變數

// 檢測是否在 Vercel 環境中
const isVercel = typeof process !== 'undefined' && process.env && process.env.VERCEL;

// 全局環境變數對象
window.ENV = window.ENV || {};

// 獲取API金鑰函數
async function getApiKey() {
  // 如果已經設置了環境變數，直接返回
  if (window.ENV.OPENAI_API_KEY) {
    return window.ENV.OPENAI_API_KEY;
  }
  
  if (isVercel) {
    // 在 Vercel 環境中，從環境變數獲取 API 金鑰
    return process.env.OPENAI_API_KEY;
  } else {
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
}

// 導出 getApiKey 函數
window.getApiKey = getApiKey;
