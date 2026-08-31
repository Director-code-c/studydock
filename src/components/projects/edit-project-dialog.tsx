"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { updateProjectAction } from "@/components/projects/project-actions"
import type { Project, ProjectCourseOption } from "@/components/projects/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STATUS_OPTIONS = [
  { value: "todo", label: "待开始" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
]

function EditProjectForm({
  project,
  courseOptions,
  onClose,
}: {
  project: Project
  courseOptions: ProjectCourseOption[]
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(updateProjectAction, {})
  const prevSuccessRef = useRef(false)

  useEffect(() => {
    const justSucceeded = state.success && !prevSuccessRef.current
    prevSuccessRef.current = !!state.success
    if (justSucceeded) {
      onClose()
    }
  }, [state.success, onClose])

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="id" value={project.id} />

      <div className="space-y-2">
        <Label htmlFor={`project-name-${project.id}`}>项目名称 *</Label>
        <Input
          id={`project-name-${project.id}`}
          name="name"
          type="text"
          autoComplete="off"
          required
          maxLength={120}
          defaultValue={project.name}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.name?.length}
          aria-describedby={state.fieldErrors?.name?.length ? `project-name-error-${project.id}` : undefined}
        />
        {state.fieldErrors?.name?.length ? (
          <p id={`project-name-error-${project.id}`} className="text-sm text-destructive" role="alert">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`project-description-${project.id}`}>简介</Label>
        <Textarea
          id={`project-description-${project.id}`}
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={project.description ?? ""}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.description?.length}
          aria-describedby={
            state.fieldErrors?.description?.length ? `project-description-error-${project.id}` : undefined
          }
        />
        {state.fieldErrors?.description?.length ? (
          <p id={`project-description-error-${project.id}`} className="text-sm text-destructive" role="alert">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`project-status-${project.id}`}>状态</Label>
        <select
          id={`project-status-${project.id}`}
          name="status"
          defaultValue={project.status}
          disabled={pending}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80"
          aria-invalid={!!state.fieldErrors?.status?.length}
          aria-describedby={state.fieldErrors?.status?.length ? `project-status-error-${project.id}` : undefined}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.status?.length ? (
          <p id={`project-status-error-${project.id}`} className="text-sm text-destructive" role="alert">
            {state.fieldErrors.status[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`project-course-${project.id}`}>关联课程</Label>
        <select
          id={`project-course-${project.id}`}
          name="courseId"
          defaultValue={project.course_id ?? ""}
          disabled={pending}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80"
          aria-invalid={!!state.fieldErrors?.courseId?.length}
          aria-describedby={state.fieldErrors?.courseId?.length ? `project-course-error-${project.id}` : undefined}
        >
          <option value="">不关联课程</option>
          {courseOptions.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.courseId?.length ? (
          <p id={`project-course-error-${project.id}`} className="text-sm text-destructive" role="alert">
            {state.fieldErrors.courseId[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`project-due-date-${project.id}`}>截止日期</Label>
        <Input
          id={`project-due-date-${project.id}`}
          name="dueDate"
          type="date"
          defaultValue={project.due_date ?? ""}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.dueDate?.length}
          aria-describedby={
            state.fieldErrors?.dueDate?.length ? `project-due-date-error-${project.id}` : undefined
          }
        />
        {state.fieldErrors?.dueDate?.length ? (
          <p id={`project-due-date-error-${project.id}`} className="text-sm text-destructive" role="alert">
            {state.fieldErrors.dueDate[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className="text-sm"
          role="status"
          aria-live="polite"
          style={{ color: state.success ? "var(--primary)" : "var(--destructive)" }}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          取消
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  )
}

export function EditProjectDialog({
  project,
  courseOptions,
}: {
  project: Project
  courseOptions: ProjectCourseOption[]
}) {
  const [open, setOpen] = useState(false)

  // 编辑场景必须保留项目当前已关联的课程选项（即使该课程已归档），
  // 避免 select 出现无效值导致 course_id 被误清空。
  const options = [...courseOptions]
  if (project.course_id && !options.some((course) => course.id === project.course_id)) {
    options.push({ id: project.course_id, name: project.courses?.name ?? "已归档课程" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑 Project</DialogTitle>
          <DialogDescription>修改项目信息后保存。</DialogDescription>
        </DialogHeader>
        {open ? (
          <EditProjectForm
            key={project.id}
            project={project}
            courseOptions={options}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
