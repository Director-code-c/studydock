"use client"

import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import { signOutAction } from "@/components/auth/auth-actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenuClient({
  displayName,
  email,
}: {
  displayName: string
  email: string
}) {
  const [, action, pending] = useActionState(signOutAction, null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="用户菜单"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-muted ring-1 ring-border/60">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block text-sm font-medium text-foreground">{displayName}</span>
          <span className="mt-0.5 block break-all text-xs font-normal text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings">账户设置</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={action}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start px-2 text-sm text-destructive hover:text-destructive"
            disabled={pending}
          >
            {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "退出中…" : "退出登录"}
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
