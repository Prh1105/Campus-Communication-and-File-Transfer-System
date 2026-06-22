# Campus-Communication-and-File-Transfer-System

校园通信与文件传输系统 — 基于 Monorepo 架构的即时通讯与文件共享平台。

---

## 一、技术栈

| 层级     | 技术                          | 说明                   |
| -------- | ----------------------------- | ---------------------- |
| 包管理   | **pnpm** (v11+)               | 快速、节省磁盘的包管理 |
| 构建缓存 | **Turborepo**                 | 增量构建 & 并行任务    |
| 后端框架 | **NestJS** (TypeScript)       | 模块化企业级 Node 框架 |
| 前端框架 | **React 18+** + **Vite** 5+   | 快速 HMR 和现代化打包  |
| 数据库   | **PostgreSQL**                | 关系型数据库           |
| ORM      | **Prisma** (推荐，类型安全)   | 替代 TypeORM           |
| 共享代码 | `packages/shared`             | 类型定义 & 工具函数    |
| 即时通信 | **WebSocket** (Socket.io)     | 双向实时通信           |
| 认证     | **JWT** + Passport            | 无状态身份认证         |
| 样式     | **Tailwind CSS**              | 原子化 CSS 框架        |

---

## 二、项目目录结构

```
campus-system/
├── apps/
│   ├── backend/                 # NestJS 后端服务
│   │   ├── src/
│   │   │   ├── main.ts          # 应用入口
│   │   │   ├── app.module.ts    # 根模块
│   │   │   ├── auth/            # 认证模块 (JWT + Passport)
│   │   │   ├── chat/            # 聊天模块 (WebSocket Gateway)
│   │   │   ├── file/            # 文件上传模块
│   │   │   ├── user/            # 用户模块
│   │   │   └── prisma/          # Prisma 服务
│   │   ├── prisma/
│   │   │   └── schema.prisma    # 数据库模型定义
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/                # React 前端应用
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/      # 通用组件
│       │   ├── pages/           # 页面组件
│       │   ├── hooks/           # 自定义 Hooks
│       │   ├── services/        # API 客户端 & Socket
│       │   └── styles/          # 全局样式
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
├── packages/
│   └── shared/                  # 共享类型定义
│       ├── src/
│       │   ├── index.ts
│       │   └── types/
│       │       ├── chat.ts      # User, Message, Room 类型
│       │       ├── file.ts      # FileUpload 类型
│       │       └── api.ts       # API 请求/响应类型
│       ├── package.json
│       └── tsconfig.json
├── .env                         # 环境变量（不提交到 Git）
├── .gitignore
├── package.json                 # 根工作空间配置
├── pnpm-workspace.yaml          # pnpm 工作空间定义
└── turbo.json                   # Turborepo 流水线配置
```

---

## 三、从零搭建流程（已修正）

### 前置条件

- **Node.js** v18+
- **pnpm** v9+（安装：`npm install -g pnpm`）
- **Docker** Desktop（用于运行 PostgreSQL，可选）
- **Git**

### 步骤 1：克隆项目 & 安装根依赖

```bash
git clone <your-repo-url>
cd campus-system
pnpm install
```

### 步骤 2：验证 pnpm 工作空间配置

确认根目录 `pnpm-workspace.yaml` 内容为：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

> ⚠️ **常见错误**：不要写成 `app/*`（少了 `s`），否则 `apps/backend` 和 `apps/frontend` 不会被识别。

### 步骤 3：创建 NestJS 后端

```bash
# 回到根目录，进入 apps 目录
cd apps

# ✅ 正确命令：使用 @nestjs/cli（不是 @nestjs/backend！）
# 注意：必须用 pnpm dlx 而非 npx，因为 devEngines 强制要求 pnpm
pnpm dlx @nestjs/cli new backend --package-manager pnpm --skip-git

# 进入后端目录安装依赖
cd backend

# WebSocket 支持
pnpm add @nestjs/websockets @nestjs/platform-socket.io

# 认证模块
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt

# Prisma（数据库 ORM）
pnpm add prisma @prisma/client
pnpm add -D prisma

# 环境变量
pnpm add @nestjs/config

# 文件上传
pnpm add @nestjs/platform-express multer
pnpm add -D @types/multer

# 回到根目录
cd ../..
```

> ⚠️ **常见错误**：网上有些教程写 `pnpm create @nestjs/backend`，但 NestJS 的 create 包是 `@nestjs/cli`，不是 `@nestjs/backend`。

配置 `apps/backend/tsconfig.json` 路径别名：

