import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex h-[90vh] flex-col gap-4">
            <div className="flex flex-col gap-6">
                {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
            </div>
        </div>
    )
}
