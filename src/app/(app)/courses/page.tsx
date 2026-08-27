import type { Metadata } from "next"
import { FolderOpenIcon } from "lucide-react"

import { CourseCard } from "@/components/courses/course-card"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "课程 | StudyDock",
}

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <EmptyState
          icon={FolderOpenIcon}
          title="登录已过期"
          description="请重新登录后再查看课程。"
        />
      </div>
    )
  }

  const userId = claimsData.claims.sub as string

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, name, code, description, color, archived, created_at, updated_at")
    .eq("user_id", userId)
    .order("archived", { ascending: true })
    .order("updated_at", { ascending: false })

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">课程</h1>
          <CreateCourseDialog />
        </div>
        <p className="text-sm text-destructive" role="alert">
          加载课程失败，请稍后再试。
        </p>
      </div>
    )
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold tracking-tight">课程</h1>
          <CreateCourseDialog />
        </div>
        <EmptyState
          icon={FolderOpenIcon}
          title="还没有课程"
          description="创建第一门课程，开始整理讲义、课件与参考资料。"
          action={<CreateCourseDialog />}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight">课程</h1>
        <CreateCourseDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
