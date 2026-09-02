"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  MAX_FILE_SIZE,
  getExpectedMimeType,
  isAllowedFileExtension,
  sanitizeStorageFilename,
} from "@/lib/files/validation"
import { createClient } from "@/lib/supabase/server"

export type PrepareFileUploadResult =
  | { success: true; fileId: string; storagePath: string }
  | { success: false; message: string }

export type FinalizeFileUploadResult =
  | { success: true; idempotent?: boolean }
  | { success: false; message: string }

const prepareSchema = z.object({
  originalName: z
    .string()
    .trim()
    .min(1, "请选择文件。")
    .max(255, "文件名过长。"),
  sizeBytes: z
    .number()
    .int()
    .positive("文件不能为空。")
    .max(MAX_FILE_SIZE, "文件不能超过 50 MB。"),
  courseId: z.string().uuid("无效的课程 ID。").optional().nullable(),
  projectId: z.string().uuid("无效的项目 ID。").optional().nullable(),
})

const finalizeSchema = z.object({
  fileId: z.string().uuid("无效的文件 ID。"),
  originalName: z.string().trim().min(1).max(255),
  courseId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
})

function errorCode(error: unknown): string | number | undefined {
  if (!error || typeof error !== "object") return undefined
  const candidate = error as { code?: string | number; status?: number; statusCode?: number }
  return candidate.code ?? candidate.status ?? candidate.statusCode
}

async function validateCourseOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("files validateCourseOwnership failed", { code: error.code })
    return "课程不存在或无权使用。"
  }

  if (!data) return "课程不存在或无权使用。"
  return null
}

async function validateProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("files validateProjectOwnership failed", { code: error.code })
    return "项目不存在或无权使用。"
  }

  if (!data) return "项目不存在或无权使用。"
  return null
}

async function cleanupUnreferencedObject({
  supabase,
  userId,
  storagePath,
  stage,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  storagePath: string
  stage: string
}): Promise<void> {
  const { data, error } = await supabase
    .from("files")
    .select("id")
    .eq("user_id", userId)
    .eq("storage_path", storagePath)
    .maybeSingle()

  if (error) {
    console.error("files_cleanup_reference_check", {
      stage,
      code: error.code,
    })
    return
  }

  if (data) return

  const removeResult = await supabase.storage.from("studydock-files").remove([storagePath])

  if (removeResult.error) {
    console.error("files_cleanup_remove", {
      stage,
      code: errorCode(removeResult.error),
    })
  }
}

