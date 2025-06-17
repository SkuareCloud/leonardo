import { Suspense } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  )
}
