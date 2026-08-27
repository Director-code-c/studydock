"use client"

import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import { loginAction, type AuthFormState } from "@/components/auth/auth-actions"
import { AuthCard, AuthLink } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthFormState = {}

export function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath: string
  initialError?: string
}) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <AuthCard
      title="登录 StudyDock"
      description="进入你的课程资料与 Project 工作台。"
      message={state.message ?? initialError}
      footer={
        <>
          <span>还没有账号？</span>
          <AuthLink href={`/register?next=${encodeURIComponent(nextPath)}`}>去注册</AuthLink>
        </>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <Label htmlFor="login-email">邮箱</Label>
          <Input id="login-email" name="email" type="email" autoComplete="email" required />
          {state.fieldErrors?.email?.length ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">密码</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {state.fieldErrors?.password?.length ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "登录中…" : "登录"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          尚未开通忘记密码功能，请联系管理员重置。
        </p>
      </form>
    </AuthCard>
  )
}
