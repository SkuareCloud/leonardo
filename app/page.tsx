import TelegramIcon from "@/assets/telegram.svg"
import SquaresCanvas from "@/components/squares-canvas"
import { getSocialNetworkStatus } from "@/lib/profile-utils"
import { cn } from "@/lib/utils"
import { ServiceClient } from "@lib/service-client"
import { CrosshairIcon, MessagesSquareIcon, PlusIcon, UserIcon } from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Shepherd",
    other: {
        items: "Dashboard|/",
    },
}

function Card({
    title,
    description,
    icon: Icon,
    containerClassName,
    iconContainerClassName,
    href,
}: {
    title: string
    description: string
    icon: React.ElementType
    containerClassName?: string
    iconContainerClassName?: string
    href: string | null
}) {
    return (
        <div className="group relative max-w-[14vw] min-w-80 rounded-xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div
                className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    containerClassName,
                )}
            />
            <Link href={href ?? ""}>
                <div className="relative z-10">
                    <div
                        className={cn(
                            "mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600",
                            iconContainerClassName,
                        )}
                    >
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </Link>
        </div>
    )
}

export default async function Page() {
    const serviceClient = new ServiceClient()
    const avatars = await serviceClient.getAvatars()

    // Count active Telegram avatars
    const activeTelegramAvatars = avatars.filter((avatar) => {
        const socialStatus = getSocialNetworkStatus(avatar)
        return socialStatus.telegram === true
    }).length

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
            <div className="fixed inset-0 z-[0] opacity-10">
                <SquaresCanvas direction="diagonal" speed={0.3} />
            </div>
            <div className="relative flex w-fit flex-col items-center justify-center">
                <div className="pointer-events-none absolute inset-0 left-1/2 z-2 h-[80px] w-[400px] -translate-x-1/2 rounded-full bg-white blur-2xl" />
                <h1 className="z-3 bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-6xl font-black text-transparent">
                    Shepherd
                </h1>
                <p className="z-3 mt-3 text-xl text-gray-500">
                    All-in-one conductor management platform.
                </p>
                <div className="my-6 h-[2px] w-8 rounded-full bg-gray-300" />

                {/* Active Avatars Stats */}
                <div className="z-3 mt-6 flex items-center gap-2 rounded-md border-1 border-blue-200/70 bg-gradient-to-br from-white/95 to-blue-50/80 px-4 py-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-10">
                        <div className="rounded-xl bg-blue-100/10 p-3">
                            <Image src={TelegramIcon} alt="Telegram" width={40} height={40} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold tracking-wide font-mono text-blue-600">
                                {activeTelegramAvatars}
                            </span>
                            <span className="text-md font-bold tracking-wide text-black-500">
                                Avatars
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex w-full flex-row items-center justify-center">
                <div className="flex flex-col flex-wrap gap-6">
                    <div className="relative rounded-xl border border-gray-200/50 bg-white/20 p-6 pt-10 backdrop-blur-sm">
                        <div className="absolute top-0 left-0 rounded-br-2xl border border-white/30 bg-gradient-to-r from-blue-50/20 to-blue-100/20 px-3 py-1 backdrop-blur-md">
                            <span className="text-[10px] font-normal tracking-wide text-blue-600 uppercase">
                                Missions
                            </span>
                        </div>
                        <div className="flex flex-row flex-wrap gap-6 pt-2">
                            <Card
                                title="View Missions"
                                description="Browse and manage all your active missions and their current status."
                                icon={CrosshairIcon}
                                containerClassName="from-blue-500/5 to-blue-600/5"
                                iconContainerClassName="from-blue-500 to-blue-600"
                                href="/orchestrator/missions"
                            />

                            <Card
                                title="Create Mission"
                                description="Set up new missions and configure their parameters and objectives."
                                icon={PlusIcon}
                                containerClassName="from-amber-500/5 to-amber-600/5"
                                iconContainerClassName="from-amber-500 to-amber-600"
                                href="/orchestrator/mission-builder"
                            />
                        </div>
                    </div>

                    <div className="relative w-fit rounded-xl border border-gray-200/50 bg-white/20 p-6 pt-10 backdrop-blur-sm">
                        <div className="flex flex-row flex-wrap gap-6 pt-2">
                            <div className="absolute top-0 left-0 rounded-br-2xl border border-white/30 bg-gradient-to-r from-purple-50/20 to-purple-100/20 px-3 py-1 backdrop-blur-md">
                                <span className="text-[10px] font-normal tracking-wide text-green-600 uppercase">
                                    Avatars
                                </span>
                            </div>
                            <Card
                                title="View Avatars"
                                description="Explore and manage your conductor avatars and their configurations."
                                icon={UserIcon}
                                containerClassName="from-green-500/5 to-green-600/10"
                                iconContainerClassName="from-green-500 to-green-600"
                                href="/avatars/avatars"
                            />
                            <div className="absolute top-0 right-0 rounded-br-2xl border border-white/30 bg-gradient-to-r from-purple-50/20 to-purple-100/20 px-3 py-1 backdrop-blur-md">
                                <span className="text-[10px] font-normal tracking-wide text-purple-600 uppercase">
                                    Chats
                                </span>
                            </div>
                            <Card
                                title="View Chats"
                                description="Browse and organize all chats with categories and search capabilities."
                                icon={MessagesSquareIcon}
                                containerClassName="from-purple-500/5 to-purple-600/10"
                                iconContainerClassName="from-purple-500 to-purple-600"
                                href="/orchestrator/chats"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
