import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function waitUntil(condition: () => boolean, timeout: number = 20_000, retryIntervalMs: number = 100) {
  const startTime = Date.now()

  return new Promise<void>((resolve, reject) => {
    const checkCondition = () => {
      if (condition()) {
        resolve()
        return
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Condition not met after ${timeout}ms`))
        return
      }

      setTimeout(checkCondition, retryIntervalMs)
    }

    checkCondition()
  })
}

export function humanizeTimeAgo(date: Date) {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`
  }
  if (diffInSeconds > 0) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`
  }
  return "just now"
}

export function humanizeNumber(number: number) {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`
  }
  return number.toString()
}