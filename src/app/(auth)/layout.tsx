import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeftIcon, GraduationCapIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/20">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="返回 StudyDock 首页"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/25">
              <GraduationCapIcon className="size-4 text-brand" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight">StudyDock</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              返回首页
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        {children}
      </main>
    </div>
  )
}
