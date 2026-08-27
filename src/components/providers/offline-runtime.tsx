"use client"

import { useEffect } from "react"

import { createClient } from "@/lib/supabase/client"

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
        localStorage.setItem("studydock-offline-user", userId)
      } else {
        localStorage.removeItem("studydock-offline-user")
      }
    }

    void syncUserMarker().catch(() => {
      if (mounted) localStorage.removeItem("studydock-offline-user")
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user?.id) {
        localStorage.removeItem("studydock-offline-user")
      } else {
        localStorage.setItem("studydock-offline-user", session.user.id)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return null
}
