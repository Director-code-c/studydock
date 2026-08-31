import type { Metadata } from "next"
import Link from "next/link"
import { FolderOpenIcon } from "lucide-react"

import { ActivityCard, RecentFilesCard } from "@/components/dashboard/activity-cards"
import { CourseGrid } from "@/components/dashboard/course-grid"
import { DeadlinesCard, ProjectsCard } from "@/components/dashboard/overview-cards"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "工作台 | StudyDock",
}

const COURSES_DISPLAY_LIMIT = 6

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

  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, name, code, description, color, archived, updated_at")
    .eq("user_id", userId)
    .order("archived", { ascending: true })
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Dashboard courses query failed", { code: error.code })
    return (
      <div className="mx-auto w-full max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>加载工作台失败</CardTitle>
            <CardDescription>暂时无法获取你的课程数据，请稍后再试。</CardDescription>
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

  const courseList = courses ?? []
  const displayedCourses = courseList.slice(0, COURSES_DISPLAY_LIMIT)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <CourseGrid courses={displayedCourses} totalCount={courseList.length} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProjectsCard />
        <DeadlinesCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentFilesCard />
        <ActivityCard />
      </div>
    </div>
  )
}