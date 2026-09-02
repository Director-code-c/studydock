import Link from "next/link"
import { BookOpenIcon, FileIcon, FolderOpenIcon } from "lucide-react"

import { formatFileSize } from "@/lib/files/validation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type DashboardRecentFile = {
  id: string
  original_name: string
  size_bytes: number
  created_at: string
  course_id: string | null
  project_id: string | null
  courses: { name: string } | null
  projects: { name: string } | null
}

export function RecentFilesCard({ files }: { files: DashboardRecentFile[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>最近文件</CardTitle>
          <CardDescription>最新上传的学习文件</CardDescription>
        </div>
        {files.length > 0 ? (
          <CardAction>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Link href="/files">查看全部文件</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">还没有文件</p>
            <p className="mt-1 text-xs text-muted-foreground">
              上传学习资料、课程文档和项目文件。
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/files">前往文件</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={file.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <FileIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate text-sm font-medium">{file.original_name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatFileSize(file.size_bytes)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {file.courses?.name ? (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <BookOpenIcon className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{file.courses.name}</span>
                    </span>
                  ) : null}
                  {file.projects?.name ? (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <FolderOpenIcon className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{file.projects.name}</span>
                    </span>
                  ) : null}
                  <span className="shrink-0">{file.created_at.slice(0, 10)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活动</CardTitle>
        <CardDescription>账户动态时间线</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">暂无最近活动</p>
      </CardContent>
    </Card>
  )
}
