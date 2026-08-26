"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeftIcon, GraduationCapIcon } from "lucide-react"

import { appNavItems } from "@/components/app-shell/nav-items"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border/60 bg-background md:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-border/60 px-4">
        <Link
          href="/dashboard"
          aria-label="StudyDock 工作台"
          className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/25">
            <GraduationCapIcon className="size-4 text-brand" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">StudyDock</span>
        </Link>
      </div>

      <nav aria-label="应用导航" className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {appNavItems.map((item) => {
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeftIcon className="size-4 shrink-0" aria-hidden="true" />
          返回欢迎页
        </Link>
      </div>
    </aside>
  )
}
