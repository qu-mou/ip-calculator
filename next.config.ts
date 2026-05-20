import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",           // 改为静态导出，适配 GitHub Pages
  distDir: "dist",            // 可选：自定义输出目录（默认是 out）
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,        // 静态导出必须禁用图片优化服务器
  },
  // 如果你的仓库名不是 username.github.io，需要设置 basePath
  // 例如仓库名为 my-project，则 basePath: "/my-project"
  basePath: process.env.NODE_ENV === "production" ? "/ip-calculator" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/ip-calculator" : "",
};

export default nextConfig;
