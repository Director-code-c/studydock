import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export function createClient() {
  if (!supabaseUrl) {
    throw new Error(
      "缺少环境变量 NEXT_PUBLIC_SUPABASE_URL，请在 .env.local 中配置 Supabase 项目地址。"
    )
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "缺少环境变量 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，请在 .env.local 中配置 Supabase Publishable Key。"
    )
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey)
}
