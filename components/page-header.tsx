import { cn } from "@/lib/utils"

export function PageHeader({
    title,
    subtitle,
    className,
    children,
}: {
    title: string
    subtitle?: React.ReactNode
    className?: string
    children?: React.ReactNode
}) {
    return (
        <header
            className={cn(
                "bg-background/70 sticky top-0 z-10 mb-6 flex w-full flex-row items-center justify-between border-b-1 p-0 pb-2 backdrop-blur-md",
                className,
            )}
        >
            <div className="relative -left-8 flex flex-row items-center justify-between pr-8">
                <div className="flex w-full flex-col items-start px-10 py-4">
                    <h2 className="inline-block bg-gradient-to-tr from-red-600 to-amber-400 bg-clip-text text-3xl font-bold text-transparent">
                        {title}
                    </h2>
                    {subtitle && (
                        <div className="text-lg font-medium text-gray-600">{subtitle}</div>
                    )}
                </div>
            </div>
            <div className="flex h-full flex-row gap-2 pr-8">
                {children && (
                    <div className="my-2 flex flex-row gap-2 text-sm text-gray-600">{children}</div>
                )}
            </div>
        </header>
    )
}
