import type { Metadata } from "next"
import Link from "next/link"
import { FileStackIcon } from "lucide-react"

import { FilesSection } from "@/components/files/file-list"
import type { FileListItem } from "@/components/files/file-list"
import type { FileUploadOption } from "@/components/files/upload-file-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "文件 | StudyDock",
}

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <EmptyState
          icon={FileStackIcon}
          title="登录已过期"
          description="请重新登录后再查看文件。"
        />
      </div>
    )
  }

  const userId = claimsData.claims.sub as string

  // 上传对话框需要课程/项目选项：与文件列表并行查询。
  // 任一查询失败都走统一错误态（与 Dashboard 多查询模式一致），
  // 避免 "列表正常但上传选项损坏" 的中间状态。
  const [filesResult, coursesResult, projectsResult] = await Promise.all([
    supabase
      .from("files")
      .select(
        "id, original_name, mime_type, size_bytes, created_at, course_id, project_id, courses(name), projects(name)"
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, name")
      .eq("user_id", userId)
      .eq("archived", false)
      .order("name", { ascending: true }),
    supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
  ])

  if (filesResult.error || coursesResult.error || projectsResult.error) {
    console.error("Files page query failed", {
      code:
        filesResult.error?.code ?? coursesResult.error?.code ?? projectsResult.error?.code,
    })
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>加载文件失败</CardTitle>
            <CardDescription>请稍后再试。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/files">重新加载</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 与 projects 页面一致：未类型化 client 将 to-one 嵌入关联推断为数组，
  // 实际运行时 PostgREST 对 FK 关系返回对象或 null，这里做显式转换。
  const files = (filesResult.data ?? []) as unknown as FileListItem[]
  const courseOptions: FileUploadOption[] = (coursesResult.data ?? []).map((course) => ({
    id: course.id,
    name: course.name,
  }))
  const projectOptions: FileUploadOption[] = (projectsResult.data ?? []).map((project) => ({
    id: project.id,
    name: project.name,
  }))

  return (
    <div className="mx-auto w-full max-w-5xl">
      <FilesSection
        files={files}
        courseOptions={courseOptions}
        projectOptions={projectOptions}
      />
    </div>
  )
}
