"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type ProjectFormState = {
  message?: string
  success?: boolean
  fieldErrors?: {
    name?: string[]
    description?: string[]
    status?: string[]
    courseId?: string[]
    dueDate?: string[]
  }
}

const projectIdSchema = z.string().uuid("无效的项目 ID。")

// 校验 YYYY-MM-DD 且必须是真实存在的日历日期（如拒绝 2026-02-31）。
// 仅做纯日历计算（UTC），不依赖本地时区，不产生 Date 偏移。
// 限制 year 在 [1000, 9999]：Date.UTC 对 0–99 年有 1900 基准映射的
// 历史兼容行为，会导致闰年判断异常；StudyDock 的截止日期业务
// 也不涉及古代年份（<input type="date"> 的合理业务范围）。
function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (year < 1000 || year > 9999) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return day <= daysInMonth
}

const projectFormSchema = z.object({
  name: z.string().trim().min(1, "请输入项目名称。").max(120, "项目名称最多 120 个字符。"),
  description: z
    .string()
    .trim()
    .max(2000, "简介最多 2000 个字符。")
    .optional()
    .or(z.literal("")),
  status: z.enum(["todo", "in_progress", "completed"], { message: "无效的状态。" }),
  courseId: z
    .string()
    .trim()
    .uuid("无效的课程 ID。")
    .optional()
    .or(z.literal("")),
  dueDate: z
    .string()
    .trim()
    .refine(isValidCalendarDate, { message: "请输入有效的日期（YYYY-MM-DD）。" })
    .optional()
    .or(z.literal("")),
})

// 若 courseId 非空，校验其属于当前用户（Server Action 第一层防护）。
async function validateCourseOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  userId: string
): Promise<string | null> {
  const { data: course, error } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    console.error("validateCourseOwnership failed", { code: error.code })
    return "关联课程失败，请稍后再试。"
  }

  if (!course) {
    return "未找到该课程或无权限关联。"
  }

  return null
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const parsed = projectFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
    courseId: formData.get("courseId"),
    dueDate: formData.get("dueDate"),
  })

  if (!parsed.success) {
    return {
      message: "请检查表单中的输入。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string
  const courseId = parsed.data.courseId || null

  if (courseId) {
    const ownershipError = await validateCourseOwnership(supabase, courseId, userId)
    if (ownershipError) {
      return { message: ownershipError }
    }
  }

  const { error } = await supabase.from("projects").insert({
    user_id: userId,
    course_id: courseId,
    name: parsed.data.name,
    description: parsed.data.description ? parsed.data.description.trim() : null,
    status: parsed.data.status,
    due_date: parsed.data.dueDate || null,
  })

  if (error) {
    console.error("createProjectAction failed", { code: error.code })
    return { message: "创建项目失败，请稍后再试。" }
  }

  revalidatePath("/projects")

  return { message: "已创建项目。", success: true }
}

export async function updateProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const parsed = z
    .object({
      id: projectIdSchema,
      name: projectFormSchema.shape.name,
      description: projectFormSchema.shape.description,
      status: projectFormSchema.shape.status,
      courseId: projectFormSchema.shape.courseId,
      dueDate: projectFormSchema.shape.dueDate,
    })
    .safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description"),
      status: formData.get("status"),
      courseId: formData.get("courseId"),
      dueDate: formData.get("dueDate"),
    })

  if (!parsed.success) {
    return {
      message: "请检查表单中的输入。",
      fieldErrors: parsed.error.flatten().fieldErrors as ProjectFormState["fieldErrors"],
    }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string
  const courseId = parsed.data.courseId || null

  if (courseId) {
    const ownershipError = await validateCourseOwnership(supabase, courseId, userId)
    if (ownershipError) {
      return { message: ownershipError }
    }
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ? parsed.data.description.trim() : null,
      status: parsed.data.status,
      course_id: courseId,
      due_date: parsed.data.dueDate || null,
    })
    .eq("id", parsed.data.id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("updateProjectAction failed", { code: error.code })
    return { message: "更新项目失败，请稍后再试。" }
  }

  if (!data) {
    return { message: "未找到该项目或无权限操作。" }
  }

  revalidatePath("/projects")

  return { message: "已更新项目。", success: true }
}

export async function deleteProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const parsed = projectIdSchema.safeParse(formData.get("id"))

  if (!parsed.success) {
    return { message: "请求参数无效，请刷新后重试。" }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("deleteProjectAction failed", { code: error.code })
    return { message: "删除项目失败，请稍后再试。" }
  }

  if (!data) {
    return { message: "未找到该项目或无权限操作。" }
  }

  revalidatePath("/projects")

  return { message: "已删除项目。", success: true }
}
