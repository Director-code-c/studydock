import { redirect } from "next/navigation"

import { getSessionClaims } from "@/lib/supabase/auth"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { claims } = await getSessionClaims()

  if (!claims) {
    redirect("/login?next=/dashboard")
  }

  return children
}
