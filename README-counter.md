# 來訪計數系統 (Visit Counter System)

這個系統使用 Vercel Blob Storage 來追蹤網站的訪問次數和語音生成次數，按不同語言分類。

## 功能

- 追蹤總訪問次數
- 追蹤總語音生成次數
- 按語言分類的訪問次數（繁體中文、簡體中文、英文、日文、韓文）
- 按語言分類的語音生成次數

## Vercel 部署指南

### 1. 設置 Vercel Blob Storage

1. 在 Vercel Dashboard 中，導航到專案設定
2. 在 "Storage" 部分，選擇 "Blob"
3. 點擊 "Create" 按鈕創建新的 Blob Storage
4. Vercel 會自動在你的專案中設置所需的環境變數 (`BLOB_READ_WRITE_TOKEN`)

### 2. 推送代碼到 GitHub 並部署到 Vercel

1. 將所有代碼推送到 GitHub 存儲庫
2. 在 Vercel 中，導入該存儲庫作為新項目
3. Vercel 會自動部署應用程序並設置 API 路由

### 3. 讀取計數器數據

部署後，您可以通過以下 API 端點讀取計數器數據：

```
GET /api/counter
```

該端點將返回一個 JSON 對象，包含所有訪問和語音生成計數。

## 本地開發

1. 安裝依賴項：
   ```bash
   npm install @vercel/blob
   ```

2. 創建 `.env.local` 文件：
   - 複製 `.env.local.example` 到 `.env.local`
   - 已經在範例文件中提供了一個測試 token，可以直接使用
   - 也可以從 Vercel 儀表板獲取您自己的 token
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_IgsTykXAYVkLg05C_ttuhs0c8KsiFy1cuAFdaAd9lIPTK5Z
   ```

3. 運行開發服務器：
   ```bash
   npm run dev
   ```

## 計數器結構

計數器數據存儲為 JSON 對象，格式如下：

```json
{
  "total": {
    "visits": 123,
    "audioGenerated": 45
  },
  "languages": {
    "zh-Hant": {
      "visits": 50,
      "audioGenerated": 20
    },
    "zh-Hans": {
      "visits": 30,
      "audioGenerated": 10
    },
    "en": {
      "visits": 25,
      "audioGenerated": 8
    },
    "ja": {
      "visits": 10,
      "audioGenerated": 5
    },
    "ko": {
      "visits": 8,
      "audioGenerated": 2
    }
  }
}
```

## 技術說明

- 使用 Vercel Blob Storage 來持久化計數器數據
- 主要 API 端點位於 `pages/api/counter.js`
- 前端整合位於 `js/main.js`，自動記錄訪問和語音生成事件
