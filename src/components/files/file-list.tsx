import {
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type FileListItem = {
  id: string
  original_name: string
  mime_type: string | null
  size_bytes: number
  created_at: string
  course_id: string | null
  project_id: string | null
  courses: { name: string } | null
  projects: { name: string } | null
}

// size_bytes 在 PostgREST JSON 中通常为 number；兼容 string 以防推断差异。
export function formatFileSize(bytes: number | string): string {
  const value = typeof bytes === "string" ? Number(bytes) : bytes
  if (!Number.isFinite(value) || value <= 0) return "0 B"
  if (value < 1024) return `${Math.round(value)} B`
  const units = ["KB", "MB", "GB"]
  let size = value
  let unit = -1
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  const formatted =
    size >= 100 || Number.isInteger(size) ? size.toFixed(0) : size.toFixed(1)
  return `${formatted} ${units[unit]}`
}

function getFileExtension(name: string): string {
  const index = name.lastIndexOf(".")
  if (index <= 0 || index === name.length - 1) return ""
  return name.slice(index + 1).toLowerCase()
}

const ICON_BY_EXTENSION: Record<string, LucideIcon> = {
  pdf: FileTextIcon,
  doc: FileTextIcon,
  docx: FileTextIcon,
  txt: FileTextIcon,
  md: FileTextIcon,
  ppt: PresentationIcon,
  pptx: PresentationIcon,
  xls: FileSpreadsheetIcon,
  xlsx: FileSpreadsheetIcon,
  png: FileImageIcon,
  jpg: FileImageIcon,
  jpeg: FileImageIcon,
  webp: FileImageIcon,
}

function FileTypeIcon({ originalName }: { originalName: string }) {
  const Icon = ICON_BY_EXTENSION[getFileExtension(originalName)] ?? FileIcon
  return <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
}

export function FileList({ files }: { files: FileListItem[] }) {
  return (
    <ul className="space-y-3">
      {files.map((file) => (
        <li key={file.id}>
          <Card className="py-3">
            <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <FileTypeIcon originalName={file.original_name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.original_name}</p>
                <CardDescription className="mt-0.5">
                  {formatFileSize(file.size_bytes)}
                  {" · "}
                  {file.created_at.slice(0, 10)}
                </CardDescription>
              </div>
              {file.courses?.name ? (
                <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                  {file.courses.name}
                </Badge>
              ) : null}
              {file.projects?.name ? (
                <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                  {file.projects.name}
                </Badge>
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}

export function FilesSection({ files }: { files: FileListItem[] }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">文件</h1>
          <p className="text-sm text-muted-foreground">管理学习资料、课程文档和项目文件。</p>
        </div>
      </div>
      {files.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>还没有文件</CardTitle>
            <CardDescription>上传学习资料、课程文档和项目文件。</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <FileList files={files} />
      )}
    </div>
  )
}