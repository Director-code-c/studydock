export type ProjectStatus = "todo" | "in_progress" | "completed"

export type Project = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  due_date: string | null
  course_id: string | null
  created_at: string
  updated_at: string
  courses: { name: string } | null
}

export type ProjectCourseOption = {
  id: string
  name: string
}
