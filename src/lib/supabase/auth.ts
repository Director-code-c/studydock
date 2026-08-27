import { createClient } from "@/lib/supabase/server"

export async function getSessionClaims() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return { claims: null, error }
  return { claims: data.claims, error: null }
}

export async function getCurrentProfile() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null
  const userId = data.claims.sub as string
  const email = (data.claims.email as string | undefined) ?? null
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle()
  return {
    id: userId,
    email,
    display_name: (profile?.display_name as string | null) ?? null,
    avatar_url: (profile?.avatar_url as string | null) ?? null,
  }
}
