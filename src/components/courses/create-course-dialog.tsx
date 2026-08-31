"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Loader2Icon, PlusIcon } from "lucide-react"

import { createCourseAction } from "@/components/courses/course-actions"
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

const PRESET_COLORS = ["#6366F1", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

function CreateCourseForm({ onClose }: { onClose: () => void }) {
  const [selectedColor, setSelectedColor] = useState("")
  const [state, formAction, pending] = useActionState(createCourseAction, {})
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
        <Label htmlFor="course-name">课程名称 *</Label>
        <Input
          id="course-name"
          name="name"
          type="text"
          autoComplete="off"
          required
          maxLength={120}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.name?.length}
          aria-describedby={state.fieldErrors?.name?.length ? "course-name-error" : undefined}
        />
        {state.fieldErrors?.name?.length ? (
          <p id="course-name-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-code">课程编号</Label>
        <Input
          id="course-code"
          name="code"
          type="text"
          autoComplete="off"
          maxLength={40}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.code?.length}
          aria-describedby={state.fieldErrors?.code?.length ? "course-code-error" : undefined}
        />
        {state.fieldErrors?.code?.length ? (
          <p id="course-code-error" className="text-sm text-destructive" role="alert">
            {state.fieldErrors.code[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-description">简介</Label>
        <Textarea
          id="course-description"
          name="description"
          rows={3}
          maxLength={2000}
          disabled={pending}
          aria-invalid={!!state.fieldErrors?.description?.length}
          aria-describedby={
            state.fieldErrors?.description?.length ? "course-description-error" : undefined
          }
        />
        {state.fieldErrors?.description?.length ? (
          <p id="course-description-error" className="text-sm text-destructive" role="alert">
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

export function CreateCourseDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon aria-hidden="true" />
          新建课程
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建课程</DialogTitle>
          <DialogDescription>填写课程信息，创建后可在课程列表中查看。</DialogDescription>
        </DialogHeader>
        {open ? <CreateCourseForm onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}
