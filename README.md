# 我陪您禱告

這是一個基於聖經經文的情緒支持網站，可以根據用戶的情緒狀態提供相關的聖經經文、解說和禱告詞。

## 功能

- 動態生成情緒選項
- 根據選擇的情緒提供相關聖經經文
- 提供經文解說
- 生成禱告詞
- 支持禱告詞語音播放

## 技術架構

- HTML/CSS/JavaScript
- OpenAI API (GPT-4o-mini 用於生成內容, TTS-1 用於語音合成)

## 本地運行

1. 複製 `.env.example.js` 為 `.env.js`
2. 在 `.env.js` 中填入您的 OpenAI API 金鑰
3. 使用本地伺服器運行項目，例如：
   ```
   npx http-server
   ```
   或使用 VSCode 的 Live Server 擴展

## 部署到 Vercel

### 準備工作

1. 確保您已經有一個 GitHub 帳戶
2. 確保您已經有一個 Vercel 帳戶
3. 確保您有有效的 OpenAI API 金鑰

### 部署步驟

1. 在 GitHub 上創建一個新的倉庫
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/您的用戶名/您的倉庫名.git
   git push -u origin main
   ```

2. 在 Vercel 上導入該倉庫
   - 登錄 Vercel 控制台 (https://vercel.com)
   - 點擊 "Add New" > "Project"
   - 選擇您剛剛創建的 GitHub 倉庫
   - 點擊 "Import"

3. 配置環境變數
   - 在項目設置頁面，點擊 "Settings" > "Environment Variables"
   - 添加名為 `OPENAI_API_KEY` 的環境變數，值為您的 OpenAI API 金鑰
   - 點擊 "Save"

4. 部署項目
   - 返回 "Deployments" 頁面
   - 點擊 "Redeploy" 以使用新的環境變數重新部署項目
   - 等待部署完成，然後點擊 "Visit" 查看您的網站

### 重要說明

- 本項目已經配置為自動從 Vercel 環境變數中獲取 API 金鑰
- `.env.js` 文件僅用於本地開發，不會被上傳到 GitHub
- 如果您需要更新 API 金鑰，只需在 Vercel 控制台中更新環境變數，然後重新部署項目

## 注意事項

- `.env.js` 文件包含 API 金鑰，已添加到 `.gitignore` 中以避免上傳到公共倉庫
- 使用 `.env.example.js` 作為模板創建您自己的 `.env.js` 文件
- 在生產環境中，應該使用更安全的方式來管理 API 金鑰
