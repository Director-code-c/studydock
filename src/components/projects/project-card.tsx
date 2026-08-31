import { BookOpenIcon, CalendarDaysIcon } from "lucide-react"

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import type { Project, ProjectCourseOption, ProjectStatus } from "@/components/projects/types"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const STATUS_LABELS: Record<ProjectStatus, string> = {
  todo: "待开始",
  in_progress: "进行中",
  completed: "已完成",
}

export function ProjectCard({
  project,
  courseOptions,
}: {
  project: Project
  courseOptions: ProjectCourseOption[]
}) {
  return (
    <Card className="flex flex-col border-border/70">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="truncate text-sm font-semibold tracking-tight">
            {project.name}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs font-normal">
            {STATUS_LABELS[project.status]}
          </Badge>
        </div>
        {project.courses?.name ? (
          <CardDescription className="flex items-center gap-1 truncate text-xs">
            <BookOpenIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{project.courses.name}</span>
          </CardDescription>
        ) : null}
      </CardHeader>
      {project.description ? (
        <CardContent className="pt-0">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </CardContent>
      ) : null}
      <CardFooter className="mt-auto flex flex-wrap items-center gap-2 border-t-0 bg-transparent p-4 pt-3">
        {project.due_date ? (
          <span className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <CalendarDaysIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">截止 {project.due_date}</span>
          </span>
        ) : null}
        <div className="ml-auto flex shrink-0 gap-2">
          <EditProjectDialog project={project} courseOptions={courseOptions} />
          <DeleteProjectDialog projectId={project.id} projectName={project.name} />
        </div>
      </CardFooter>
    </Card>
  )
}
