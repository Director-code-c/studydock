import type { Metadata } from "next"
import { SearchIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "搜索 | StudyDock",
}

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={SearchIcon}
        title="全局搜索即将开放"
        description="数据接入后，这里将支持跨课程、跨文件的全文检索，并可按标签、文件类型和时间范围过滤结果，一步定位学习资料。"
        action={
          <Button disabled>
            <SearchIcon aria-hidden="true" />
            高级检索
            <span className="text-xs font-normal opacity-70">即将开放</span>
          </Button>
        }
      />
    </div>
  )
}
