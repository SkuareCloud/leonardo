export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-col">
      <h2 className="text-3xl font-bold bg-gradient-to-tr from-red-600 to-amber-400 inline-block bg-clip-text text-transparent">
        {title}
      </h2>

      {/* Backwards compat */}
      {subtitle && <h3 className="text-lg font-medium text-gray-600">{subtitle}</h3>}

      {children && <div className="flex text-sm text-gray-600 flex-row gap-2 my-2">{children}</div>}
      <hr className="w-full h-0.5 bg-gray-50 opacity-50 my-4" />
    </header>
  )
}
