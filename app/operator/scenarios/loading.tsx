import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 h-[90vh]">
      <div className="flex flex-col gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-12 rounded-md" />
        ))}
      </div>
    </div>
  )
}
