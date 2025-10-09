"use client"

import { QueryClientWrapper } from "@/components/mission-view-wrapper"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { MissionRead, ScenarioRead } from "@lib/api/orchestrator/types.gen"
import { ListIcon, PieChartIcon } from "lucide-react"
import { useState } from "react"
import { OrchestratorScenariosList } from "../orchestrator-scenarios-list"
import { MissionHeader } from "./mission-header"
import { MissionStatistics } from "./mission-statistics"

function MissionField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="text-gray-500">{label}</div>
            <div className="text-gray-900">{children}</div>
        </div>
    )
}

function MissionProperties({ mission }: { mission: MissionRead }) {
    const createdAtFormatted = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(new Date(mission.created_at))
    const updatedAtFormatted = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(new Date(mission.updated_at))
    return (
        <Card className="border-0 shadow-2xl/10">
            <CardHeader>
                <CardTitle>Mission Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-8">
                    <div className="grid grid-cols-3 gap-2">
                        <MissionField label="ID">{mission.id}</MissionField>
                        <MissionField label="Status">{mission.status_code}</MissionField>
                        <MissionField label="Type">{mission.mission_type}</MissionField>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <MissionField label="Description">{mission.description}</MissionField>
                        <MissionField label="Created At">{createdAtFormatted} </MissionField>
                        <MissionField label="Updated At">{updatedAtFormatted}</MissionField>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function MissionView({
    mission,
    avatars,
}: {
    mission: MissionRead
    avatars: AvatarModelWithProxy[]
}) {
    const [plannedMission, setPlannedMission] = useState<{
        mission: MissionRead
        scenarios: ScenarioRead[]
    } | null>(null)

    return (
        <QueryClientWrapper>
            <div className="flex w-full flex-col">
                <PageHeader title={`Mission ${mission.description}`} subtitle={mission.description}>
                    <MissionHeader
                        mission={mission}
                        onPlanMission={(scenarios) => {
                            setPlannedMission({ mission, scenarios })
                        }}
                    />
                </PageHeader>
                <MissionProperties mission={mission} />
                <div className="mt-12 flex flex-col px-4">
                    <Tabs defaultValue="scenarios" className="w-full">
                        <TabsList className="grid w-[300px] grid-cols-2">
                            <TabsTrigger value="scenarios" className="flex items-center gap-2">
                                <ListIcon className="h-4 w-4" />
                                Scenarios
                            </TabsTrigger>
                            <TabsTrigger value="statistics" className="flex items-center gap-2">
                                <PieChartIcon className="h-4 w-4" />
                                Statistics
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="scenarios" className="mt-4">
                            <OrchestratorScenariosList
                                missionId={mission.id}
                                initialScenarios={mission.scenarios || []}
                                avatars={avatars || []}
                            />
                        </TabsContent>
                        <TabsContent value="statistics" className="mt-4">
                            {mission.status_code !== "planned" && (
                                <MissionStatistics mission={mission} />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </QueryClientWrapper>
    )
}
