"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getSafeNextPath } from "@/lib/auth/next-path"
import { getAppOrigin } from "@/lib/auth/origin"
import { createClient } from "@/lib/supabase/server"

const registerSchema = z
  .object({
    display_name: z.string().trim().min(1).max(80),
    email: z.string().email(),
    password: z.string().min(8),
    confirm_password: z.string().min(8),
    next: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "两次输入的密码不一致。",
  })

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
})

export type AuthFormState = {
  message?: string
  fieldErrors?: {
    display_name?: string[]
    email?: string[]
    password?: string[]
    confirm_password?: string[]
  }
}

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState | never> {
  const parsed = registerSchema.safeParse({
    display_name: formData.get("display_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
    next: formData.get("next") ?? undefined,
  })

  if (!parsed.success) {
    return {
      message: "请检查表单中的输入。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { display_name, email, password, next } = parsed.data
  const nextPath = getSafeNextPath(next)
  const supabase = await createClient()
  const appOrigin = await getAppOrigin()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name },
      emailRedirectTo: `${appOrigin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  })

  if (error) {
    console.error("registerAction failed", { code: error.code, status: error.status })
    return { message: "注册失败，请稍后再试。" }
  }

  if (data.session) {
    revalidatePath("/dashboard")
    redirect(nextPath)
  }

  return {
    message: "请检查邮箱，完成确认后即可继续。",
  }
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState | never> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  })

  if (!parsed.success) {
    return {
      message: "请检查表单中的输入。",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { email, password, next } = parsed.data
  const nextPath = getSafeNextPath(next)
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("loginAction failed", { code: error.code, status: error.status })
    return { message: "邮箱或密码不正确，请重试。" }
  }

  revalidatePath("/dashboard")
  redirect(nextPath)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
