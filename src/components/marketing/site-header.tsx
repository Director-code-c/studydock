import Link from "next/link"
import { GraduationCapIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#features", label: "功能介绍" },
  { href: "#preview", label: "产品预览" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="StudyDock 首页"
          className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/25">
            <GraduationCapIcon className="size-4 text-brand" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">StudyDock</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="页面导航" className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/dashboard">开始使用</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
