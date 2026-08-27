export const OFFLINE_CACHE_DB_NAME = "studydock-offline"
export const OFFLINE_CACHE_DB_VERSION = 1
export const OFFLINE_CACHE_STORE = "courseSnapshots"

export type OfflineCourse = {
  id: string
  name: string
  code: string | null
  description: string | null
  color: string | null
  archived: boolean
  updated_at: string
}

export type OfflineCourseSnapshot = {
  userId: string
  syncedAt: string
  courses: OfflineCourse[]
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"))
      return
    }

    const request = indexedDB.open(OFFLINE_CACHE_DB_NAME, OFFLINE_CACHE_DB_VERSION)
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"))
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(OFFLINE_CACHE_STORE)) {
        database.createObjectStore(OFFLINE_CACHE_STORE, { keyPath: "userId" })
      }
    }
  })
}

export async function saveCourseSnapshot(
  userId: string,
  courses: OfflineCourse[],
  syncedAt = new Date().toISOString()
): Promise<void> {
  const database = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(OFFLINE_CACHE_STORE, "readwrite")
      transaction.objectStore(OFFLINE_CACHE_STORE).put({ userId, syncedAt, courses })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB write failed"))
      transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB write aborted"))
    })
  } finally {
    database.close()
  }
}

export async function getCourseSnapshot(userId: string): Promise<OfflineCourseSnapshot | null> {
  const database = await openDatabase()

  try {
    return await new Promise<OfflineCourseSnapshot | null>((resolve, reject) => {
      const transaction = database.transaction(OFFLINE_CACHE_STORE, "readonly")
      const request = transaction.objectStore(OFFLINE_CACHE_STORE).get(userId)
      request.onsuccess = () => resolve((request.result as OfflineCourseSnapshot | undefined) ?? null)
      request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"))
    })
  } finally {
    database.close()
  }
}

export async function clearCourseSnapshot(userId: string): Promise<void> {
  const database = await openDatabase()

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(OFFLINE_CACHE_STORE, "readwrite")
      transaction.objectStore(OFFLINE_CACHE_STORE).delete(userId)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB delete failed"))
      transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB delete aborted"))
    })
  } finally {
    database.close()
  }
}
