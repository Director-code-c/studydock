import Link from "next/link"
import { ArrowRightIcon, FolderOpenIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export type DashboardCourse = {
  id: string
  name: string
  code: string | null
  color: string | null
}

export function CourseGrid({
  courses,
  totalCount,
}: {
  courses: DashboardCourse[]
  totalCount: number
}) {
  if (totalCount === 0) {
    return (
      <section aria-labelledby="dash-courses-heading">
        <h2
          id="dash-courses-heading"
          className="mb-3 text-sm font-medium text-muted-foreground"
        >
          我的课程
        </h2>
        <EmptyState
          icon={FolderOpenIcon}
          title="还没有课程"
          description="创建课程后，这里会汇总你的课程与学习进度。"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">前往课程页面</Link>
            </Button>
          }
        />
      </section>
    )
  }

  return (
    <section aria-labelledby="dash-courses-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2
          id="dash-courses-heading"
          className="text-sm font-medium text-muted-foreground"
        >
          我的课程
          <span className="ml-2 text-xs tabular-nums text-muted-foreground/70">
            {totalCount} 门
          </span>
        </h2>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          查看全部课程
          <ArrowRightIcon className="size-3" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map((course) => (
          <li key={course.id}>
            <Card size="sm">
              <CardContent className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {course.color ? (
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: course.color }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="size-2 shrink-0 rounded-full bg-muted"
                      aria-hidden="true"
                    />
                  )}
                  <span className="truncate text-sm font-medium">{course.name}</span>
                </div>
                {course.code ? (
                  <p className="truncate text-xs text-muted-foreground">{course.code}</p>
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}