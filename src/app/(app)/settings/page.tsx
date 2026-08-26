import type { Metadata } from "next"
import { SettingsIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "设置 | StudyDock",
}

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={SettingsIcon}
        title="设置中心即将开放"
        description="登录功能上线后，你可以在这里管理账户资料、外观偏好（浅色 / 深色 / 跟随系统）以及通知与提醒规则。"
        action={
          <Button disabled>
            <SettingsIcon aria-hidden="true" />
            编辑个人资料
            <span className="text-xs font-normal opacity-70">即将开放</span>
          </Button>
        }
      />
    </div>
  )
}
