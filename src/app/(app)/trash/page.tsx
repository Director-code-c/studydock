import type { Metadata } from "next"
import { Trash2Icon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "回收站 | StudyDock",
}

export default function TrashPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={Trash2Icon}
        title="回收站为空"
        description="已删除的文件与条目会在这里保留 30 天，期间可以随时恢复或彻底清除，过期后自动释放存储空间。"
        action={
          <Button disabled>
            清空回收站
            <span className="text-xs font-normal opacity-70">即将开放</span>
          </Button>
        }
      />
    </div>
  )
}
