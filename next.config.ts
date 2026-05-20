import type { NextConfig } from "next";


/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 启用静态导出
  // 如果有图片优化，需要禁用或配置 unoptimized
  images: {
    unoptimized: true,
  },
  // 如果你的项目不是部署在域名根目录，需要设置 basePath
  // basePath: '/your-repo-name',
}

module.exports = nextConfig
