# 静态部署指南

本项目已配置为支持静态部署，可以部署到 GitHub Pages、Netlify、Vercel 等静态托管平台。

## 本地构建测试

```bash
# 安装依赖
npm install

# 构建静态文件
npm run build

# 构建完成后，静态文件将生成在 out/ 目录
```

## GitHub Pages 部署

### 方式一：使用 GitHub Actions（推荐）

1. **启用 GitHub Pages**
   - 进入仓库的 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码到 main 分支**
   ```bash
   git add .
   git commit -m "配置静态部署"
   git push origin main
   ```

3. **自动部署**
   - GitHub Actions 会自动构建并部署到 GitHub Pages
   - 部署完成后，访问 `https://<username>.github.io/<repo-name>/`

### 方式二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **将 out/ 目录推送到 gh-pages 分支**
   ```bash
   git checkout -b gh-pages
   git add -f out/
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix out origin gh-pages
   ```

3. **在 GitHub 设置中启用 Pages**
   - Settings → Pages → Source 选择 "gh-pages" 分支

## Netlify 部署

1. **连接 GitHub 仓库**
   - 在 Netlify 中导入你的 GitHub 仓库

2. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `out`

3. **部署**
   - Netlify 会自动部署，每次推送代码都会触发重新部署

## Vercel 部署

1. **导入项目**
   - 在 Vercel 中导入你的 GitHub 仓库

2. **配置构建设置**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `out`

3. **部署**
   - Vercel 会自动部署

## 其他静态托管平台

对于任何支持静态文件托管的平台（如 Cloudflare Pages、Surge.sh 等），只需：

1. 运行 `npm run build`
2. 将 `out/` 目录的内容上传到托管平台

## 配置说明

### next.config.ts

```typescript
output: "export"  // 启用静态导出
images: {
  unoptimized: true  // 禁用图片优化（静态部署不支持）
}
```

### 如果部署到子路径

如果你的项目部署到子路径（如 `https://example.com/ip-calculator/`），需要修改 `next.config.ts`：

```typescript
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ip-calculator",  // 添加子路径
  images: {
    unoptimized: true,
  },
  // ...
};
```

## 注意事项

1. **API 路由**: 静态部署不支持 API 路由，本项目中的 `src/app/api/route.ts` 不会被包含在构建中
2. **图片优化**: 静态部署不支持 Next.js 的图片优化功能，已设置 `unoptimized: true`
3. **动态路由**: 静态部署不支持动态路由，本项目使用的是静态路由，无需修改
4. **数据库**: 本项目是纯前端应用，不需要数据库连接

## 验证部署

部署完成后，访问你的网站地址，确保：
- IPv4 计算器功能正常
- IPv6 计算器功能正常
- 主题切换功能正常
- 所有计算功能正常工作

## 故障排除

### 构建失败

- 检查 Node.js 版本是否为 18 或更高
- 删除 `node_modules` 和 `.next` 目录，重新安装依赖
- 检查是否有 TypeScript 错误（已配置忽略构建错误）

### 部署后页面空白

- 检查浏览器控制台是否有错误
- 确认所有静态文件都已正确上传
- 检查路径配置是否正确（特别是子路径部署）

### 主题切换不工作

- 确保浏览器支持 localStorage
- 检查是否有 JavaScript 错误
