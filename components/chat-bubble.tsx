import { cn } from "@lib/utils"

export function ChatBubble({
    children,
    className,
}: {
    children?: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("relative mb-4 flex w-fit max-w-[80%] items-start gap-2", className)}>
            <div className="flex-1 rounded-2xl rounded-tl-none bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
                {children}
            </div>
        </div>
    )
}
