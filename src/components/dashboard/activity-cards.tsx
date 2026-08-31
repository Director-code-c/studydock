import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function RecentFilesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近文件</CardTitle>
        <CardDescription>文件功能即将支持</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">还没有文件</p>
      </CardContent>
    </Card>
  )
}

export function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活动</CardTitle>
        <CardDescription>账户动态时间线</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="py-6 text-center text-sm text-muted-foreground">暂无最近活动</p>
      </CardContent>
    </Card>
  )
}