import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-8">
        <Skeleton className="w-1/5 h-36 rounded-xl" />
        <Skeleton className="w-1/5 h-36 rounded-xl" />
        <Skeleton className="w-1/5 h-36 rounded-xl" />
        <Skeleton className="w-1/5 h-36 rounded-xl" />
        <Skeleton className="w-1/5 h-36 rounded-xl" />
      </div>
      <Skeleton className="w-full h-64" />
      <Skeleton className="w-full h-64" />
    </div>
  )
}
