export const demoSemester = "2026 秋季"

export const demoCourses = [
  { name: "高等数学", files: 24, updated: "今天更新", dot: "bg-sky-500" },
  { name: "数据结构", files: 18, updated: "昨天更新", dot: "bg-violet-500" },
  { name: "大学英语", files: 9, updated: "3 天前更新", dot: "bg-emerald-500" },
  { name: "操作系统", files: 12, updated: "本周更新", dot: "bg-amber-500" },
] as const

export const demoRecentFiles = [
  { name: "数据结构 · 第 4 章笔记.md", course: "数据结构", time: "10 分钟前" },
  { name: "高数习题集_v2.pdf", course: "高等数学", time: "2 小时前" },
  { name: "操作系统_课设开题.docx", course: "操作系统", time: "昨天" },
  { name: "英语presentation_统计.xlsx", course: "大学英语", time: "3 天前" },
]

export const demoDeadlines = [
  { title: "高数习题集提交", due: "今天", urgent: true },
  { title: "数据结构实验报告", due: "明天", urgent: false },
  { title: "英语口语展示", due: "周五", urgent: false },
  { title: "操作系统课设中期检查", due: "下周三", urgent: false },
] as const

export const demoProjects = [
  { name: "操作系统课程设计", done: 18, total: 25 },
  { name: "学习资料网站重构", done: 9, total: 20 },
  { name: "英语词汇打卡计划", done: 14, total: 30 },
] as const

export const demoActivities = [
  { text: "上传了「数据结构 · 第 4 章笔记.md」", context: "数据结构", time: "10 分钟前" },
  { text: "完成了任务「整理错题本」", context: "高等数学", time: "1 小时前" },
  { text: "更新了 Project「操作系统课程设计」进度", context: "操作系统", time: "昨天" },
  { text: "从回收站恢复了「英语presentation_大纲.pdf」", context: "回收站", time: "2 天前" },
] as const
