import SquaresCanvas from "@/components/squares-canvas"
import { cn } from "@/lib/utils"
import { CrosshairIcon, PlusIcon, UserIcon } from "lucide-react"
import { Metadata } from "next"
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
    <div className="group relative bg-white/10 min-w-80 max-w-[14vw] backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          containerClassName,
        )}
      />
      <Link href={href ?? ""}>
        <div className="relative z-10">
          <div
            className={cn(
              "w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4",
              iconContainerClassName,
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </Link>
    </div>
  )
}

export default function Page() {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center px-4">
      <div className="fixed inset-0 z-[0] opacity-10">
        <SquaresCanvas direction="diagonal" speed={0.3} />
      </div>
      <div className="relative w-fit flex flex-col items-center justify-center">
        <div className="z-2 absolute w-[400px] -translate-x-1/2 left-1/2 h-[80px] inset-0 bg-white pointer-events-none blur-2xl rounded-full" />
        <h1 className="z-3 text-6xl font-black bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
          Shepherd
        </h1>
        <p className="mt-3 z-3 text-xl text-gray-500">All-in-one conductor management platform.</p>
        <div className="w-8 h-[2px] bg-gray-300 my-6 rounded-full" />
      </div>

      <div className="mt-12 w-full flex flex-row items-center justify-center">
        <div className="flex flex-col flex-wrap gap-6">
          <div className="relative border border-gray-200/50 rounded-xl p-6 pt-10 bg-white/20 backdrop-blur-sm">
            <div className="absolute left-0 top-0 bg-gradient-to-r from-blue-50/20 to-blue-100/20 px-3 py-1 backdrop-blur-md rounded-br-2xl border border-white/30">
              <span className="text-[10px] font-normal tracking-wide uppercase text-blue-600">Missions</span>
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

          <div className="relative w-fit border border-gray-200/50 rounded-xl p-6 pt-10 bg-white/20 backdrop-blur-sm">
            <div className="absolute left-0 top-0 bg-gradient-to-r from-green-50/20 to-green-100/20 px-3 py-1 backdrop-blur-md rounded-br-2xl border border-white/30">
              <span className="text-[10px] font-normal tracking-wide uppercase text-green-600">Avatars</span>
            </div>
            <div className="flex flex-row flex-wrap gap-6 pt-2">
              <Card
                title="View Avatars"
                description="Explore and manage your conductor avatars and their configurations."
                icon={UserIcon}
                containerClassName="from-green-500/5 to-green-600/10"
                iconContainerClassName="from-green-500 to-green-600"
                href="/avatars/avatars"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
