import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { ProfileForm } from "@/components/settings/profile-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "个人资料 | StudyDock",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>无法加载个人资料</CardTitle>
            <CardDescription>登录状态已过期，请重新登录后再试。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">返回登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userId = claimsData.claims.sub as string
  const email = (claimsData.claims.email as string | undefined) ?? ""

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", userId)
    .maybeSingle()

  if (profileError) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>加载失败</CardTitle>
            <CardDescription>个人资料暂时无法加载，请稍后再试。</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/settings">
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            返回设置
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>未找到个人资料</CardTitle>
            <CardDescription>
              未找到与当前账号关联的个人资料记录，请联系管理员或稍后重试。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">登录邮箱：{email || "—"}</p>
              <p className="text-xs text-muted-foreground">邮箱用于登录，暂不支持在此修改。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/settings">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          返回设置
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>更新你的显示名称。邮箱用于登录，暂不支持在此修改。</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initialDisplayName={profile.display_name ?? ""}
            email={email}
            hasProfile={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
