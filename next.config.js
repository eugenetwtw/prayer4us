/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允許從任何來源加載圖像
  images: {
    domains: ['*'],
  },
  // 移除靜態導出配置，使用預設的 serverless 模式
  // 配置環境變數
  env: {
    // 這裡的環境變數會在構建時被注入，不會暴露給客戶端
    // 客戶端需要的環境變數應該通過 API 路由獲取
  },
};

module.exports = nextConfig;
