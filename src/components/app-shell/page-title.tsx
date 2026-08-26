"use client"

import { usePathname } from "next/navigation"

import { appNavItems } from "@/components/app-shell/nav-items"

const labelByPath = new Map(appNavItems.map((item) => [item.href, item.label]))

export function PageTitle() {
  const pathname = usePathname()

  return (
    <h1 className="truncate text-sm font-medium text-foreground">
      {labelByPath.get(pathname) ?? "StudyDock"}
    </h1>
  )
}
