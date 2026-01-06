## 技术栈
nextjs

## 项目结构
finance-copilot-web
```
├── app/
│   ├── favicon.ico
│   ├── globals.css             # 全局样式（Tailwind CSS 配置）
│   ├── layout.tsx              # 应用的根布局组件
│   └── page.tsx                # 应用的主页面，集成了 ChatContainer
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── mockServiceWorker.js    # MSW Mock 服务 Worker
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── api/
│   │   ├── client.ts           # API 客户端配置
│   │   └── schema.json         # OpenAPI Schema 定义
│   ├── components/
│   │   └── chat/
│   │       ├── chat-container.tsx # 聊天主容器组件（布局、消息流、水印）
│   │       ├── chat-input.tsx     # 聊天输入框组件
│   │       ├── message-bubble.tsx # 消息气泡组件
│   │       └── quick-actions.tsx  # 快捷操作卡片组件
│   ├── constants/
│   │   └── flow.ts             # 报表录入流程的配置（步骤、文案、快捷操作）
│   ├── gen/
│   │   └── api-types.ts        # 自动生成的 API 类型定义
│   ├── hooks/
│   │   └── use-chat.ts         # 聊天逻辑 Hook（状态管理、步骤流转、模拟回复）
│   ├── lib/
│   │   └── utils.ts            # 通用工具函数（如 cn 类名合并）
│   ├── mocks/
│   │   ├── handlers/
│   │   │   └── hello.handler.ts
│   │   ├── MockProvider.tsx
│   │   ├── browser.ts
│   │   └── index.ts
│   └── types/
│       ├── business.ts         # 业务相关类型定义
│       └── chat.ts             # 聊天相关类型定义（Message, StepId, QuickAction 等）
├── .gitignore
├── README.md
├── eslint.config.mjs
├── instrumentation.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
└── tsconfig.json
```            
## 产品说明

```
**功能设计**
我要做的产品是录入报表，一个分为五个步骤依次是：“选择客户”->“填写基本信息”->“上传识别报表（非必要）”->“校验报表”->“完成录入”。
我计划把UI设计成对话问答式录入，我可以通过对话的形式完成录入，也可以通过对话的形式获取另外的信息（这个信息后续会拓展，暂时写死），
可以点击输入框顶部的卡片按钮进行快速发送获取到对应关键步骤的内容。
**UI设计**
UI设计规范只需要考虑Pc端的情况，交互逻辑需要考虑到用户的操作习惯。例如：用户可以通过点击卡片按钮快速获取到对应步骤的内容，也可以通过输入框输入文字进行正常的对话。
**动画设计**
需要一些动画效果来提升用户体验。例如：在用户点击卡片按钮时，卡片按钮会有一个缩放效果，提示用户这是一个可点击的区域。在用户输入文字后，输入框会有一个平滑的滚动效果，确保用户可以看到最新的消息。
**开发要求**
在写代码时，需要注释好每一个功能点，方便后续的维护和拓展。安装依赖统一使用pnpm安装。
--------
以上是产品的功能设计和UI设计规范，我需要根据这些规范开始开发。
**开始开发**

```