import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ProjectsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>项目</CardTitle>
        <CardDescription>项目功能即将支持</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">还没有项目</p>
      </CardContent>
    </Card>
  )
}

export function DeadlinesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>即将截止</CardTitle>
        <CardDescription>暂无截止任务</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">暂无截止任务</p>
      </CardContent>
    </Card>
  )
}