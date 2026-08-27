import { AlertCircleIcon } from "lucide-react"

import { AuthBackButton, AuthCard } from "@/components/auth/auth-card"

export default function CallbackErrorPage() {
  return (
    <AuthCard
      title="验证失败"
      description="登录链接无效或已过期，请返回登录页重新尝试。"
      footer={<AuthBackButton href="/login">返回登录</AuthBackButton>}
    >
      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <AlertCircleIcon className="size-4 shrink-0 text-brand" aria-hidden="true" />
        若问题持续出现，请重新发送登录或注册邮件。
      </div>
    </AuthCard>
  )
}
