import Link from "next/link"
import { BookOpenIcon, CalendarDaysIcon } from "lucide-react"

import type { ProjectStatus } from "@/components/projects/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type DashboardProject = {
  id: string
  name: string
  status: ProjectStatus
  due_date: string | null
  course_id: string | null
  updated_at: string
  courses: { name: string } | null
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  todo: "待开始",
  in_progress: "进行中",
  completed: "已完成",
}

export function ProjectsCard({ projects }: { projects: DashboardProject[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>项目</CardTitle>
          <CardDescription>最近操作的项目</CardDescription>
        </div>
        {projects.length > 0 ? (
          <CardAction>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Link href="/projects">查看全部项目</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">还没有项目</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/projects">前往项目</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li key={project.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium">{project.name}</span>
                  <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                    {STATUS_LABELS[project.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  {project.courses?.name ? (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <BookOpenIcon className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{project.courses.name}</span>
                    </span>
                  ) : null}
                  {project.due_date ? (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <CalendarDaysIcon className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">截止 {project.due_date}</span>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function DeadlinesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>即将截止</CardTitle>
        <CardDescription>暂无截止任务</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">暂无截止任务</p>
      </CardContent>
    </Card>
  )
}