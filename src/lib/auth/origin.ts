import { headers } from "next/headers"

export async function getAppOrigin() {
  const headersList = await headers()
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host")
  const proto = headersList.get("x-forwarded-proto") ?? "https"

  if (!host) {
    return "http://localhost:3000"
  }

  return `${proto}://${host}`
}
