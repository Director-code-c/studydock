import { FileTextIcon } from "lucide-react"

import { demoActivities, demoRecentFiles } from "@/components/dashboard/demo-data"
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
        <CardDescription>最近编辑与上传的资料</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {demoRecentFiles.map((file) => (
            <li key={file.name} className="flex items-center gap-2.5 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileTextIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </span>
              <span className="truncate">{file.name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {file.time}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function ActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活动</CardTitle>
        <CardDescription>账户动态的时间线</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {demoActivities.map((activity) => (
            <li key={activity.text} className="flex items-start gap-2.5 text-sm">
              <span
                className="mt-[7px] size-1.5 shrink-0 rounded-full bg-brand"
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-muted-foreground">
                {activity.text}
                <span className="text-xs"> · {activity.context}</span>
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {activity.time}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
