// 纯函数 / 常量：文件上传校验。不依赖 Supabase / React / server-only 代码，
// 客户端与 Server Action 共用，保证校验规则一致。

export const MAX_FILE_SIZE = 50_000_000

export const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
  "webp",
] as const

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number]

// 权威 MIME：以扩展名为准。浏览器 file.type 不作为最终存储的 Content-Type。
export const EXTENSION_TO_MIME: Record<AllowedExtension, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  md: "text/markdown",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
}

export function getFileExtension(name: string): string {
  const index = name.lastIndexOf(".")
  if (index <= 0 || index === name.length - 1) return ""
  return name.slice(index + 1).toLowerCase()
}

export function isAllowedFileExtension(name: string): boolean {
  const extension = getFileExtension(name)
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(extension)
}

export function getExpectedMimeType(name: string): string | null {
  const extension = getFileExtension(name)
  return EXTENSION_TO_MIME[extension as AllowedExtension] ?? null
}

// deterministic：同样的输入永远得到同样的安全文件名。
// Storage path 使用 sanitize 后的 basename；original_name 仍保留用户原始显示名。
export function sanitizeStorageFilename(originalName: string): string {
  const extension = getFileExtension(originalName)
  const baseRaw = extension
    ? originalName.slice(0, originalName.length - extension.length - 1)
    : originalName

  let base = baseRaw
    .replace(/[\u0000-\u001f\u007f]/g, "") // 控制字符
    .replace(/[\\/]/g, "-") // 路径分隔符
    .replace(/\.\./g, "-") // 去除 ..
    .replace(/[^a-zA-Z0-9._-]/g, "-") // 非安全字符
    .replace(/-+/g, "-") // 合并连续 -
    .replace(/^[-.]+|[-.]+$/g, "") // 首尾 - / .
    .slice(0, 60) // 限制 basename 长度
    .replace(/[-.]+$/g, "")

  if (!base) base = "file"
  return extension ? `${base}.${extension}` : base
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
