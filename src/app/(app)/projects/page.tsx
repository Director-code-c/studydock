import type { Metadata } from "next"
import Link from "next/link"
import { ListChecksIcon } from "lucide-react"

import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import type { Project, ProjectCourseOption } from "@/components/projects/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Projects | StudyDock",
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <EmptyState
          icon={ListChecksIcon}
          title="登录已过期"
          description="请重新登录后再查看项目。"
        />
      </div>
    )
  }

  const userId = claimsData.claims.sub as string

  const [{ data: courses, error: coursesError }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabase
        .from("courses")
        .select("id, name, code, archived")
        .eq("user_id", userId)
        .order("name", { ascending: true }),
      supabase
        .from("projects")
        .select(
          "id, name, description, status, due_date, course_id, created_at, updated_at, courses(name)"
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    ])

  if (coursesError || projectsError) {
    console.error("Projects page query failed", {
      code: coursesError?.code ?? projectsError?.code,
    })
    return (
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>加载项目失败</CardTitle>
            <CardDescription>暂时无法获取你的项目数据，请稍后再试。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/projects">重新加载</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 课程选择器只提供未归档的课程；编辑已归档课程关联的项目时，
  // EditProjectDialog 会补充当前课程选项，保证 select 不出现无效值。
  const courseOptions: ProjectCourseOption[] = (courses ?? [])
    .filter((course) => !course.archived)
    .map((course) => ({ id: course.id, name: course.name }))

  // 未类型化 client 将 to-one 嵌入关联推断为数组；实际运行时 PostgREST
  // 对 FK 关系返回对象或 null，这里做显式转换以匹配真实形态。
  const projectList = (projects ?? []) as unknown as Project[]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold tracking-tight">Projects</h1>
        <CreateProjectDialog courseOptions={courseOptions} />
      </div>

      {projectList.length === 0 ? (
        <EmptyState
          icon={ListChecksIcon}
          title="还没有项目"
          description="创建一个项目来管理课程作业、研究和长期学习目标。"
          action={<CreateProjectDialog courseOptions={courseOptions} />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} courseOptions={courseOptions} />
          ))}
        </div>
      )}
    </div>
  )
}
