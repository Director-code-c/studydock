import { demoCourses } from "@/components/dashboard/demo-data"
import { Card, CardContent } from "@/components/ui/card"

export function CourseGrid() {
  return (
    <section aria-labelledby="dash-courses-heading">
      <h2 id="dash-courses-heading" className="mb-3 text-sm font-medium text-muted-foreground">
        我的课程
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {demoCourses.map((course) => (
          <li key={course.name}>
            <Card size="sm">
              <CardContent className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${course.dot}`}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium">{course.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {course.files} 个文件 · {course.updated}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
