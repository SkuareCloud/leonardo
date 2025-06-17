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
        "bg-background/70 backdrop-blur-md flex flex-row items-center sticky w-full top-0 p-0 z-10 pb-2 justify-between mb-6 border-b-1",
        className,
      )}
    >
      <div className="relative flex flex-row justify-between items-center pr-8 -left-8">
        <div className="flex px-10 flex-col items-start w-full py-4">
          <h2 className="text-3xl font-bold bg-gradient-to-tr from-red-600 to-amber-400 inline-block bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && <div className="text-lg font-medium text-gray-600">{subtitle}</div>}
        </div>
      </div>
      <div className="flex flex-row gap-2 h-full pr-8">
        {children && <div className="flex text-sm text-gray-600 flex-row gap-2 my-2">{children}</div>}
      </div>
    </header>
  )
}
