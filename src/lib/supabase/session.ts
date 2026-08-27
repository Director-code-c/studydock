import { createClient } from "@/lib/supabase/server"
import { getCurrentProfile } from "@/lib/supabase/auth"

export async function requireAuth() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    return null
  }

  return data.claims
}

export async function getAuthenticatedProfile() {
  return await getCurrentProfile()
}
