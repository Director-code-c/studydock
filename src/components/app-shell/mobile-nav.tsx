"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeftIcon, GraduationCapIcon, MenuIcon } from "lucide-react"

import { appNavItems } from "@/components/app-shell/nav-items"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="打开导航菜单"
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 gap-0 p-0">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              aria-label="StudyDock 工作台"
              className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/25">
                <GraduationCapIcon className="size-4 text-brand" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">StudyDock</span>
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">应用主导航</SheetDescription>
        </SheetHeader>

        <nav aria-label="应用导航" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {appNavItems.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
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

        <SheetFooter className="border-t border-border/60">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden="true" />
            返回欢迎页
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
