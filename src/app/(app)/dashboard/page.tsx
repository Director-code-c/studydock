import type { Metadata } from "next"
import Link from "next/link"
import { FolderOpenIcon } from "lucide-react"

import { ActivityCard, RecentFilesCard } from "@/components/dashboard/activity-cards"
import { CourseGrid } from "@/components/dashboard/course-grid"
import { DeadlinesCard, ProjectsCard } from "@/components/dashboard/overview-cards"
import type {
  DashboardDeadline,
  DashboardProject,
} from "@/components/dashboard/overview-cards"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "工作台 | StudyDock",
}

const COURSES_DISPLAY_LIMIT = 6
const PROJECTS_DISPLAY_LIMIT = 4
const DEADLINES_DISPLAY_LIMIT = 4

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <EmptyState
          icon={FolderOpenIcon}
          title="登录已过期"
          description="请重新登录后再查看工作台。"
        />
      </div>
    )
  }

  const userId = claimsData.claims.sub as string

  // 服务器统一按 UTC 日期计算“今天”，避免客户端时区差异。
  const today = new Date().toISOString().slice(0, 10)

  const [coursesResult, projectsResult, deadlinesResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, code, description, color, archived, updated_at")
      .eq("user_id", userId)
      .order("archived", { ascending: true })
      .order("updated_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, status, due_date, course_id, updated_at, courses(name)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(PROJECTS_DISPLAY_LIMIT),
    supabase
      .from("projects")
      .select("id, name, status, due_date, course_id, courses(name)")
      .eq("user_id", userId)
      .neq("status", "completed")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(DEADLINES_DISPLAY_LIMIT),
  ])

  if (coursesResult.error || projectsResult.error || deadlinesResult.error) {
    console.error("Dashboard query failed", {
      code:
        coursesResult.error?.code ??
        projectsResult.error?.code ??
        deadlinesResult.error?.code,
    })
    return (
      <div className="mx-auto w-full max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>加载工作台失败</CardTitle>
            <CardDescription>加载 Dashboard 数据失败，请稍后再试。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">重新加载</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const courseList = coursesResult.data ?? []
  const displayedCourses = courseList.slice(0, COURSES_DISPLAY_LIMIT)
  const dashboardProjects = (projectsResult.data ?? []) as unknown as DashboardProject[]
  const dashboardDeadlines = (deadlinesResult.data ?? []) as unknown as DashboardDeadline[]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <CourseGrid courses={displayedCourses} totalCount={courseList.length} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectsCard projects={dashboardProjects} />
        <DeadlinesCard deadlines={dashboardDeadlines} today={today} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentFilesCard />
        <ActivityCard />
      </div>
    </div>
  )
}