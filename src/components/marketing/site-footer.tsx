import Link from "next/link"
import { GraduationCapIcon } from "lucide-react"

const footerLinks = [
  { href: "#features", label: "功能介绍" },
  { href: "#preview", label: "产品预览" },
  { href: "/dashboard", label: "工作台" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <p className="flex items-center gap-2">
          <GraduationCapIcon className="size-3.5 text-brand" aria-hidden="true" />
          © 2026 StudyDock · 为学生打造的学习资料工作台
        </p>
        <nav aria-label="页脚导航">
          <ul className="flex items-center justify-center gap-5">
            {footerLinks.map((link) =>
              link.href.startsWith("/") ? (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
