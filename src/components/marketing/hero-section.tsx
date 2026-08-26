import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-24">
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full px-3 py-1 text-xs font-normal text-muted-foreground"
        >
          <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
          你的学习资料工作台
        </Badge>

        <h1
          id="hero-title"
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          让每门课程和每个 Project 都井然有序
        </h1>

        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          StudyDock 把课程文件、笔记、作业和项目任务放在同一处，配合清晰的截止日期提醒，
          让你随时掌握每门课的进度。
        </p>

        <div className="flex w-full flex-col gap-2 pt-2 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">
              开始整理
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <a href="#features">了解功能</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
