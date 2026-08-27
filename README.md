This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 数据库迁移

- 迁移文件位于 `supabase/migrations/`，按编号顺序命名，目前包含：
  - `0001_create_profiles.sql` — 创建 `public.profiles` 及相关 trigger / RLS。
  - `0002_create_courses.sql` — 创建 `public.courses` 及索引 / RLS / `updated_at` 触发器。
- 当前阶段通过 Supabase Dashboard 的 **SQL Editor** 手动执行：按编号顺序逐个粘贴文件内容并 Run。
- 每个迁移只执行一次：已成功执行的迁移**不要重复执行**，重复执行可能导致报错或数据异常。
- **不要把数据库密码、service_role key 或其他密钥写入任何 SQL 文件。**

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
