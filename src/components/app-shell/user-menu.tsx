import { UserMenuClient } from "@/components/app-shell/user-menu-client"
import { getCurrentProfile } from "@/lib/supabase/auth"

export async function UserMenu() {
  const profile = await getCurrentProfile()

  if (!profile) {
    return <UserMenuClient displayName="未登录" email="请先登录以使用 StudyDock" />
  }

  return (
    <UserMenuClient
      displayName={profile.display_name ?? profile.email ?? "用户"}
      email={profile.email ?? ""}
    />
  )
}
