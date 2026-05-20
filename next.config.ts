import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // 如果部署到 GitHub Pages 的子路径，需要设置 basePath
  basePath: "/ip-calculator",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