```json
{
  "compilerOptions": {
    "paths": {
      "@campus-im/shared": ["../../packages/shared/src"],
      "@/*": ["./src/*"]
    }
  }
}
```

### 步骤 4：创建 React 前端

```bash
# 确保已在项目根目录
cd apps

# 使用 Vite 官方模板创建 React + TypeScript 项目
pnpm create vite frontend --template react-ts

cd frontend

# 核心依赖
pnpm add axios socket.io-client react-router-dom

# Tailwind CSS（锁定 v3 稳定版）
pnpm add -D tailwindcss@3 postcss autoprefixer

# 初始化 Tailwind 配置
pnpm dlx tailwindcss init -p

# 回到根目录
cd ../..
```

配置 `apps/frontend/vite.config.ts`（API 代理 + WebSocket 代理）：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@campus-im/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
```

### 步骤 5：创建共享代码包

```bash
# 确保在根目录
mkdir -p packages/shared/src/types
cd packages/shared

# 初始化包
pnpm init

# 回到根目录
cd ../..
```

修改 `packages/shared/package.json`：

```json
{
  "name": "@campus-im/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {}
}
```

创建 `packages/shared/src/index.ts`（导出入口）：

```typescript
export * from './types/chat'
export * from './types/file'
export * from './types/api'
```

创建 `packages/shared/src/types/chat.ts`（聊天相关类型）：

```typescript
// ========== 用户 ==========
export interface User {
  id: number
  username: string
  displayName: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeenAt?: string
}

export interface AuthUser extends User {
  email: string
  createdAt: string
}

// ========== 消息 ==========
export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface Message {
  id: number
  senderId: number
  receiverId: number
  roomId?: number
  content: string
  type: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: string
}

export interface SendMessageDto {
  receiverId: number
  content: string
  type: MessageType
  fileUrl?: string
}

// ========== 房间/群组 ==========
export interface Room {
  id: number
  name: string
  avatar?: string
  isGroup: boolean
  memberIds: number[]
  lastMessage?: Message
  createdAt: string
}

// ========== WebSocket 事件 ==========
export enum WsEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  SEND_MESSAGE = 'sendMessage',
  RECEIVE_MESSAGE = 'receiveMessage',
  USER_ONLINE = 'userOnline',
  USER_OFFLINE = 'userOffline',
  TYPING = 'typing',
  STOP_TYPING = 'stopTyping',
}
```

创建 `packages/shared/src/types/file.ts`：

```typescript
export interface FileInfo {
  id: number
  originalName: string
  fileName: string
  mimeType: string
  size: number
  url: string
  uploadedById: number
  createdAt: string
}

export interface UploadProgress {
  fileName: string
  progress: number // 0-100
  status: 'uploading' | 'completed' | 'failed'
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/vnd.rar',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
```

创建 `packages/shared/src/types/api.ts`：

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  password: string
  displayName: string
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
```

### 步骤 6：关联工作空间依赖

在 `apps/backend/package.json` 中添加：

```json
{
  "dependencies": {
    "@campus-im/shared": "workspace:*"
  }
}
```

在 `apps/frontend/package.json` 中添加：

```json
{
  "dependencies": {
    "@campus-im/shared": "workspace:*"
  }
}
```

### 步骤 7：配置 Turborepo

确认根目录 `turbo.json`（已修正，移除了 Next.js 的 `.next/**`）：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

> ⚠️ **常见错误**：不要写 `".next/**"` — 这是 Next.js 的输出目录，Vite + NestJS 项目不需要它。

### 步骤 8：配置数据库（Prisma）

```bash
cd apps/backend

# 初始化 Prisma（若尚未执行）
pnpm dlx prisma init --datasource-provider postgresql
```

修改 `apps/backend/prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int       @id @default(autoincrement())
  username     String    @unique
  email        String    @unique
  displayName  String
  password     String
  avatar       String?
  status       String    @default("offline")   // online | offline | away
  lastSeenAt   DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // 关系
  sentMessages     Message[]       @relation("SentMessages")
  receivedMessages Message[]       @relation("ReceivedMessages")
  uploadedFiles    FileInfo[]
  rooms            RoomMember[]
}

model Message {
  id         Int      @id @default(autoincrement())
  content    String
  type       String   @default("text")    // text | image | file | system
  fileUrl    String?
  fileName   String?
  fileSize   Int?

  // 发送方
  sender     User     @relation("SentMessages", fields: [senderId], references: [id])
  senderId   Int

  // 接收方 (私聊)
  receiver   User?    @relation("ReceivedMessages", fields: [receiverId], references: [id])
  receiverId Int?

  // 群聊 (可选)
  room       Room?    @relation(fields: [roomId], references: [id])
  roomId     Int?

  createdAt  DateTime @default(now())
}

model Room {
  id        Int      @id @default(autoincrement())
  name      String
  avatar    String?
  isGroup   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   RoomMember[]
  messages  Message[]
}

model RoomMember {
  id       Int      @id @default(autoincrement())
  user     User     @relation(fields: [userId], references: [id])
  userId   Int
  room     Room     @relation(fields: [roomId], references: [id])
  roomId   Int
  joinedAt DateTime @default(now())

  @@unique([userId, roomId])
}

model FileInfo {
  id           Int      @id @default(autoincrement())
  originalName String
  fileName     String
  mimeType     String
  size         Int
  url          String
  uploadedBy   User     @relation(fields: [uploadedById], references: [id])
  uploadedById Int
  createdAt    DateTime @default(now())
}
```

> ⚠️ **注意**：PostgreSQL 中 `User` 是保留关键字。Prisma 会自动处理引用，但如果手写 SQL 需要用 `"User"` 双引号包裹。

### 步骤 9：配置环境变量

根目录 `.env`（不提交到 Git，已在 `.gitignore` 中）：

```env
# ========== 数据库 ==========
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/campus_im?schema=public

# ========== 后端 ==========
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_min_32_chars_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# ========== 文件上传 ==========
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# ========== 前端（Vite 通过 define 注入） ==========
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 步骤 10：配置后端 NestJS 入口

`apps/backend/src/main.ts` 基础模板：

```typescript
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  // CORS（开发环境）
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })

  // API 全局前缀
  app.setGlobalPrefix('api')

  const port = config.get<number>('PORT', 3000)
  await app.listen(port)
  console.log(`🚀 Backend running on http://localhost:${port}`)
}

