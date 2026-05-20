# IP 地址计算器

功能全面的 IP 地址计算与转换工具，支持 IPv4 和 IPv6 双栈网络计算。基于 Next.js 16 构建，纯前端静态应用，无需后端服务。

## 功能概览

### IPv4 工具（9 个）

#### 核心计算（4 个独立计算器）

| 工具 | 说明 |
|------|------|
| **网络IP地址计算器** | 输入 IP 地址和 CIDR 前缀，计算网络地址、广播地址、可用地址范围、子网掩码、IP 类别等 |
| **通过掩码位计算子网掩码** | 输入掩码位元数（如 /27），计算对应的子网掩码和可用地址数 |
| **通过掩码位转换子网掩码** | 输入掩码位元数，转换为十进制和十六进制格式的子网掩码 |
| **通过主机数计算子网掩码** | 输入需要的主机数量，自动计算满足需求的最小子网掩码 |

#### 子网工具（2 个联动计算器）

| 工具 | 说明 |
|------|------|
| **子网掩码计算器** | 支持选择网络类型（默认/A类/B类/C类），按子网IP数或主机数计算子网掩码。子网IP数与主机数互斥选择 |
| **网络/节点计算器** | 计算给定 IP 和子网掩码下的网络地址、节点地址和广播地址 |

#### 转换工具（3 个联动计算器）

| 工具 | 说明 |
|------|------|
| **子网掩码换算器** | 十进制子网掩码与掩码位元数互转，显示二进制格式 |
| **IP地址进制转换器** | IP 地址在十进制、十六进制、二进制及单十进制数值之间转换 |
| **子网掩码逆算器** | 计算子网掩码的通配符掩码（反码），同时展示二进制对比 |

> 子网工具和转换工具共享 IP 输入，点击「计算」后所有工具同步出结果。

### IPv6 工具（3 个）

| 工具 | 说明 |
|------|------|
| **IPV6 地址 ↔ 数字转换** | IPv6 地址与 128 位整数（BigInt）之间的双向转换 |
| **IPV6 扩展 ↔ 压缩转换** | IPv6 地址在完整展开格式与压缩格式（`::` 缩写）之间双向转换 |
| **IPV6 地址范围计算** | 输入 IPv6 地址和前缀长度（0–128 滑块），实时计算子网上下界，同时显示压缩和扩展格式 |

> IPv6 地址中的十六进制字母统一使用大写显示。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.3 | 应用框架（App Router） |
| React | 19 | UI 渲染 |
| TypeScript | 5 | 类型安全 |
| Tailwind CSS | 4 | 样式系统 |
| shadcn/ui | New York 风格 | UI 组件库 |
| next-themes | 0.4 | 日间/夜间主题切换 |
| Lucide React | 0.525 | 图标库 |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局：字体、ThemeProvider、元数据
│   ├── page.tsx            # 主页面：IPv4/IPv6 标签页、主题切换、页头页脚
│   ├── globals.css         # 全局样式：Tailwind + 亮色/暗色主题变量
│   └── api/route.ts        # API 示例（未使用）
├── components/
│   ├── ip-calculator/
│   │   ├── ipv4-calculators.tsx  # IPv4 全部 9 个计算器组件
│   │   └── ipv6-calculator.tsx   # IPv6 全部 3 个计算器组件
│   └── ui/                       # shadcn/ui 基础组件
├── hooks/                        # 自定义 Hooks（shadcn 默认）
└── lib/
    ├── ip-utils.ts               # IPv4/IPv6 纯计算逻辑（300 行）
    ├── utils.ts                  # cn() 工具函数
    └── db.ts                     # Prisma 数据库客户端（未使用）
```

## 核心代码说明

### `src/lib/ip-utils.ts` — 计算引擎

纯函数库，无 UI 依赖，所有网络计算逻辑集中于此。

**IPv4 函数：**

| 函数 | 功能 |
|------|------|
| `ipToInt(ip)` | IP 字符串 → 32 位无符号整数 |
| `intToIp(num)` | 32 位整数 → IP 字符串 |
| `prefixToMask(prefix)` | CIDR 前缀 → 子网掩码整数 |
| `maskToPrefix(mask)` | 子网掩码整数 → CIDR 前缀 |
| `calculateNetwork(ip, prefix)` | 计算完整网络信息（网络地址、广播地址、可用范围等） |
| `getIpClass(ipInt)` | 判断 IP 类别（A/B/C/D/E） |
| `hostsToPrefix(hostCount)` | 主机数 → 最小 CIDR 前缀 |
| `ipToBinary(ip)` | IP → 二进制字符串 |
| `ipToHex(ip)` | IP → 十六进制字符串 |
| `ipToDecimal(ip)` | IP → 单十进制数值 |
| `binaryToIp(binary)` | 二进制 → IP |
| `hexToIp(hex)` | 十六进制 → IP |
| `decimalToIp(dec)` | 单十进制 → IP |
| `getWildcardMask(maskInt)` | 子网掩码 → 通配符掩码 |
| `isValidIp(ip)` | 验证 IPv4 地址格式 |
| `isValidPrefix(prefix)` | 验证 CIDR 前缀范围 |

**IPv6 函数：**

| 函数 | 功能 |
|------|------|
| `ipv6ToBigInt(ipv6)` | IPv6 字符串 → 128 位 BigInt |
| `bigIntToIPv6(num)` | BigInt → IPv6 压缩格式 |
| `expandIPv6(ipv6)` | IPv6 → 完整展开格式 |
| `compressIPv6(ipv6)` | IPv6 → 最短压缩格式（RFC 5952） |
| `calculateIPv6Range(ipv6, prefix)` | 计算 IPv6 子网上下界 |
| `isValidIPv6(ipv6)` | 验证 IPv6 地址格式 |

### `src/components/ip-calculator/ipv4-calculators.tsx` — IPv4 界面

- **638 行**，包含 9 个计算器组件和 4 个共享 UI 组件
- 核心计算器（1-4）各自独立，输入框置于卡片标题栏右侧，紧凑布局
- 子网工具和转换器（5-9）共享 IP 输入和计算状态，联动计算
- 子网IP数与主机数下拉框互斥：选择其中一个会自动清空另一个
- 网络类型单选按钮（默认/A类/B类/C类）水平排列

### `src/components/ip-calculator/ipv6-calculator.tsx` — IPv6 界面

- **327 行**，包含 3 个计算器组件
- 地址范围计算器使用滑块控制前缀长度（0–128），实时联动计算
- 所有输入自动转大写，所有输出均为大写

## 运行方式

### 环境要求

- Node.js ≥ 18
- Bun（推荐）或 npm

### 开发模式

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev
```

访问 `http://localhost:3000` 查看页面。

### 生产构建

```bash
# 构建 standalone 产物
bun run build

# 启动生产服务器
node .next/standalone/server.js
```

> `next.config.ts` 中已配置 `output: "standalone"`，构建产物在 `.next/standalone/` 目录下，可独立部署。

## 界面特性

- **日间/夜间模式**：右上角太阳/月亮图标切换，支持跟随系统偏好
- **紧凑卡片布局**：输入框集成在卡片标题栏，结果区域使用 `bg-secondary/30 shadow-sm` 底色
- **联动计算**：IPv4 子网工具和转换器共享 IP 输入，一次计算全部出结果
- **右对齐等宽字体**：所有计算结果使用 `font-mono` 等宽字体右对齐显示
- **响应式设计**：核心计算器在宽屏下 2 列排列，转换工具在中等屏幕下 3 列排列

## 许可证

本项目由 Z.ai 生成。
