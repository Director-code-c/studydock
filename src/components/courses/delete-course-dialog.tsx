"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2Icon } from "lucide-react"

import { deleteCourseAction, type CourseFormState } from "@/components/courses/course-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const initialState: CourseFormState = {}

export function DeleteCourseDialog({ courseId, courseName }: { courseId: string; courseName: string }) {
  const [state, formAction, pending] = useActionState(deleteCourseAction, initialState)
  const closeRef = useRef<HTMLButtonElement>(null)
  const prevSuccessRef = useRef(false)

  useEffect(() => {
    const justSucceeded = state.success && !prevSuccessRef.current
    prevSuccessRef.current = !!state.success
    if (justSucceeded) {
      queueMicrotask(() => closeRef.current?.click())
    }
  }, [state.success])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          删除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除课程</DialogTitle>
          <DialogDescription>
            确认删除课程「{courseName}」？此操作不可撤销，课程下的相关数据可能一并受影响。
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="id" value={courseId} />

          {state.message ? (
            <p className={state.success ? "text-sm text-primary" : "text-sm text-destructive"} role="status" aria-live="polite">
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button ref={closeRef} type="button" variant="outline" disabled={pending}>
              取消
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
              {pending ? "删除中..." : "确认删除"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
