"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { OfflineRuntime } from "@/components/providers/offline-runtime"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={300}>
        <OfflineRuntime />
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
