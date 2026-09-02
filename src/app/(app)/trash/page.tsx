import type { Metadata } from "next"
import Link from "next/link"
import { Trash2Icon } from "lucide-react"

import { TrashRowActions } from "@/components/files/trash-row-actions"
import { formatFileSize } from "@/lib/files/validation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "回收站 | StudyDock",
}

type TrashedFile = {
  id: string
  original_name: string
  size_bytes: number
  deleted_at: string
  course_id: string | null
  project_id: string | null
  courses: { name: string } | null
  projects: { name: string } | null
}

export default async function TrashPage() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <EmptyState
          icon={Trash2Icon}
          title="登录已过期"
          description="请重新登录后再查看回收站。"
        />
      </div>
    )
  }

  const userId = claimsData.claims.sub as string

  const { data: files, error } = await supabase
    .from("files")
    .select(
      "id, original_name, size_bytes, deleted_at, course_id, project_id, courses(name), projects(name)"
    )
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false })

  if (error) {
    console.error("Trash page query failed", { code: error.code })
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>加载回收站失败</CardTitle>
            <CardDescription>请稍后再试。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/trash">重新加载</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trashedFiles = (files ?? []) as unknown as TrashedFile[]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <h1 className="text-lg font-semibold tracking-tight">回收站</h1>

      {trashedFiles.length === 0 ? (
        <EmptyState
          icon={Trash2Icon}
          title="回收站为空"
          description="移到回收站的文件会显示在这里。"
        />
      ) : (
        <ul className="space-y-3">
          {trashedFiles.map((file) => (
            <li key={file.id}>
              <Card className="py-3">
                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.original_name}</p>
                    <CardDescription className="mt-0.5">
                      {formatFileSize(file.size_bytes)}
                      {" · "}
                      {file.deleted_at.slice(0, 10)}
                    </CardDescription>
                  </div>
                  {file.courses?.name ? (
                    <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                      {file.courses.name}
                    </Badge>
                  ) : null}
                  {file.projects?.name ? (
                    <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                      {file.projects.name}
                    </Badge>
                  ) : null}
                  <TrashRowActions fileId={file.id} originalName={file.original_name} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}