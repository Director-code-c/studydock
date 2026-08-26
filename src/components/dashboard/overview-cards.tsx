import { CalendarClockIcon } from "lucide-react"

import { demoDeadlines, demoProjects } from "@/components/dashboard/demo-data"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function progressPercent(done: number, total: number) {
  return Math.round((done / total) * 100)
}

export function ProjectsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>进行中的 Project</CardTitle>
        <CardDescription>共 {demoProjects.length} 个</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {demoProjects.map((project) => {
            const percent = progressPercent(project.done, project.total)
            return (
              <li key={project.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{project.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {project.done}/{project.total} · {percent}%
                  </span>
                </div>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

export function DeadlinesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>即将截止</CardTitle>
        <CardDescription>最近 {demoDeadlines.length} 项任务</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {demoDeadlines.map((task) => (
            <li key={task.title} className="flex items-center gap-2.5 text-sm">
              <CalendarClockIcon
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="truncate">{task.title}</span>
              <Badge
                variant={task.urgent ? "destructive" : "secondary"}
                className={`ml-auto shrink-0 font-normal ${
                  task.urgent ? "" : "text-muted-foreground"
                }`}
              >
                {task.due}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
