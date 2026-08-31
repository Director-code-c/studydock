"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Loader2Icon } from "lucide-react"

import { deleteProjectAction } from "@/components/projects/project-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function DeleteProjectForm({
  projectId,
  onClose,
}: {
  projectId: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(deleteProjectAction, {})
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
      <input type="hidden" name="id" value={projectId} />

      {state.message ? (
        <p
          className={state.success ? "text-sm text-primary" : "text-sm text-destructive"}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          取消
        </Button>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "删除中..." : "确认删除"}
        </Button>
      </div>
    </form>
  )
}

export function DeleteProjectDialog({
  projectId,
  projectName,
}: {
  projectId: string
  projectName: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          删除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除 Project</DialogTitle>
          <DialogDescription>
            确认删除项目「{projectName}」？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <DeleteProjectForm projectId={projectId} onClose={() => setOpen(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
