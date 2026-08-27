"use client"

import { useEffect } from "react"

import { saveCourseSnapshot, type OfflineCourse } from "@/lib/db/offline-cache"

export function CourseCacheSync({
  userId,
  courses,
}: {
  userId: string
  courses: Array<OfflineCourse & { [key: string]: unknown }>
}) {
  useEffect(() => {
    const snapshotCourses: OfflineCourse[] = courses.map(({ id, name, code, description, color, archived, updated_at }) => ({
      id,
      name,
      code,
      description,
      color,
      archived,
      updated_at,
    }))

    void saveCourseSnapshot(userId, snapshotCourses).catch(() => {
      console.error("课程离线缓存写入失败。")
    })
  }, [courses, userId])

  return null
}
