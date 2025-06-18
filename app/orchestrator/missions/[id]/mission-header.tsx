"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MissionRead, ScenarioRead } from "@lib/api/orchestrator/types.gen"
import { logger } from "@lib/logger"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { PlayIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function MissionHeader({
  mission,
  onPlanMission,
}: {
  mission: MissionRead
  onPlanMission: (scenarios: ScenarioRead[]) => void
}) {
  const router = useRouter()
  return (
    <div className="flex flex-row items-center gap-8">
      <div className="flex flex-row gap-2 text-[16px] tracking-wide text-nowrap items-center">
        <div className="text-gray-600">Current stage:</div>
        <Badge className="text-green-600 bg-green-50 text-[16px] uppercase flex flex-row items-center justify-center font-bold px-4 py-1">
          {mission.status_code}
        </Badge>
      </div>

      <Separator orientation="vertical" className="max-h-6 border-1" />

      <Button
        variant="destructive"
        className="cursor-pointer bg-red-100 text-red-900 hover:bg-red-200 scale-100 hover:scale-105 active:scale-95 transition-all"
        onClick={async () => {
          try {
            await new ServiceBrowserClient().deleteMission(mission.id)
            toast.success("Mission deleted")
            router.push("/orchestrator/missions")
          } catch (error) {
            toast.error(`Failed to delete mission: ${error}`)
            logger.error(error)
          }
        }}
      >
        Delete
      </Button>

      <Separator orientation="vertical" className="max-h-6 border-1" />

      {mission.status_code === "planned" && (
        <Button
          variant="default"
          className="cursor-pointer scale-100 hover:scale-105 active:scale-95 transition-all"
          onClick={async () => {
            try {
              const plannedMissionScenarios = await new ServiceBrowserClient().runMission(mission.id)
              onPlanMission(plannedMissionScenarios)
            } catch (error) {
              toast.error(`Failed to plan mission: ${error}`)
              logger.error(error)
            }
          }}
        >
          <PlayIcon className="w-4 h-4" />
          Run
        </Button>
      )}
    </div>
  )
}
