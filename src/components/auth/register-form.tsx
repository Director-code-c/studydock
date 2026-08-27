"use client"

import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import { registerAction, type AuthFormState } from "@/components/auth/auth-actions"
import { AuthCard, AuthLink } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthFormState = {}

export function RegisterForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState)

  return (
    <AuthCard
      title="创建 StudyDock 账号"
      description="注册后即可管理课程文件、笔记和 Project。"
      message={state.message}
      footer={
        <>
          <span>已经有账号？</span>
          <AuthLink href={`/login?next=${encodeURIComponent(nextPath)}`}>去登录</AuthLink>
        </>
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <Label htmlFor="register-display-name">昵称</Label>
          <Input
            id="register-display-name"
            name="display_name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
          />
          {state.fieldErrors?.display_name?.length ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.display_name[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-email">邮箱</Label>
          <Input id="register-email" name="email" type="email" autoComplete="email" required />
          {state.fieldErrors?.email?.length ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">密码</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          {state.fieldErrors?.password?.length ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-confirm-password">确认密码</Label>
          <Input
            id="register-confirm-password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          {state.fieldErrors?.confirm_password?.length ? (
            <p className="text-sm text-destructive" role="alert">
              {state.fieldErrors.confirm_password[0]}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "注册中…" : "注册"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          注册后可能需要先检查邮箱完成确认。
        </p>
      </form>
    </AuthCard>
  )
}
