import type { Metadata } from "next"
import { FolderOpenIcon, PlusIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "课程 | StudyDock",
}

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={FolderOpenIcon}
        title="课程空间即将开放"
        description="接入数据库后，你可以在这里按学期管理每门课程的讲义、课件与参考资料，查看文件数量和最近更新，并快速进入对应课程的空间。"
        action={
          <Button disabled>
            <PlusIcon aria-hidden="true" />
            新建课程
            <span className="text-xs font-normal opacity-70">即将开放</span>
          </Button>
        }
      />
    </div>
  )
}
