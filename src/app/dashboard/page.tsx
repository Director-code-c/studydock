import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, LayoutDashboardIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "工作台 | StudyDock",
}

export default function DashboardPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24 sm:px-6">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted">
            <LayoutDashboardIcon className="size-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-base font-medium">工作台将在下一步构建</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dashboard 与数据接入正在规划中，敬请期待。
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeftIcon aria-hidden="true" />
              返回首页
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
