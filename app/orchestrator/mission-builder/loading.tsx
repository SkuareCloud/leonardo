import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-8">
                <Skeleton className="h-36 w-1/5 rounded-xl" />
                <Skeleton className="h-36 w-1/5 rounded-xl" />
                <Skeleton className="h-36 w-1/5 rounded-xl" />
                <Skeleton className="h-36 w-1/5 rounded-xl" />
                <Skeleton className="h-36 w-1/5 rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
}
