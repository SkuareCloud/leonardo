import { cn } from "@lib/utils";

export function ChatBubble({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-fit max-w-[80%] mb-4 flex items-start gap-2", className)}>
      <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/50 text-gray-900 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
        {children}
      </div>
    </div>
  )
}