bootstrap()
```

### 步骤 11：启动开发环境

```bash
# 1. 安装所有工作空间依赖（根目录执行）
pnpm install

# 2. 启动 PostgreSQL（二选一）
# 选项 A：使用 Docker
docker run --name campus-im-db \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  --restart unless-stopped \
  -d postgres:16

# 选项 B：本地安装的 PostgreSQL
# 创建数据库：CREATE DATABASE campus_im;

# 3. 数据库迁移 + 生成 Prisma Client
cd apps/backend
pnpm dlx prisma migrate dev --name init
pnpm dlx prisma generate
cd ../..

# 4. 同时启动前后端（根目录）
pnpm dev
```

访问地址：
- 前端：http://localhost:5173
- 后端 API：http://localhost:3000/api
- WebSocket：ws://localhost:3000

---

## 四、四人协作分工策略

| 成员              | 主要职责                                       | 关键文件                                       |
| ----------------- | ---------------------------------------------- | ---------------------------------------------- |
| **A（后端架构）** | NestJS 核心架构、Auth 模块、Prisma Schema 设计 | `apps/backend/src/auth/`, `prisma/schema.prisma` |
| **B（聊天后端）** | WebSocket Gateway、房间管理、消息存储 & 推送   | `apps/backend/src/chat/`, `src/message/`        |
| **C（全栈+共享）** | `packages/shared` 类型定义、API Client、上传接口 | `packages/shared/`, `apps/backend/src/file/`    |
| **D（前端）**     | React 页面 & 组件、Socket 连接、Tailwind UI    | `apps/frontend/src/`                           |

### 协作规范

1. **分支策略**：每个人从 `main` 创建 `feature/<模块名>` 分支工作
2. **共享包修改先行**：修改 `packages/shared` 后，优先合并到 `main`，其他人再拉取
3. **合并前检查**：
   ```bash
   pnpm build        # 确保全量编译通过
   pnpm lint         # 确保 Lint 通过
   ```
4. **提交规范**：使用 Conventional Commits（`feat:`, `fix:`, `chore:`, `docs:` 等）
5. **CR 机制**：后端代码由人A Review，前端代码由人D Review，shared 包变更全员 Review

---

## 五、常见问题与解决方案

### 1. 前后端依赖版本冲突

**问题**：前后端需要不同版本的 `axios` / `typescript`。
**解决**：pnpm 的 `workspace:*` 协议仅在共享包中生效，各自的 `dependencies` 是隔离的。如有全局冲突，在 `pnpm-workspace.yaml` 中使用 `overrides`：

```yaml
overrides:
  typescript: "^5.4.0"
