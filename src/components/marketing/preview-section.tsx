import {
  CalendarClockIcon,
  FileCodeIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  SearchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/marketing/section-heading"

const demoCourses = [
  { name: "高等数学", meta: "24 个文件", dot: "bg-sky-500" },
  { name: "数据结构", meta: "18 个文件", dot: "bg-violet-500" },
  { name: "大学英语", meta: "9 个文件", dot: "bg-emerald-500" },
]

const demoFiles = [
  { name: "数据结构 · 第 3 章笔记.md", time: "10 分钟前", icon: FileCodeIcon },
  { name: "高数习题集_v2.pdf", time: "2 小时前", icon: FileTextIcon },
  { name: "操作系统课设_开题.docx", time: "昨天", icon: FileTextIcon },
  { name: "英语presentation_统计表.xlsx", time: "3 天前", icon: FileSpreadsheetIcon },
]

const demoProjects = [
  { name: "操作系统课程设计", progress: 72 },
  { name: "学习资料网站重构", progress: 45 },
]

const demoTasks = [
  { title: "高数习题集提交", due: "今天", urgent: true },
  { title: "数据结构实验报告", due: "明天", urgent: false },
  { title: "英语口语展示", due: "周五", urgent: false },
]

function PreviewCell({
  title,
  action,
  children,
}: {
  title: string
  action?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {action ? (
          <Badge variant="secondary" className="font-normal text-muted-foreground">
            {action}
          </Badge>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function PreviewSection() {
  return (
    <section id="preview" aria-labelledby="preview-title" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <SectionHeading
          id="preview-title"
          eyebrow="产品预览"
          title="一个界面，掌握所有学习进度"
        />

        <div
          aria-hidden="false"
          className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-border/60 bg-muted/40 px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
            </div>
            <div
              role="presentation"
              className="mx-auto flex h-6 w-full max-w-56 items-center gap-1.5 rounded-md bg-background px-2 text-xs text-muted-foreground ring-1 ring-border/60"
            >
              <SearchIcon className="size-3 shrink-0" aria-hidden="true" />
              搜索课程、文件或任务…
            </div>
            <span className="hidden w-[54px] sm:block" aria-hidden="true" />
          </div>

          <div className="grid gap-px bg-border/50 sm:grid-cols-2">
            <PreviewCell title="我的课程" action="本学期 3 门">
              <ul className="space-y-3">
                {demoCourses.map((course) => (
                  <li key={course.name} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={`size-2 shrink-0 rounded-full ${course.dot}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{course.name}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {course.meta}
                    </span>
                  </li>
                ))}
              </ul>
            </PreviewCell>

            <PreviewCell title="最近文件">
              <ul className="space-y-3">
                {demoFiles.map((file) => {
                  const Icon = file.icon
                  return (
                    <li key={file.name} className="flex items-center gap-2.5 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      </span>
                      <span className="truncate">{file.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {file.time}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </PreviewCell>

            <PreviewCell title="项目进度" action="进行中 2 个">
              <ul className="space-y-4">
                {demoProjects.map((project) => (
                  <li key={project.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{project.name}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </PreviewCell>

            <PreviewCell title="截止任务" action="本周 3 项">
              <ul className="space-y-3">
                {demoTasks.map((task) => (
                  <li key={task.title} className="flex items-center gap-2.5 text-sm">
                    <CalendarClockIcon
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="truncate">{task.title}</span>
                    <Badge
                      variant={task.urgent ? "destructive" : "secondary"}
                      className={`ml-auto shrink-0 font-normal ${
                        task.urgent ? "" : "text-muted-foreground"
                      }`}
                    >
                      {task.due}
                    </Badge>
                  </li>
                ))}
              </ul>
            </PreviewCell>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          以上均为演示数据。正式版本中，课程、文件与任务将来自你自己的账户。
        </p>
      </div>
    </section>
  )
}
