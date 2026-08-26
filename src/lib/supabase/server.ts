import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// Thrown by next/headers when cookies are modified from a Server Component.
const COOKIE_WRITE_ERROR_MESSAGE =
  "Cookies can only be modified in a Server Action or Route Handler"

export async function createClient() {
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

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          // Server Components cannot write cookies; the proxy refreshes the
          // session before the request reaches them. Only this known case is
          // suppressed — any other error is rethrown.
          if (
            !(error instanceof Error) ||
            !error.message.includes(COOKIE_WRITE_ERROR_MESSAGE)
          ) {
            throw error
          }
        }
      },
    },
  })
}
