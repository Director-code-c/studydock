export function getSafeNextPath(rawNext: string | null | undefined) {
  if (!rawNext || rawNext === "/") {
    return "/dashboard"
  }

  if (!rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/dashboard"
  }

  if (rawNext.includes("://")) {
    return "/dashboard"
  }

  if (/[%]/.test(rawNext)) {
    try {
      const decoded = decodeURIComponent(rawNext)
      if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("://")) {
        return "/dashboard"
      }
    } catch {
      return "/dashboard"
    }
  }

  return rawNext
}
