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
  
  // 嘗試載入本地環境變數（僅用於開發環境）
  if (window.location.hostname.includes('localhost')) {
    try {
      // 嘗試動態載入本地環境變數文件
      const envScript = document.createElement('script');
      envScript.src = '.env.js';
      envScript.async = false;
      document.head.appendChild(envScript);
    } catch (e) {
      // 本地環境變數載入失敗，忽略錯誤
    }
  }
  
  // 檢查是否在 Vercel 環境中
  const isVercelEnv = window.location.hostname.includes('vercel.app') || 
                      window.location.hostname.includes('now.sh') ||
                      !window.location.hostname.includes('localhost');
  
  // 如果在 Vercel 環境中，從 API 獲取環境變數
  if (isVercelEnv) {
    try {
      // 使用完整的 URL 路徑
      const apiUrl = `${window.location.origin}/api/env`;
      
      // 嘗試從 Next.js API 路由獲取環境變數
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.OPENAI_API_KEY) {
        window.ENV.OPENAI_API_KEY = data.OPENAI_API_KEY;
        return data.OPENAI_API_KEY;
      } else {
        // API 回應中沒有 OPENAI_API_KEY
      }
    } catch (error) {
      // 無法從 API 獲取環境變數
    }
  } else {
    // 在本地環境中，使用 .env.js 中的環境變數
  }
  
  // 返回本地環境變數或空字符串
  return window.ENV.OPENAI_API_KEY || '';
}

// 導出 getApiKey 函數
window.getApiKey = getApiKey;
