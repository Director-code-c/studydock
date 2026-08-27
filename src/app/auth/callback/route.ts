import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"

import { getSafeNextPath } from "@/lib/auth/next-path"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const nextPath = getSafeNextPath(url.searchParams.get("next"))
  const errorRedirect = new URL("/login", url.origin)
  errorRedirect.searchParams.set("error", "callback")
  errorRedirect.searchParams.set("next", nextPath)

  if (!code) {
    redirect(errorRedirect.toString())
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    redirect(errorRedirect.toString())
  }

  redirect(nextPath)
}
