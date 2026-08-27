# StudyDock

StudyDock 是一个个人学习工作台，用于管理课程、学习资料与项目。

## Windows 桌面版

StudyDock Windows 版采用 **Tauri 2 + WebView2** 作为轻量桌面外壳，正式构建加载线上应用：

```text
https://studydock-two.vercel.app
```

桌面应用不内置 Supabase URL、Publishable Key、密码、access token 或 refresh token。认证仍由网页端 Supabase SSR 和 Cookie 会话负责。

### 使用说明

- 首次启动需要联网，以加载线上应用并完成登录。
- WebView2 使用默认持久用户数据目录，因此 Cookie、IndexedDB 和 service worker 数据不会在每次启动时清空。
- 用户未主动退出时，Supabase refresh token 有效期间会继续保持登录。
- 在线打开课程页并成功加载后，会保存最近课程的只读本地快照。
- 离线时只能查看最近缓存的课程，不支持离线创建、编辑、归档、恢复、删除或同步。
- 主动退出会清理当前用户的离线课程快照，并执行网页端 `signOut`。

### 本地 Tauri 构建环境

本地 Windows 构建需要：

- Rust stable toolchain
- Visual Studio C++ Build Tools（MSVC）
- WebView2 Runtime
- Node.js 与 npm

开发模式：

```bash
npm run dev
npm run tauri:dev
```

生产构建：

```bash
npm run tauri:build
```

### 推荐构建方式

推荐通过 GitHub Actions 手动生成 Windows 安装包：

1. 打开仓库的 **Actions**。
2. 选择 **Build StudyDock Windows**。
3. 点击 **Run workflow**。
4. 从 workflow artifact `StudyDock-Windows` 下载 NSIS `.exe`（以及配置生成的 MSI）。

本流程不会自动创建公开 GitHub Release，也不会把 `.env.local` 或 Supabase 密钥加入构建流程。不要将环境变量、密钥或用户认证信息打包进桌面应用。

## Web 开发

安装依赖并启动开发服务器：

```bash
npm ci
npm run dev
```

打开 <http://localhost:3000>。

常用检查：

```bash
npm run lint
npm run build
```

## 数据库迁移

迁移文件位于 `supabase/migrations/`，按编号顺序命名，目前包含：

- `0001_create_profiles.sql` — 创建 `public.profiles` 及相关 trigger / RLS。
- `0002_create_courses.sql` — 创建 `public.courses` 及索引 / RLS / `updated_at` 触发器。

当前阶段通过 Supabase Dashboard 的 **SQL Editor** 手动执行：按编号顺序逐个粘贴文件内容并 Run。每个迁移只执行一次，已成功执行的迁移不要重复执行。
