import { redirect } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { getAuthenticatedProfile } from "@/lib/supabase/session"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; error?: string }>
}) {
  const params = (await searchParams) ?? {}
  const next = typeof params.next === "string" ? params.next : "/dashboard"

  const currentUser = await getAuthenticatedProfile()
  if (currentUser) {
    redirect("/dashboard")
  }

  return (
    <LoginForm
      nextPath={next}
      initialError={params.error === "callback" ? "登录失败，请重新尝试。" : undefined}
    />
  )
}