// 阶段一：校验 + 生成 fileId / storagePath。不创建 DB row，不创建 Storage object。
export async function prepareFileUpload(input: {
  originalName: string
  sizeBytes: number
  courseId?: string | null
  projectId?: string | null
}): Promise<PrepareFileUploadResult> {
  const parsed = prepareSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "请检查输入。" }
  }

  const normalizedOriginalName = parsed.data.originalName.trim()
  const { courseId, projectId } = parsed.data

  if (courseId && projectId) {
    return { success: false, message: "只能关联课程或项目之一。" }
  }

  if (!isAllowedFileExtension(normalizedOriginalName)) {
    return { success: false, message: "不支持该文件类型。" }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { success: false, message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string

  if (courseId) {
    const ownershipError = await validateCourseOwnership(supabase, courseId, userId)
    if (ownershipError) return { success: false, message: ownershipError }
  }

  if (projectId) {
    const ownershipError = await validateProjectOwnership(supabase, projectId, userId)
    if (ownershipError) return { success: false, message: ownershipError }
  }

  const fileId = crypto.randomUUID()
  const storagePath = `${userId}/${fileId}/${sanitizeStorageFilename(normalizedOriginalName)}`

  return { success: true, fileId, storagePath }
}

// 阶段二：验证对象 + 写 metadata。客户端提交的 size 不被信任。
export async function finalizeFileUpload(input: {
  fileId: string
  originalName: string
  courseId?: string | null
  projectId?: string | null
}): Promise<FinalizeFileUploadResult> {
  const parsed = finalizeSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "请求参数无效，请刷新后重试。" }
  }

  const normalizedOriginalName = parsed.data.originalName.trim()
  const { fileId, courseId, projectId } = parsed.data

  if (courseId && projectId) {
    return { success: false, message: "只能关联课程或项目之一。" }
  }

  if (!isAllowedFileExtension(normalizedOriginalName)) {
    return { success: false, message: "不支持该文件类型。" }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { success: false, message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string

  if (courseId) {
    const ownershipError = await validateCourseOwnership(supabase, courseId, userId)
    if (ownershipError) {
      await cleanupUnreferencedObject({
        supabase,
        userId,
        storagePath: `${userId}/${fileId}/${sanitizeStorageFilename(normalizedOriginalName)}`,
        stage: "files_finalize_course_race",
      })
      return { success: false, message: "上传失败，请稍后再试。" }
    }
  }

  if (projectId) {
    const ownershipError = await validateProjectOwnership(supabase, projectId, userId)
    if (ownershipError) {
      await cleanupUnreferencedObject({
        supabase,
        userId,
        storagePath: `${userId}/${fileId}/${sanitizeStorageFilename(normalizedOriginalName)}`,
        stage: "files_finalize_project_race",
      })
      return { success: false, message: "上传失败，请稍后再试。" }
    }
  }

  const safeFilename = sanitizeStorageFilename(normalizedOriginalName)
  const expectedPath = `${userId}/${fileId}/${safeFilename}`
  const canonicalMime = getExpectedMimeType(normalizedOriginalName)

  const { data: existing, error: existingError } = await supabase
    .from("files")
    .select("storage_path, original_name, course_id, project_id")
    .eq("id", fileId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existingError) {
    console.error("finalizeFileUpload idempotency check failed", { code: existingError.code })
    return { success: false, message: "上传失败，请稍后再试。" }
  }

  if (existing) {
    const matches =
      existing.storage_path === expectedPath &&
      existing.original_name === normalizedOriginalName &&
      existing.course_id === (courseId ?? null) &&
      existing.project_id === (projectId ?? null)

    if (matches) {
      return { success: true, idempotent: true }
    }

    return { success: false, message: "上传失败，请稍后再试。" }
  }

  const storage = supabase.storage.from("studydock-files")
  const infoResult = await storage.info(expectedPath)

  if (infoResult.error || !infoResult.data) {
    const status = errorCode(infoResult.error)
    if (status === 404) {
      return { success: false, message: "上传失败，请稍后再试。" }
    }

    console.error("finalizeFileUpload object info failed", {
      stage: "files_finalize_info",
      code: status,
    })
    return { success: false, message: "上传失败，请稍后再试。" }
  }

  const actualSize = infoResult.data.size

  if (
    typeof actualSize !== "number" ||
    !Number.isFinite(actualSize) ||
    actualSize <= 0 ||
    actualSize > MAX_FILE_SIZE
  ) {
    await cleanupUnreferencedObject({
      supabase,
      userId,
      storagePath: expectedPath,
      stage: "files_finalize_size_guard",
    })
    return { success: false, message: "上传失败，请稍后再试。" }
  }

  const insertResult = await supabase
    .from("files")
    .insert({
      id: fileId,
      user_id: userId,
      course_id: courseId ?? null,
      project_id: projectId ?? null,
      original_name: normalizedOriginalName,
      storage_path: expectedPath,
      mime_type: canonicalMime,
      size_bytes: actualSize,
    })
    .select("id")
    .maybeSingle()

  if (insertResult.error) {
    console.error("finalizeFileUpload insert failed", { code: insertResult.error.code })

    const { data: retryCheck, error: retryCheckError } = await supabase
      .from("files")
      .select("storage_path, original_name, course_id, project_id")
      .eq("id", fileId)
      .eq("user_id", userId)
      .maybeSingle()

    if (retryCheckError) {
      console.error("finalizeFileUpload retry check failed", { code: retryCheckError.code })
      return { success: false, message: "上传失败，请稍后再试。" }
    }

    if (retryCheck) {
      const matches =
        retryCheck.storage_path === expectedPath &&
        retryCheck.original_name === normalizedOriginalName &&
        retryCheck.course_id === (courseId ?? null) &&
        retryCheck.project_id === (projectId ?? null)

      if (matches) {
        return { success: true, idempotent: true }
      }

      return { success: false, message: "上传失败，请稍后再试。" }
    }

    await cleanupUnreferencedObject({
      supabase,
      userId,
      storagePath: expectedPath,
      stage: "files_finalize_insert_fallback",
    })

    return { success: false, message: "上传失败，请稍后再试。" }
  }

  revalidatePath("/files")

  return { success: true }
}

const fileIdSchema = z.object({
  fileId: z.string().uuid("无效的文件 ID。"),
})

export type DownloadFileResult =
  | { success: true; signedUrl: string }
  | { success: false; message: string }

export type TrashActionResult =
  | { success: true; idempotent?: boolean }
  | { success: false; message: string }

async function getAuthenticatedUserId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) return null
  return claimsData.claims.sub as string
}

