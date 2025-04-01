/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 允許從任何來源加載圖像
  images: {
    domains: ['*'],
  },
  // 配置環境變數
  env: {
    // 這裡的環境變數會在構建時被注入，不會暴露給客戶端
    // 客戶端需要的環境變數應該通過 API 路由獲取
  },
  // 配置靜態文件
  async rewrites() {
    return [
      // 將 API 請求重寫到 API 路由
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // 將根路徑重寫到 index.html
      {
        source: '/',
        destination: '/index.html',
      },
      // 將其他路徑重寫到對應的靜態文件
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
