"use client"

import { useActionState } from "react"
import { Loader2Icon } from "lucide-react"

import { toggleArchiveCourseAction, type CourseFormState } from "@/components/courses/course-actions"
import { Button } from "@/components/ui/button"

const initialState: CourseFormState = {}

export function ArchiveCourseButton({
  courseId,
  archived,
}: {
  courseId: string
  archived: boolean
}) {
  const nextValue = archived ? "false" : "true"
  const [state, formAction, pending] = useActionState(toggleArchiveCourseAction, initialState)

  return (
    <form action={formAction} className="inline-flex flex-col gap-1">
      <input type="hidden" name="id" value={courseId} />
      <input type="hidden" name="archived" value={nextValue} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
        {archived ? "恢复" : "归档"}
      </Button>
      {state.message && !state.success ? (
        <span className="text-xs text-destructive" role="alert">
          {state.message}
        </span>
      ) : null}
    </form>
  )
}
