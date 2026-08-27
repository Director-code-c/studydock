"use client"

import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import type { ProfileFormState } from "@/components/settings/profile-actions"
import { updateDisplayNameAction } from "@/components/settings/profile-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: ProfileFormState = {}

export function ProfileForm({
  initialDisplayName,
  email,
  hasProfile,
}: {
  initialDisplayName: string
  email: string
  hasProfile: boolean
}) {
  const [state, formAction, pending] = useActionState(updateDisplayNameAction, initialState)

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="profile-email">邮箱</Label>
        <Input
          id="profile-email"
          name="email"
          type="email"
          value={email}
          readOnly
          disabled
          autoComplete="email"
        />
        <p className="text-xs text-muted-foreground">邮箱用于登录，暂不支持在此修改。</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-display-name">昵称</Label>
        <Input
          id="profile-display-name"
          name="display_name"
          type="text"
          autoComplete="name"
          defaultValue={initialDisplayName}
          required
          maxLength={80}
          disabled={pending || !hasProfile}
          aria-invalid={!!state.fieldErrors?.display_name?.length}
          aria-describedby={state.fieldErrors?.display_name?.length ? "display-name-error" : undefined}
        />
        {state.fieldErrors?.display_name?.length ? (
          <p id="display-name-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.display_name[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className="text-sm"
          role="status"
          aria-live="polite"
          data-success={state.success ? "true" : "false"}
          style={{ color: state.success ? "var(--primary)" : "var(--destructive)" }}
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending || !hasProfile}>
        {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "保存中..." : "保存修改"}
      </Button>
    </form>
  )
}
