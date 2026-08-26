import type { ReactNode } from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { AppSidebar } from "@/components/app-shell/app-sidebar"
import { MobileNav } from "@/components/app-shell/mobile-nav"
import { PageTitle } from "@/components/app-shell/page-title"
import { UserMenu } from "@/components/app-shell/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        跳到主要内容
      </a>

      <AppSidebar />

      <div className="flex min-h-svh flex-col md:pl-60">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <MobileNav />
          <PageTitle />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              <Link href="/search">
                <SearchIcon aria-hidden="true" />
                搜索
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground sm:hidden"
              aria-label="全局搜索"
            >
              <Link href="/search">
                <SearchIcon aria-hidden="true" />
              </Link>
            </Button>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </>
  )
}
