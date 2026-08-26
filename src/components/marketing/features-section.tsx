import { FolderOpenIcon, HistoryIcon, ListChecksIcon, SearchIcon } from "lucide-react"

import { SectionHeading } from "@/components/marketing/section-heading"

const features = [
  {
    icon: FolderOpenIcon,
    title: "课程资料集中管理",
    description: "按课程整理讲义、课件和参考资料，一个入口就能找到整学期的学习材料。",
  },
  {
    icon: ListChecksIcon,
    title: "Project 与任务追踪",
    description: "把课程项目和复习计划拆成清晰的任务列表，完成进度一目了然。",
  },
  {
    icon: SearchIcon,
    title: "快速搜索和分类",
    description: "按课程、标签或关键词即时检索文件与笔记，不再翻找散落各处的资料。",
  },
  {
    icon: HistoryIcon,
    title: "文件版本与安全存储",
    description: "重要文档自动保留历史版本，安全存储在云端，误改误删也能随时找回。",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          id="features-title"
          eyebrow="功能介绍"
          title="为整个学期设计的四项能力"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="rounded-xl border border-border/70 bg-card p-5"
              >
                <span className="mb-4 flex size-9 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                  <Icon className="size-4.5 text-brand" aria-hidden="true" />
                </span>
                <h3 className="mb-1.5 text-sm font-medium">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
