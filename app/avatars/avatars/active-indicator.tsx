export function ActiveIndicator(
    { active, animate }: { active?: boolean; animate?: boolean } = { active: true, animate: true },
) {
    return (
        <span className="relative flex size-4 items-center justify-center">
            {active && animate && (
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-green-700 opacity-75" />
            )}
            {active ? (
                <span className="relative inline-flex size-2 animate-pulse rounded-full bg-green-500" />
            ) : (
                <span className="size-2 rounded-full bg-red-200" />
            )}
        </span>
    )
}
