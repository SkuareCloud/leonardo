export function ActiveIndicator({ active, animate }: { active?: boolean, animate?: boolean } = { active: true, animate: true }) {
    return <span className="relative flex items-center justify-center size-4">
        {active && animate && <span className="absolute inline-flex h-full w-full animate-pulse rounded-full opacity-75 bg-green-700" />}
        {active ? <span className="relative inline-flex bg-green-500 animate-pulse rounded-full size-2" /> : <span className="bg-red-200 rounded-full size-2" />}
    </span>
}