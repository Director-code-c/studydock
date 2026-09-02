"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, RotateCcwIcon, Trash2Icon } from "lucide-react"

import {
  permanentlyDeleteFileAction,
  restoreFileAction,
} from "@/components/files/file-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function PermanentDeleteContent({
  fileId,
  originalName,
  onClose,
}: {
  fileId: string
  originalName: string
  onClose: () => void
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (pending) return
    setPending(true)
    setError(null)

    try {
      const result = await permanentlyDeleteFileAction({ fileId })

      if (!result.success) {
        setError(result.message)
        return
      }

      onClose()
      router.refresh()
    } catch {
      setError("永久删除失败，请稍后再试。")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm break-words">{originalName}</p>

      {error ? (
        <p className="text-sm text-destructive" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          取消
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
          {pending ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "永久删除中…" : "永久删除"}
        </Button>
      </div>
    </div>
  )
}

export function TrashRowActions({
  fileId,
  originalName,
}: {
  fileId: string
  originalName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [restorePending, setRestorePending] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  async function handleRestore() {
    if (restorePending) return
    setRestorePending(true)
    setRestoreError(null)

    try {
      const result = await restoreFileAction({ fileId })

      if (!result.success) {
        setRestoreError(result.message)
        return
      }

      router.refresh()
    } catch {
      setRestoreError("恢复失败，请稍后再试。")
    } finally {
      setRestorePending(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={restorePending}
        >
          {restorePending ? (
            <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCcwIcon aria-hidden="true" />
          )}
          {restorePending ? "恢复中…" : "恢复"}
        </Button>

        <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2Icon aria-hidden="true" />
          永久删除
        </Button>
      </div>

      {restoreError ? (
        <p className="text-xs text-destructive" role="alert" aria-live="polite">
          {restoreError}
        </p>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>永久删除文件</DialogTitle>
            <DialogDescription>永久删除后无法恢复。</DialogDescription>
          </DialogHeader>
          {open ? (
            <PermanentDeleteContent
              fileId={fileId}
              originalName={originalName}
              onClose={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}