import type { Metadata } from "next"
import { ListChecksIcon, PlusIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Projects | StudyDock",
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={ListChecksIcon}
        title="Project 管理即将开放"
        description="之后你可以把课程项目拆解为任务清单，设置里程碑与截止日期，并在这里跟踪每个 Project 的整体完成度。"
        action={
          <Button disabled>
            <PlusIcon aria-hidden="true" />
            新建 Project
            <span className="text-xs font-normal opacity-70">即将开放</span>
          </Button>
        }
      />
    </div>
  )
}
