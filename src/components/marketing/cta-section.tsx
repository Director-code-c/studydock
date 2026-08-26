import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section aria-labelledby="cta-title">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="rounded-2xl border border-border/70 bg-muted/30 px-6 py-14 text-center sm:py-16">
          <h2 id="cta-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            新学期，从有序开始
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            创建你的 StudyDock 工作台，把每门课程和每个 Project 都安排妥当。
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/dashboard">
              开始整理
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