```

### 2. 环境变量共享

**问题**：前后端需要同一个环境变量。
**解决**：根目录 `.env` 放公共变量；`apps/backend/.env` 和 `apps/frontend/.env` 放各自独有变量。前端通过 `vite.config.ts` 的 `define` 注入：

```typescript
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
}
```

### 3. 热重载（HMR）慢

**问题**：Monorepo 变大后 `dev` 变慢。
**解决**：
- Turborepo 缓存了构建结果，只编译变更的包
- 可以在 `turbo.json` 中给 `dev` 任务添加 `inputs` 限制监听范围
- 只启动你需要的服务：`pnpm dev --filter frontend`

### 4. 只构建/部署单个应用

```bash
pnpm build --filter backend     # 只构建后端
pnpm build --filter frontend    # 只构建前端
pnpm dev --filter frontend      # 只启动前端开发服务器
```

### 5. Prisma Client 未生成

**症状**：`@prisma/client` 导入报错。
**解决**：
```bash
cd apps/backend && pnpm dlx prisma generate
```

### 6. WebSocket 连接失败（CORS）

**症状**：浏览器 Console 显示 WebSocket CORS 错误。
**解决**：在 NestJS 的 WebSocket Gateway 中配置 CORS：

```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
})
```

### 7. 工作空间包找不到

**症状**：`Cannot find module '@campus-im/shared'`。
**解决**：
1. 确认 `pnpm-workspace.yaml` 中写的是 `apps/*`（不是 `app/*`）
2. 重新执行 `pnpm install`

---

## 六、可用脚本速查

| 命令                           | 说明                            |
| ------------------------------ | ------------------------------- |
| `pnpm dev`                     | 并行启动所有服务的开发模式      |
| `pnpm build`                   | 构建所有包                      |
| `pnpm lint`                    | 对所有包运行 Lint               |
| `pnpm setup`                   | 一键初始化（安装→迁移→生成）    |
| `pnpm clean`                   | 清理所有 node_modules 和构建产物 |
| `pnpm start:db`                | Docker 启动 PostgreSQL          |
| `pnpm dev --filter frontend`   | 只启动前端                      |
| `pnpm dev --filter backend`    | 只启动后端                      |
| `pnpm add X --filter frontend` | 给前端安装依赖                  |
| `pnpm add X --filter backend`  | 给后端安装依赖                  |

---

## 七、验收检查清单

部署前逐项确认：

- [ ] `pnpm install` 根目录执行无报错
- [ ] `pnpm dev` 能同时启动前端（5173）和后端（3000）
- [ ] `apps/backend/prisma/schema.prisma` 已定义 User、Message、Room、FileInfo 表
- [ ] `pnpm build` 全量编译通过（无类型错误）
- [ ] 前端 `import { User } from '@campus-im/shared'` 可正常导入类型
- [ ] WebSocket 连接成功（浏览器 Network → WS 标签 → 101 Switching Protocols）
- [ ] 文件上传接口 `POST /api/files` 正常工作
- [ ] JWT 登录流程（login → 返回 token → 携带 token 访问受保护接口）通顺
- [ ] 断线重连：关掉后端 → 前端 UI 显示"连接断开" → 重启后端 → 前端自动恢复连接
- [ ] `.env` 未被 Git 追踪（`git status` 中无 .env）
- [ ] `pnpm-workspace.yaml` 中写的是 `apps/*` 而非 `app/*`

---

## 八、审查修正记录

以下是在原计划中发现并已修正的问题：

| # | 问题 | 严重程度 | 修正 |
|---|------|----------|------|
| 1 | `pnpm-workspace.yaml` 写成了 `app/*`（少 `s`） | 🔴 致命 | 改为 `apps/*` |
| 2 | NestJS 创建命令 `@nestjs/backend` 不存在 | 🔴 致命 | 改为 `pnpm dlx @nestjs/cli new backend` |
| 3 | `turbo.json` 中包含 Next.js 的 `.next/**` 输出 | 🟡 中等 | 移除 `.next/**`，仅保留 `dist/**` |
| 4 | 根 `package.json` 缺少 `"private": true` | 🟡 中等 | 已添加 |
| 5 | 步骤间目录跳转混乱（`cd apps` 未先回根目录） | 🟡 中等 | 每个步骤末尾加 `cd ../..` |
| 6 | `main: "index.js"` 是多余字段 | 🟢 轻微 | 已移除 |
| 7 | `.gitignore` 为空，`.env` 有被提交风险 | 🟢 轻微 | 已创建完整 `.gitignore` |
| 8 | `type: "module"` 在根 `package.json` 可能干扰 NestJS | 🟢 轻微 | 移至各子包独立配置 |
| 9 | Prisma Schema 中 `User` 是 PostgreSQL 保留字 | 🟢 提示 | 添加注释提醒 |
