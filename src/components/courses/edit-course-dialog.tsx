"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { type CourseFormState, updateCourseAction } from "@/components/courses/course-actions"
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

const initialState: CourseFormState = {}

const PRESET_COLORS = ["#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

type Course = {
  id: string
  name: string
  code: string | null
  description: string | null
  color: string | null
}

export function EditCourseDialog({ course }: { course: Course }) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(course.color ?? "")
  const [state, formAction, pending] = useActionState(updateCourseAction, initialState)
  const prevSuccessRef = useRef(false)

  useEffect(() => {
    const justSucceeded = state.success && !prevSuccessRef.current
    prevSuccessRef.current = !!state.success
    if (justSucceeded) {
      queueMicrotask(() => setOpen(false))
    }
  }, [state.success])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          queueMicrotask(() => setSelectedColor(course.color ?? ""))
        }
        setOpen(nextOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑课程</DialogTitle>
          <DialogDescription>修改课程信息后保存。</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="id" value={course.id} />

          <div className="space-y-2">
            <Label htmlFor={`edit-course-name-${course.id}`}>课程名称 *</Label>
            <Input
              id={`edit-course-name-${course.id}`}
              name="name"
              type="text"
              autoComplete="off"
              required
              maxLength={120}
              defaultValue={course.name}
              disabled={pending}
              aria-invalid={!!state.fieldErrors?.name?.length}
              aria-describedby={state.fieldErrors?.name?.length ? `edit-name-error-${course.id}` : undefined}
            />
            {state.fieldErrors?.name?.length ? (
              <p id={`edit-name-error-${course.id}`} className="text-sm text-destructive" role="alert">
                {state.fieldErrors.name[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-course-code-${course.id}`}>课程编号</Label>
            <Input
              id={`edit-course-code-${course.id}`}
              name="code"
              type="text"
              autoComplete="off"
              maxLength={40}
              defaultValue={course.code ?? ""}
              disabled={pending}
              aria-invalid={!!state.fieldErrors?.code?.length}
              aria-describedby={state.fieldErrors?.code?.length ? `edit-code-error-${course.id}` : undefined}
            />
            {state.fieldErrors?.code?.length ? (
              <p id={`edit-code-error-${course.id}`} className="text-sm text-destructive" role="alert">
                {state.fieldErrors.code[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-course-desc-${course.id}`}>简介</Label>
            <Textarea
              id={`edit-course-desc-${course.id}`}
              name="description"
              rows={3}
              maxLength={2000}
              defaultValue={course.description ?? ""}
              disabled={pending}
              aria-invalid={!!state.fieldErrors?.description?.length}
              aria-describedby={
                state.fieldErrors?.description?.length ? `edit-desc-error-${course.id}` : undefined
              }
            />
            {state.fieldErrors?.description?.length ? (
              <p id={`edit-desc-error-${course.id}`} className="text-sm text-destructive" role="alert">
                {state.fieldErrors.description[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>主题色</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`选择颜色 ${c}`}
                  aria-pressed={selectedColor === c}
                  onClick={() => setSelectedColor((prev) => (prev === c ? "" : c))}
                  className="size-7 rounded-full ring-1 ring-border/60 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[selected=true]:ring-2 data-[selected=true]:ring-foreground"
                  data-selected={selectedColor === c}
                  style={{ backgroundColor: c }}
                  disabled={pending}
                />
              ))}
              <button
                type="button"
                onClick={() => setSelectedColor("")}
                className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
                disabled={pending}
              >
                清除
              </button>
            </div>
            <input type="hidden" name="color" value={selectedColor} />
            {state.fieldErrors?.color?.length ? (
              <p className="text-sm text-destructive" role="alert">
                {state.fieldErrors.color[0]}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              取消
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
              {pending ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
