import type { Metadata } from "next"
import { SearchIcon } from "lucide-react"

import { SearchResults } from "@/components/search/search-results"
import type {
  SearchCourse,
  SearchFile,
  SearchProject,
} from "@/components/search/search-results"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "搜索 | StudyDock",
}

const SEARCH_RESULT_LIMIT = 10
const SEARCH_QUERY_MAX_LENGTH = 100

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}

// LIKE wildcard 有语义，转义为用户字面量匹配（Postgres LIKE 默认 escape 为反斜杠）。
function escapeLikePattern(value: string): string {
  return value.replace(/([\\%_])/g, "\\$1")
}

function SearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/search" method="get" className="flex gap-2" role="search">
      <Input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="搜索课程、项目和文件"
        maxLength={SEARCH_QUERY_MAX_LENGTH}
        aria-label="搜索关键词"
        className="flex-1"
      />
      <Button type="submit">
        <SearchIcon aria-hidden="true" />
        搜索
      </Button>
    </form>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const rawQ = Array.isArray(q) ? q[0] : q
  const query = rawQ?.trim() ?? ""

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()

  if (claimsError || !claimsData?.claims) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <EmptyState
          icon={SearchIcon}
          title="登录已过期"
          description="请重新登录后再搜索。"
        />
      </div>
    )
  }

  const userId = claimsData.claims.sub as string

  if (query.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 py-2">
        <SearchForm defaultValue="" />
        <EmptyState
          icon={SearchIcon}
          title="搜索课程、项目和文件"
          description="输入关键词查找课程、项目和学习文件。"
        />
      </div>
    )
  }

  if (query.length > SEARCH_QUERY_MAX_LENGTH) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 py-2">
        <SearchForm defaultValue={query} />
        <p className="text-sm text-destructive" role="alert">
          搜索关键词过长。
        </p>
      </div>
    )
  }

  const pattern = `%${escapeLikePattern(query)}%`

  const [courseNameResult, courseCodeResult, projectsResult, filesResult] = await Promise.all([
    supabase
      .from("courses")
      .select("id, name, code, archived, updated_at")
      .eq("user_id", userId)
      .ilike("name", pattern)
      .order("updated_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("courses")
      .select("id, name, code, archived, updated_at")
      .eq("user_id", userId)
      .ilike("code", pattern)
      .order("updated_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("projects")
      .select("id, name, status, course_id, updated_at, courses(name)")
      .eq("user_id", userId)
      .ilike("name", pattern)
      .order("updated_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
    supabase
      .from("files")
      .select(
        "id, original_name, size_bytes, created_at, course_id, project_id, courses(name), projects(name)"
      )
      .eq("user_id", userId)
      .is("deleted_at", null)
      .ilike("original_name", pattern)
      .order("created_at", { ascending: false })
      .limit(SEARCH_RESULT_LIMIT),
  ])

  if (
    courseNameResult.error ||
    courseCodeResult.error ||
    projectsResult.error ||
    filesResult.error
  ) {
    console.error("Search query failed", {
      code:
        courseNameResult.error?.code ??
        courseCodeResult.error?.code ??
        projectsResult.error?.code ??
        filesResult.error?.code,
    })
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 py-2">
        <SearchForm defaultValue={query} />
        <Card>
          <CardHeader>
            <CardTitle>搜索失败</CardTitle>
            <CardDescription>搜索失败，请稍后再试。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <a href={`/search?q=${encodeURIComponent(query)}`}>重试</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 未类型化 client：明确转换以匹配真实字段形态。
  const coursesByName = (courseNameResult.data ?? []) as unknown as SearchCourse[]
  const coursesByCode = (courseCodeResult.data ?? []) as unknown as SearchCourse[]

  // name / code 双匹配去重，按 updated_at DESC 归并，最终不超过 limit。
  const mergedCourses = Array.from(
    new Map<SearchCourse["id"], SearchCourse>(
      [...coursesByName, ...coursesByCode].map((course) => [course.id, course])
    ).values()
  )
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, SEARCH_RESULT_LIMIT)

  const searchCourses = mergedCourses
  const searchProjects = (projectsResult.data ?? []) as unknown as SearchProject[]
  const searchFiles = (filesResult.data ?? []) as unknown as SearchFile[]

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 py-2">
      <SearchForm defaultValue={query} />

      {searchCourses.length === 0 &&
      searchProjects.length === 0 &&
      searchFiles.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="未找到匹配结果"
          description="尝试使用其他关键词。"
        />
      ) : (
        <SearchResults
          courses={searchCourses}
          projects={searchProjects}
          files={searchFiles}
        />
      )}
    </div>
  )
}