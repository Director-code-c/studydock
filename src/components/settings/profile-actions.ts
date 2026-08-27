"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const displayNameSchema = z.object({
  display_name: z.string().trim().min(1, "请输入昵称。").max(80, "昵称最多 80 个字符。"),
})

export type ProfileFormState = {
  message?: string
  success?: boolean
  fieldErrors?: {
    display_name?: string[]
  }
}

export async function updateDisplayNameAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const parsed = displayNameSchema.safeParse({
    display_name: formData.get("display_name"),
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
  const displayName = parsed.data.display_name

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", userId)

  if (error) {
    console.error("updateDisplayNameAction failed", {
      code: error.code,
    })
    return { message: "更新失败，请稍后再试。" }
  }

  revalidatePath("/settings/profile")
  revalidatePath("/dashboard")

  return { message: "已保存修改。", success: true }
}
