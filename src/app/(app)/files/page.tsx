import type { Metadata } from "next"
import { FileStackIcon, UploadIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "文件 | StudyDock",
}

export default function FilesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={FileStackIcon}
        title="文件库即将开放"
        description="所有上传的课程文件将集中在这里展示，支持按课程与类型筛选、预览常用格式，并自动保留历史版本，误改也能找回。"
        action={
          <Button disabled>
            <UploadIcon aria-hidden="true" />
            上传文件
            <span className="text-xs font-normal opacity-70">即将开放</span>
          </Button>
        }
      />
    </div>
  )
}
