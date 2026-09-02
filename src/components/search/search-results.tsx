import type { ReactNode } from "react"
import Link from "next/link"
import { BookOpenIcon, FileIcon, FolderOpenIcon } from "lucide-react"

import type { ProjectStatus } from "@/components/projects/types"
import { formatFileSize } from "@/lib/files/validation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type SearchCourse = {
  id: string
  name: string
  code: string | null
  archived: boolean
  updated_at: string
}

export type SearchProject = {
  id: string
  name: string
  status: ProjectStatus
  course_id: string | null
  updated_at: string
  courses: { name: string } | null
}

export type SearchFile = {
  id: string
  original_name: string
  size_bytes: number
  created_at: string
  course_id: string | null
  project_id: string | null
  courses: { name: string } | null
  projects: { name: string } | null
}

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  todo: "待开始",
  in_progress: "进行中",
  completed: "已完成",
}

function SearchGroup({
  icon,
  title,
  viewAllHref,
  count,
  children,
}: {
  icon: ReactNode
  title: string
  viewAllHref: string
  count: number
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          {icon}
          <CardTitle className="text-sm">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            {count}
          </Badge>
        </div>
        {count > 0 ? (
          <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Link href={viewAllHref}>查看全部</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">无匹配结果</p>
        ) : (
          <ul className="space-y-3">{children}</ul>
        )}
      </CardContent>
    </Card>
  )
}

export function SearchResults({
  courses,
  projects,
  files,
}: {
  courses: SearchCourse[]
  projects: SearchProject[]
  files: SearchFile[]
}) {
  return (
    <div className="space-y-4">
      <SearchGroup
        icon={<FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        title="课程"
        viewAllHref="/courses"
        count={courses.length}
      >
        {courses.map((course) => (
          <li key={course.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium">{course.name}</span>
                {course.code ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{course.code}</span>
                ) : null}
              </span>
              {course.archived ? (
                <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                  已归档
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-x-3 text-xs text-muted-foreground">
              <span>{course.updated_at.slice(0, 10)}</span>
            </div>
          </li>
        ))}
      </SearchGroup>

      <SearchGroup
        icon={<BookOpenIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        title="项目"
        viewAllHref="/projects"
        count={projects.length}
      >
        {projects.map((project) => (
          <li key={project.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-medium">{project.name}</span>
              <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {project.courses?.name ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <FolderOpenIcon className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{project.courses.name}</span>
                </span>
              ) : null}
              <span className="shrink-0">{project.updated_at.slice(0, 10)}</span>
            </div>
          </li>
        ))}
      </SearchGroup>

      <SearchGroup
        icon={<FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        title="文件"
        viewAllHref="/files"
        count={files.length}
      >
        {files.map((file) => (
          <li key={file.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <FileIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate text-sm font-medium">{file.original_name}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(file.size_bytes)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {file.courses?.name ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <BookOpenIcon className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{file.courses.name}</span>
                </span>
              ) : null}
              {file.projects?.name ? (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <FolderOpenIcon className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{file.projects.name}</span>
                </span>
              ) : null}
              <span className="shrink-0">{file.created_at.slice(0, 10)}</span>
            </div>
          </li>
        ))}
      </SearchGroup>
    </div>
  )
}