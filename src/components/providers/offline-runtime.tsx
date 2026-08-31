"use client"

import { useEffect } from "react"

import { createClient } from "@/lib/supabase/client"
import { clearCourseSnapshot } from "@/lib/db/offline-cache"

const OFFLINE_USER_KEY = "studydock-offline-user"

// 第二层隐私兜底：任何 sign-out 路径都会先清除该用户的 IndexedDB 课程 snapshot，
// 再移除离线用户 marker。清理失败不阻止退出，且对不存在的 snapshot 幂等。
async function clearOfflineUserData() {
  const previousUserId = localStorage.getItem(OFFLINE_USER_KEY)
  if (previousUserId) {
    await clearCourseSnapshot(previousUserId).catch(() => {
      console.error("课程离线缓存清理失败。")
    })
    // 仅在 marker 仍是本次要清理的用户时移除；若期间已切换登录为新用户，
    // 保留新 marker，避免误删。
    if (localStorage.getItem(OFFLINE_USER_KEY) === previousUserId) {
      localStorage.removeItem(OFFLINE_USER_KEY)
    }
  }
}

export function OfflineRuntime() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        console.error("离线服务注册失败。")
      })
    }

    const supabase = createClient()
    let mounted = true

    const syncUserMarker = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      const userId = data.session?.user?.id
      if (userId) {
        localStorage.setItem(OFFLINE_USER_KEY, userId)
      } else {
        await clearOfflineUserData()
      }
    }

    void syncUserMarker().catch(() => {
      if (mounted) localStorage.removeItem(OFFLINE_USER_KEY)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user?.id) {
        void clearOfflineUserData()
      } else {
        localStorage.setItem(OFFLINE_USER_KEY, session.user.id)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return null
}
