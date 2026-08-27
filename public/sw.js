const CACHE_NAME = "studydock-offline-v1"
const OFFLINE_URL = "/offline.html"
const STATIC_ASSETS = [OFFLINE_URL, "/manifest.webmanifest", "/icon-192.svg", "/icon-512.svg"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== "GET" || url.origin !== self.location.origin) return
  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/login") || url.pathname.startsWith("/register")) return
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) return

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
  }
})
