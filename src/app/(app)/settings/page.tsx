import type { Metadata } from "next"
import Link from "next/link"
import { BellIcon, ChevronRightIcon, UserRoundIcon } from "lucide-react"

import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "设置 | StudyDock",
}

const upcomingSettings = [
  {
    icon: BellIcon,
    label: "通知",
    description: "课程更新与提醒规则",
  },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">设置</h1>

      <Card className="divide-y divide-border/60">
        <Link
          href="/settings/profile"
          className="flex items-center gap-3 rounded-t-xl px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/25">
            <UserRoundIcon className="size-4 text-brand" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-foreground">个人资料</span>
            <span className="block text-xs text-muted-foreground">
              编辑显示名称与查看登录邮箱
            </span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>

        {upcomingSettings.map(({ icon: Icon, label, description }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 opacity-60">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border/60">
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{label}</span>
              <span className="block text-xs text-muted-foreground">{description}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">即将开放</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
