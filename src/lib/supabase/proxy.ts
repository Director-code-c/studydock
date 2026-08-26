import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export async function updateSession(request: NextRequest) {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，无法在 proxy 中刷新会话。"
    )
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Sync refreshed auth cookies back to the incoming request so Server
        // Components see the new session, and to the outgoing response so the
        // browser replaces the old cookies.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Do not run any code between createServerClient and getClaims(). This
  // validates the access token signature and refreshes the session when
  // needed. No redirects are performed yet — auth gating comes later.
  await supabase.auth.getClaims()

  return supabaseResponse
}
