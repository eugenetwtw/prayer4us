# Pray with You, Prayer for us

This is an emotional support website based on Bible verses, which can provide relevant Bible verses, explanations, and prayers according to the user's emotional state.

## Features

- Dynamically generate emotion options
- Provide relevant Bible verses based on the selected emotion
- Offer verse explanations
- Generate prayers
- Support voice playback of prayers

## Technical Architecture

- HTML/CSS/JavaScript
- OpenAI API (GPT-4o-mini for content generation, TTS-1 for speech synthesis)

## Local Setup

1. Copy `.env.example.js` to `.env.js`
2. Fill in your OpenAI API key in `.env.js`
3. Run the project using a local server, for example:
   ```
   npx http-server
   ```
   or use the Live Server extension in VSCode

## Deploy to Vercel

### Prerequisites

1. Ensure you have a GitHub account
2. Ensure you have a Vercel account
3. Ensure you have a valid OpenAI API key

### Deployment Steps

1. Create a new repository on GitHub
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

2. Import the repository on Vercel
   - Log in to the Vercel dashboard (https://vercel.com)
   - Click "Add New" > "Project"
   - Select the GitHub repository you just created
   - Click "Import"
   - On the project settings page, ensure:
     - Framework Preset: Select "Next.js"
     - Build Command: `npm run build` (should be auto-filled)
     - Output Directory: `.next` (should be auto-filled)
     - Install Command: `npm install` (should be auto-filled)

3. Configure environment variables
   - During the import process, or after the project is imported:
     - Click "Settings" > "Environment Variables"
     - Add a new environment variable:
       - Name: `OPENAI_API_KEY`
       - Value: Your OpenAI API key
       - Environments: Production, Preview, Development (select all)
     - Click "Save"
   - **Important Note**:
     - Ensure the environment variable name exactly matches `OPENAI_API_KEY`, without `@` symbols or other prefixes
     - Environment variables are case-sensitive, so ensure an exact match

4. Deploy the project
   - If you added environment variables after importing the project, go back to the "Deployments" page
   - Click "Redeploy" to redeploy the project with the new environment variables
   - Wait for the deployment to complete, then click "Visit" to view your website

5. Test API routes
   - After deployment, visit `https://your-website-domain/api/env` to confirm the API route is working
   - If JSON data is returned, the API route is functioning correctly
   - If a 404 error is returned, check Vercel logs to troubleshoot the issue

6. Troubleshooting
   - If the website doesn’t work properly after deployment:
     - Check the browser console for error messages
     - Verify that environment variables are correctly set
     - View build logs and function logs in the Vercel dashboard
     - Try directly accessing the API route `/api/env` to see if data is returned
     - If the API route isn’t working, try redeploying the project

### Important Notes

- This project is configured to automatically retrieve the API key from Vercel environment variables
- The project uses an API route (`/api/env`) to securely expose environment variables to the frontend
- The `.env.js` file is only used for local development and will not be uploaded to GitHub
- If you need to update the API key, simply update the environment variable in the Vercel dashboard and redeploy the project

### Technical Implementation Notes

- In the Vercel deployment, environment variables are securely exposed to the frontend via an API route (`/api/env.js`)
- The API route is a Vercel serverless function that only returns specific environment variables needed by the frontend
- The frontend code detects whether it’s running in a Vercel environment and retrieves environment variables from the API or locally as appropriate

## Notes

- Use `.env.example.js` as a template to create your own `.env.js` file
- In a production environment, a more secure method should be used to manage API keys

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
   - 在項目設置頁面，確保：
     - 框架預設：選擇 "Next.js"
     - 構建命令：`npm run build` (應該已自動填寫)
     - 輸出目錄：`.next` (應該已自動填寫)
     - 安裝命令：`npm install` (應該已自動填寫)

3. 配置環境變數
   - 在導入項目過程中，或在項目導入後：
     - 點擊 "Settings" > "Environment Variables"
     - 添加一個新的環境變數：
       - 名稱：`OPENAI_API_KEY`
       - 值：您的 OpenAI API 金鑰
       - 環境：Production, Preview, Development (全選)
     - 點擊 "Save"
   - **重要提示**：
     - 確保環境變數名稱完全匹配 `OPENAI_API_KEY`，不要使用 `@` 符號或其他前綴
     - 環境變數區分大小寫，請確保完全匹配

4. 部署項目
   - 如果您是在項目導入後添加的環境變數，請返回 "Deployments" 頁面
   - 點擊 "Redeploy" 以使用新的環境變數重新部署項目
   - 等待部署完成，然後點擊 "Visit" 查看您的網站

5. 測試 API 路由
   - 部署完成後，訪問 `https://您的網站域名/api/env` 確認 API 路由是否正常工作
   - 如果返回 JSON 數據，說明 API 路由工作正常
   - 如果返回 404 錯誤，可能需要檢查 Vercel 的日誌以排查問題

6. 故障排除
   - 如果部署後網站無法正常工作：
     - 檢查瀏覽器控制台是否有錯誤信息
     - 確認環境變數已正確設置
     - 在 Vercel 控制台中查看構建日誌和函數日誌
     - 嘗試直接訪問 API 路由 `/api/env` 檢查是否返回數據
     - 如果 API 路由不工作，嘗試重新部署項目

### 重要說明

- 本項目已經配置為自動從 Vercel 環境變數中獲取 API 金鑰
- 項目使用 API 路由 (`/api/env`) 安全地將環境變數暴露給前端
- `.env.js` 文件僅用於本地開發，不會被上傳到 GitHub
- 如果您需要更新 API 金鑰，只需在 Vercel 控制台中更新環境變數，然後重新部署項目

### 技術實現說明

- 在 Vercel 部署中，環境變數通過 API 路由 (`/api/env.js`) 安全地暴露給前端
- API 路由是一個 Vercel 無伺服器函數，只返回前端需要的特定環境變數
- 前端代碼會檢測是否在 Vercel 環境中，並相應地從 API 或本地獲取環境變數

## 注意事項

- 使用 `.env.example.js` 作為模板創建您自己的 `.env.js` 文件
- 在生產環境中，應該使用更安全的方式來管理 API 金鑰
