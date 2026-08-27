import { redirect } from "next/navigation"

import { RegisterForm } from "@/components/auth/register-form"
import { getAuthenticatedProfile } from "@/lib/supabase/session"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>
}) {
  const params = (await searchParams) ?? {}
  const next = typeof params.next === "string" ? params.next : "/dashboard"

  const currentUser = await getAuthenticatedProfile()
  if (currentUser) {
    redirect("/dashboard")
  }

  return <RegisterForm nextPath={next} />
}
