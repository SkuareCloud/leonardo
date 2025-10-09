"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ViewJsonButton } from "@/components/view-json-button"
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
            {/* <ViewAttachmentsButton content={mission.payload} title="Attachments" subtitle="Attachments for the mission" /> */}

            <Separator orientation="vertical" className="max-h-6 border-1" />

            <ViewJsonButton
                content={mission}
                title="Mission JSON"
                subtitle="Full mission object in JSON format (read-only)"
            />

            <Separator orientation="vertical" className="max-h-6 border-1" />

            <div className="flex flex-row items-center gap-2 text-[16px] tracking-wide text-nowrap">
                <div className="text-gray-600">Current stage:</div>
                <Badge className="flex flex-row items-center justify-center bg-green-50 px-4 py-1 text-[16px] font-bold text-green-600 uppercase">
                    {mission.status_code}
                </Badge>
            </div>

            <Separator orientation="vertical" className="max-h-6 border-1" />

            <Button
                variant="destructive"
                className="scale-100 cursor-pointer bg-red-100 text-red-900 transition-all hover:scale-105 hover:bg-red-200 active:scale-95"
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
                    className="scale-100 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    onClick={async () => {
                        try {
                            const plannedMissionScenarios =
                                await new ServiceBrowserClient().runMission(mission.id)
                            onPlanMission(plannedMissionScenarios)
                        } catch (error) {
                            toast.error(`Failed to plan mission: ${error}`)
                            logger.error(error)
                        }
                    }}
                >
                    <PlayIcon className="h-4 w-4" />
                    Run
                </Button>
            )}
        </div>
    )
}
