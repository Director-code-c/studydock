import type { Metadata } from "next"
import Link from "next/link"
import { FileStackIcon } from "lucide-react"

import { FilesSection } from "@/components/files/file-list"
import type { FileListItem } from "@/components/files/file-list"
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

  const { data, error } = await supabase
    .from("files")
    .select("id, original_name, mime_type, size_bytes, created_at, course_id, project_id, courses(name), projects(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Files page query failed", { code: error.code })
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
  const files = (data ?? []) as unknown as FileListItem[]

  return (
    <div className="mx-auto w-full max-w-5xl">
      <FilesSection files={files} />
    </div>
  )
}