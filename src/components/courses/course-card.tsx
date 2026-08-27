import { ArchiveIcon } from "lucide-react"

import { ArchiveCourseButton } from "@/components/courses/archive-course-button"
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog"
import { EditCourseDialog } from "@/components/courses/edit-course-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Course = {
  id: string
  name: string
  code: string | null
  description: string | null
  color: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="flex flex-col border-border/70">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {course.color ? (
              <span
                className="size-3 shrink-0 rounded-full ring-1 ring-border/60"
                style={{ backgroundColor: course.color }}
                aria-hidden="true"
              />
            ) : null}
            <CardTitle className="truncate text-sm font-semibold tracking-tight">
              {course.name}
            </CardTitle>
          </div>
          {course.archived ? (
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs font-normal">
              <ArchiveIcon className="size-3" aria-hidden="true" />
              已归档
            </Badge>
          ) : null}
        </div>
        {course.code ? (
          <CardDescription className="truncate text-xs">{course.code}</CardDescription>
        ) : null}
      </CardHeader>
      {course.description ? (
        <CardContent className="pt-0">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        </CardContent>
      ) : null}
      <CardFooter className="mt-auto flex flex-wrap gap-2 border-t-0 bg-transparent p-4 pt-3">
        <EditCourseDialog course={course} />
        <ArchiveCourseButton courseId={course.id} archived={course.archived} />
        <DeleteCourseDialog courseId={course.id} courseName={course.name} />
      </CardFooter>
    </Card>
  )
}
