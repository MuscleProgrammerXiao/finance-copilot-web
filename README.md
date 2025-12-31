This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 项目结构
finance-copilot

my-finance-copilot/
├── app/                        # Next.js 15 核心路由 (App Router)
│   ├── api/                    # 真实的后端路由 (如：OCR 处理、报告导出)
│   │   ├── ocr/route.ts
│   │   └── report/route.ts
│   ├── layout.tsx              # 全局布局 (放置 Providers)
│   └── page.tsx                # 聊天主页面
├── src/                        # 源代码目录
│   ├── api/                    # OpenAPI 定义与请求层
│   │   ├── schema.json         # OpenAPI 原始定义文档
│   │   └── client.ts           # 封装好的请求客户端 (axios 或 fetch)
│   ├── gen/                    # 自动生成的 TypeScript 类型
│   │   └── api-types.ts        # 由 openapi-typescript 生成的类型定义
│   ├── components/             # 组件库
│   │   ├── chat/               # 聊天相关 (MessageBubble, QuickActions)
│   │   ├── layout/             # 布局 (Header, FullscreenModal)
│   │   ├── ui/                 # 原子组件 (shadcn/ui 如：Button, Input)
│   │   └── widgets/            # 业务组件 (ClientList, BasicForm, OCRResult)
│   ├── hooks/                  # 自定义 Hooks (useChatFlow, useScroll)
│   ├── lib/                    # 工具类与库配置 (utils.ts, axios.ts)
│   ├── mocks/                  # MSW 模拟逻辑中心
│   │   ├── handlers/           # 模拟接口响应 (ocr.handler.ts, client.handler.ts)
│   │   ├── browser.ts          # 浏览器端拦截配置
│   │   ├── server.ts           # 服务端拦截配置 (用于 SSR/Server Actions)
│   │   └── index.ts            # 统一导出初始化入口
│   ├── services/               # 业务逻辑服务层 (调用 gen 中的请求函数)
│   ├── styles/                 # 全局样式 (globals.css)
│   └── types/                  # 手动定义的业务 TypeScript 类型
├── public/                     # 静态资源
│   ├── mockServiceWorker.js    # MSW 初始化生成的 Service Worker
│   └── images/                 # 图标、图片资源
├── instrumentation.ts          #  Next.js 服务端 Mock 激活脚本
├── next.config.ts              # Next.js 配置文件
├── package.json                # 项目依赖与 Scripts
└── tsconfig.json               # TypeScript 配置 (需包含 @/* 路径别名)            