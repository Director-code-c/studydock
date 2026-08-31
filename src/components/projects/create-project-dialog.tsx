"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Loader2Icon, PlusIcon } from "lucide-react"

import { createProjectAction } from "@/components/projects/project-actions"
import type { ProjectCourseOption } from "@/components/projects/types"
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

function CreateProjectForm({
  courseOptions,
  onClose,
}: {
  courseOptions: ProjectCourseOption[]
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(createProjectAction, {})
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
      <div className="space-y-2">
        <Label htmlFor="project-name">项目名称 *</Label>
        <Input
          id="project-name"
          name="name"
          type="text"
          autoComplete="off"
          required
          maxLength={120}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.name?.length}
          aria-describedby={state.fieldErrors?.name?.length ? "project-name-error" : undefined}
        />
        {state.fieldErrors?.name?.length ? (
          <p id="project-name-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">简介</Label>
        <Textarea
          id="project-description"
          name="description"
          rows={3}
          maxLength={2000}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.description?.length}
          aria-describedby={
            state.fieldErrors?.description?.length ? "project-description-error" : undefined
          }
        />
        {state.fieldErrors?.description?.length ? (
          <p id="project-description-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.description[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-status">状态</Label>
        <select
          id="project-status"
          name="status"
          defaultValue="todo"
          disabled={pending}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80"
          aria-invalid={!!state.fieldErrors?.status?.length}
          aria-describedby={state.fieldErrors?.status?.length ? "project-status-error" : undefined}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.status?.length ? (
          <p id="project-status-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.status[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-course">关联课程</Label>
        <select
          id="project-course"
          name="courseId"
          defaultValue=""
          disabled={pending}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80"
          aria-invalid={!!state.fieldErrors?.courseId?.length}
          aria-describedby={state.fieldErrors?.courseId?.length ? "project-course-error" : undefined}
        >
          <option value="">不关联课程</option>
          {courseOptions.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.courseId?.length ? (
          <p id="project-course-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.courseId[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-due-date">截止日期</Label>
        <Input
          id="project-due-date"
          name="dueDate"
          type="date"
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.dueDate?.length}
          aria-describedby={state.fieldErrors?.dueDate?.length ? "project-due-date-error" : undefined}
        />
        {state.fieldErrors?.dueDate?.length ? (
          <p id="project-due-date-error" className="text-sm text-destructive" role="alert">
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
          {pending ? "创建中..." : "创建"}
        </Button>
      </div>
    </form>
  )
}

export function CreateProjectDialog({ courseOptions }: { courseOptions: ProjectCourseOption[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon aria-hidden="true" />
          新建 Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建 Project</DialogTitle>
          <DialogDescription>
            创建一个项目来管理课程作业、研究和长期学习目标。
          </DialogDescription>
        </DialogHeader>
        {open ? <CreateProjectForm courseOptions={courseOptions} onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}
