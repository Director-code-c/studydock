import type { Metadata } from "next"
import { InfoIcon } from "lucide-react"

import { ActivityCard, RecentFilesCard } from "@/components/dashboard/activity-cards"
import { CourseGrid } from "@/components/dashboard/course-grid"
import { demoSemester } from "@/components/dashboard/demo-data"
import { DeadlinesCard, ProjectsCard } from "@/components/dashboard/overview-cards"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "工作台 | StudyDock",
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-normal text-muted-foreground">
          当前学期：{demoSemester}
        </Badge>
        <Badge variant="secondary" className="gap-1 font-normal text-muted-foreground">
          <InfoIcon className="size-3" aria-hidden="true" />
          演示数据
        </Badge>
        <p className="w-full text-xs text-muted-foreground sm:w-auto">
          当前为演示数据，接入数据库后替换。
        </p>
      </div>

      <CourseGrid />

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