// 下载：生成 60 秒 signed URL。path / filename 均来自 DB，不信任客户端输入。
export async function getFileDownloadUrl(input: {
  fileId: string
}): Promise<DownloadFileResult> {
  const parsed = fileIdSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "下载失败，请稍后再试。" }
  }

  const supabase = await createClient()
  const userId = await getAuthenticatedUserId(supabase)
  if (!userId) {
    return { success: false, message: "下载失败，请稍后再试。" }
  }

  const { data: file, error } = await supabase
    .from("files")
    .select("id, storage_path, original_name")
    .eq("id", parsed.data.fileId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle()

  if (error) {
    console.error("files_download_lookup", { code: error.code })
    return { success: false, message: "下载失败，请稍后再试。" }
  }

  // 统一 generic：不区分"他人文件"与"不存在"。
  if (!file) {
    return { success: false, message: "下载失败，请稍后再试。" }
  }

  const signResult = await supabase.storage
    .from("studydock-files")
    .createSignedUrl(file.storage_path, 60, {
      download: file.original_name,
    })

  if (signResult.error || !signResult.data) {
    console.error("files_download_sign", { code: errorCode(signResult.error) })
    return { success: false, message: "下载失败，请稍后再试。" }
  }

  return { success: true, signedUrl: signResult.data.signedUrl }
}

// 移到回收站：仅 metadata 状态变更，不动 Storage。幂等：已回收/不存在/他人 → success。
export async function moveFileToTrashAction(input: {
  fileId: string
}): Promise<TrashActionResult> {
  const parsed = fileIdSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "移到回收站失败，请稍后再试。" }
  }

  const supabase = await createClient()
  const userId = await getAuthenticatedUserId(supabase)
  if (!userId) {
    return { success: false, message: "移到回收站失败，请稍后再试。" }
  }

  const updateResult = await supabase
    .from("files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", parsed.data.fileId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select("id")

  if (updateResult.error) {
    console.error("files_trash_move", { code: updateResult.error.code })
    return { success: false, message: "移到回收站失败，请稍后再试。" }
  }

  // 0 rows + no error：已回收 / 缺失 / 他人文件 / 并发双击 → 统一 success。
  revalidatePath("/files")
  revalidatePath("/trash")
  revalidatePath("/dashboard")
  revalidatePath("/search")

  return { success: true }
}

