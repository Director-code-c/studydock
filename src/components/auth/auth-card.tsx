import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AuthCard({
  title,
  description,
  children,
  footer,
  message,
  className,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
  message?: string
  className?: string
}) {
  return (
    <Card className={cn("w-full max-w-md border-border/70 shadow-sm", className)}>
      <CardHeader className="space-y-3 pb-4">
        <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {message ? (
          <Alert>
            <AlertTitle>提示</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        {children}
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          {footer}
        </div>
      </CardContent>
    </Card>
  )
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm text-brand underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {children}
    </Link>
  )
}

export function AuthBackButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
      <Link href={href}>{children}</Link>
    </Button>
  )
}
