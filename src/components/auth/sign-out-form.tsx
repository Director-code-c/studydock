"use client"

import { useEffect, useRef } from "react"

import { clearCourseSnapshot } from "@/lib/db/offline-cache"

export function SignOutForm({
  action,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>
  children: React.ReactNode
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const bypassCleanupRef = useRef(false)

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleSubmit = (event: SubmitEvent) => {
      if (bypassCleanupRef.current) {
        bypassCleanupRef.current = false
        return
      }

      const userId = localStorage.getItem("studydock-offline-user")
      if (!userId) return

      event.preventDefault()
      void clearCourseSnapshot(userId)
        .catch(() => {
          console.error("课程离线缓存清理失败。")
        })
        .finally(() => {
          localStorage.removeItem("studydock-offline-user")
          bypassCleanupRef.current = true
          form.requestSubmit()
        })
    }

    form.addEventListener("submit", handleSubmit)
    return () => form.removeEventListener("submit", handleSubmit)
  }, [])

  return (
    <form ref={formRef} action={action}>
      {children}
    </form>
  )
}