// 恢复：先查回收站 metadata，再验证 Storage 对象存在，最后清 deleted_at。不动 Storage。
export async function restoreFileAction(input: {
  fileId: string
}): Promise<TrashActionResult> {
  const parsed = fileIdSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "恢复失败，请稍后再试。" }
  }

  const supabase = await createClient()
  const userId = await getAuthenticatedUserId(supabase)
  if (!userId) {
    return { success: false, message: "恢复失败，请稍后再试。" }
  }

  const { data: file, error: lookupError } = await supabase
    .from("files")
    .select("id, storage_path")
    .eq("id", parsed.data.fileId)
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .maybeSingle()

  if (lookupError) {
    console.error("files_trash_restore_lookup", { code: lookupError.code })
    return { success: false, message: "恢复失败，请稍后再试。" }
  }

  // 已恢复 / 缺失 / 他人文件 → 统一 success，不泄露存在性。
  if (!file) {
    return { success: true, idempotent: true }
  }

  const infoResult = await supabase.storage.from("studydock-files").info(file.storage_path)

  if (infoResult.error || !infoResult.data) {
    // 明确 not found 或 transient 一律不恢复，避免恢复出损坏的 active 行。
    console.error("files_trash_restore_info", { code: errorCode(infoResult.error) })
    return { success: false, message: "恢复失败，请稍后再试。" }
  }

  const updateResult = await supabase
    .from("files")
    .update({ deleted_at: null })
    .eq("id", parsed.data.fileId)
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .select("id")

  if (updateResult.error) {
    console.error("files_trash_restore_update", { code: updateResult.error.code })
    return { success: false, message: "恢复失败，请稍后再试。" }
  }

  revalidatePath("/files")
  revalidatePath("/trash")
  revalidatePath("/dashboard")
  revalidatePath("/search")

  return { success: true }
}

// 永久删除：Storage first → DB second。初始 lookup 必须已在回收站；
// 一旦开始，PERMANENT DELETE WINS（final DB delete 只按 id + user_id）。
export async function permanentlyDeleteFileAction(input: {
  fileId: string
}): Promise<TrashActionResult> {
  const parsed = fileIdSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "永久删除失败，请稍后再试。" }
  }

  const supabase = await createClient()
  const userId = await getAuthenticatedUserId(supabase)
  if (!userId) {
    return { success: false, message: "永久删除失败，请稍后再试。" }
  }

  const { data: file, error: lookupError } = await supabase
    .from("files")
    .select("id, storage_path")
    .eq("id", parsed.data.fileId)
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .maybeSingle()

  if (lookupError) {
    console.error("files_trash_permanent_lookup", { code: lookupError.code })
    return { success: false, message: "永久删除失败，请稍后再试。" }
  }

  // active / 缺失 / 他人文件：不做任何操作。active 对象必须存活。
  if (!file) {
    return { success: true, idempotent: true }
  }

  const removeResult = await supabase.storage.from("studydock-files").remove([file.storage_path])

  if (removeResult.error) {
    // Storage transient/RLS 失败：保留 metadata（仍在回收站），可重试。
    console.error("files_trash_permanent_storage", { code: errorCode(removeResult.error) })
    return { success: false, message: "永久删除失败，请稍后再试。" }
  }

  // 关键：final DB delete 不加 deleted_at filter——并发 Restore 可能已清空该列。
  // 初始 lookup 已证明该行原在回收站；永久删除开始后即胜出。
  const deleteResult = await supabase
    .from("files")
    .delete()
    .eq("id", parsed.data.fileId)
    .eq("user_id", userId)
    .select("id")

  if (deleteResult.error) {
    // metadata 可能仍在回收站；retry 收敛（remove 对缺失对象为 no-op success）。
    console.error("files_trash_permanent_metadata", { code: deleteResult.error.code })
    return { success: false, message: "永久删除失败，请稍后再试。" }
  }

  // 0 rows + no error（并发永久删除）→ success。
  revalidatePath("/files")
  revalidatePath("/trash")
  revalidatePath("/dashboard")
  revalidatePath("/search")

  return { success: true }
}
