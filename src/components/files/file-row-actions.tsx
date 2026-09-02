"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DownloadIcon, Loader2Icon, Trash2Icon } from "lucide-react"

import { deleteFileAction, getFileDownloadUrl } from "@/components/files/file-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function DeleteFileContent({
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
      const result = await deleteFileAction({ fileId })

      if (!result.success) {
        setError(result.message)
        return
      }

      onClose()
      router.refresh()
    } catch {
      setError("删除失败，请稍后再试。")
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
          {pending ? "删除中…" : "删除"}
        </Button>
      </div>
    </div>
  )
}

export function FileRowActions({
  fileId,
  originalName,
}: {
  fileId: string
  originalName: string
}) {
  const [open, setOpen] = useState(false)
  const [downloadPending, setDownloadPending] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  async function handleDownload() {
    if (downloadPending) return
    setDownloadPending(true)
    setDownloadError(null)

    try {
      const result = await getFileDownloadUrl({ fileId })

      if (!result.success) {
        setDownloadError(result.message)
        return
      }

      // 触发下载；attachment filename 由 signed URL 的 Content-Disposition 负责。
      const anchor = document.createElement("a")
      anchor.href = result.signedUrl
      anchor.rel = "noopener"
      anchor.style.display = "none"
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
    } catch {
      setDownloadError("下载失败，请稍后再试。")
    } finally {
      setDownloadPending(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={downloadPending}
        >
          {downloadPending ? (
            <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <DownloadIcon aria-hidden="true" />
          )}
          {downloadPending ? "下载中…" : "下载"}
        </Button>

        <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2Icon aria-hidden="true" />
          删除
        </Button>
      </div>

      {downloadError ? (
        <p className="text-xs text-destructive" role="alert" aria-live="polite">
          {downloadError}
        </p>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除文件</DialogTitle>
            <DialogDescription>删除文件后无法恢复。</DialogDescription>
          </DialogHeader>
          {open ? (
            <DeleteFileContent
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
