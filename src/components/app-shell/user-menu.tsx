"use client"

import { SettingsIcon, UserRoundIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function UserMenu() {
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
            <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <span className="block text-sm font-medium text-foreground">本地用户</span>
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            尚未登录，数据仅保存在本地演示状态
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <SettingsIcon aria-hidden="true" />
          账户设置
          <span className="ml-auto text-xs text-muted-foreground">即将开放</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
