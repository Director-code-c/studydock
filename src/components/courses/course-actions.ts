"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const colorPattern = /^#[0-9A-Fa-f]{6}$/

const courseSchema = z.object({
  name: z.string().trim().min(1, "请输入课程名称。").max(120, "课程名称最多 120 个字符。"),
  code: z
    .string()
    .trim()
    .max(40, "课程编号最多 40 个字符。")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "简介最多 2000 个字符。")
    .optional()
    .or(z.literal("")),
  color: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || colorPattern.test(v), { message: "请选择有效的颜色。" }),
})

const courseIdSchema = z.string().uuid("无效的课程 ID。")

export type CourseFormState = {
  message?: string
  success?: boolean
  fieldErrors?: {
    name?: string[]
    code?: string[]
    description?: string[]
    color?: string[]
  }
}

export async function createCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const parsed = courseSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    description: formData.get("description"),
    color: formData.get("color"),
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
  const colorValue = parsed.data.color || null
  const codeValue = parsed.data.code || null
  const descriptionValue = parsed.data.description || null

  const { error } = await supabase.from("courses").insert({
    user_id: userId,
    name: parsed.data.name,
    code: codeValue ? codeValue.trim() : null,
    description: descriptionValue ? descriptionValue.trim() : null,
    color: colorValue ? colorValue.trim() : null,
  })

  if (error) {
    console.error("createCourseAction failed", { code: error.code })
    return { message: "创建课程失败，请稍后再试。" }
  }

  revalidatePath("/courses")

  return { message: "已创建课程。", success: true }
}

export async function updateCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const parsed = z
    .object({
      id: courseIdSchema,
      name: courseSchema.shape.name,
      code: courseSchema.shape.code,
      description: courseSchema.shape.description,
      color: courseSchema.shape.color,
    })
    .safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
      color: formData.get("color"),
    })

  if (!parsed.success) {
    return {
      message: "请检查表单中的输入。",
      fieldErrors: parsed.error.flatten().fieldErrors as CourseFormState["fieldErrors"],
    }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string
  const { id, name, code, description, color } = parsed.data

  const { data, error } = await supabase
    .from("courses")
    .update({
      name: name.trim(),
      code: code ? code.trim() || null : null,
      description: description ? description.trim() || null : null,
      color: color ? color.trim() || null : null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("updateCourseAction failed", { code: error.code })
    return { message: "更新课程失败，请稍后再试。" }
  }

  if (!data) {
    return { message: "未找到该课程或无权限操作。" }
  }

  revalidatePath("/courses")

  return { message: "已更新课程。", success: true }
}

export async function toggleArchiveCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const parsed = z
    .object({
      id: courseIdSchema,
      archived: z.enum(["true", "false"], { message: "无效的归档状态。" }),
    })
    .safeParse({
      id: formData.get("id"),
      archived: formData.get("archived"),
    })

  if (!parsed.success) {
    return { message: "请求参数无效，请刷新后重试。" }
  }

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return { message: "登录状态已过期，请重新登录后再试。" }
  }

  const userId = claimsData.claims.sub as string
  const nextArchived = parsed.data.archived === "true"

  const { data, error } = await supabase
    .from("courses")
    .update({ archived: nextArchived })
    .eq("id", parsed.data.id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("toggleArchiveCourseAction failed", { code: error.code })
    return { message: "更新归档状态失败，请稍后再试。" }
  }

  if (!data) {
    return { message: "未找到该课程或无权限操作。" }
  }

  revalidatePath("/courses")

  return { message: nextArchived ? "已归档课程。" : "已恢复课程。", success: true }
}

export async function deleteCourseAction(
  _prevState: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const parsed = courseIdSchema.safeParse(formData.get("id"))

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
    .from("courses")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle()

  if (error) {
    console.error("deleteCourseAction failed", { code: error.code })
    return { message: "删除课程失败，请稍后再试。" }
  }

  if (!data) {
    return { message: "未找到该课程或无权限操作。" }
  }

  revalidatePath("/courses")

  return { message: "已删除课程。", success: true }
}
