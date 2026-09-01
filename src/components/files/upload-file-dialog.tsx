"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, UploadIcon } from "lucide-react"

import { finalizeFileUpload, prepareFileUpload } from "@/components/files/file-actions"
import {
  MAX_FILE_SIZE,
  formatFileSize,
  getExpectedMimeType,
  getFileExtension,
} from "@/lib/files/validation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export type FileUploadOption = { id: string; name: string }

type AssociationType = "none" | "course" | "project"

const SELECT_CLASS =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80"

function UploadFileForm({
  courseOptions,
  projectOptions,
  onClose,
}: {
  courseOptions: FileUploadOption[]
  projectOptions: FileUploadOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [associationType, setAssociationType] = useState<AssociationType>("none")
  const [courseId, setCourseId] = useState("")
  const [projectId, setProjectId] = useState("")
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (uploading) return

    if (!file) {
      setMessage({ text: "请选择文件。", success: false })
      return
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      setMessage({ text: "文件不能超过 50 MB。", success: false })
      return
    }
    if (!getFileExtension(file.name)) {
      setMessage({ text: "不支持该文件类型。", success: false })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const selectedCourseId = associationType === "course" ? courseId || null : null
      const selectedProjectId = associationType === "project" ? projectId || null : null

      const prepare = await prepareFileUpload({
        originalName: file.name,
        sizeBytes: file.size,
        courseId: selectedCourseId,
        projectId: selectedProjectId,
      })

      if (!prepare.success) {
        setMessage({ text: prepare.message, success: false })
        return
      }

      const supabase = createClient()
      const canonicalMime = getExpectedMimeType(file.name)

      const uploadResult = await supabase.storage
        .from("studydock-files")
        .upload(prepare.storagePath, file, {
          upsert: false,
          contentType: canonicalMime ?? undefined,
        })

      if (uploadResult.error) {
        setMessage({ text: "上传失败，请稍后再试。", success: false })
        return
      }

      const finalize = await finalizeFileUpload({
        fileId: prepare.fileId,
        originalName: file.name,
        courseId: selectedCourseId,
        projectId: selectedProjectId,
      })

      if (!finalize.success) {
        setMessage({ text: finalize.message, success: false })
        return
      }

      onClose()
      router.refresh()
    } catch {
      setMessage({ text: "上传失败，请稍后再试。", success: false })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="file-input">文件 *</Label>
        <input
          id="file-input"
          type="file"
          disabled={uploading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)
            setMessage(null)
          }}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:hover:bg-muted/80"
        />
        {file ? (
          <p className="text-xs text-muted-foreground">
            {file.name} · {formatFileSize(file.size)}
            {file.type ? ` · ${file.type}` : ""}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-association">关联</Label>
        <select
          id="file-association"
          value={associationType}
          onChange={(event) => setAssociationType(event.target.value as AssociationType)}
          disabled={uploading}
          className={SELECT_CLASS}
        >
          <option value="none">不关联</option>
          <option value="course">关联课程</option>
          <option value="project">关联项目</option>
        </select>
      </div>

      {associationType === "course" ? (
        <div className="space-y-2">
          <Label htmlFor="file-course">课程</Label>
          <select
            id="file-course"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            disabled={uploading}
            className={SELECT_CLASS}
          >
            <option value="">选择课程</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {associationType === "project" ? (
        <div className="space-y-2">
          <Label htmlFor="file-project">项目</Label>
          <select
            id="file-project"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            disabled={uploading}
            className={SELECT_CLASS}
          >
            <option value="">选择项目</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {message ? (
        <p
          className="text-sm"
          role="status"
          aria-live="polite"
          style={{ color: message.success ? "var(--primary)" : "var(--destructive)" }}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
          取消
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? <Loader2Icon className="size-4 animate-spin" aria-hidden="true" /> : null}
          {uploading ? "上传中…" : "上传文件"}
        </Button>
      </div>
    </form>
  )
}

export function UploadFileDialog({
  courseOptions,
  projectOptions,
}: {
  courseOptions: FileUploadOption[]
  projectOptions: FileUploadOption[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UploadIcon aria-hidden="true" />
          上传文件
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传文件</DialogTitle>
          <DialogDescription>
            上传学习资料、课程文档和项目文件（最大 50 MB）。
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <UploadFileForm
            courseOptions={courseOptions}
            projectOptions={projectOptions}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
