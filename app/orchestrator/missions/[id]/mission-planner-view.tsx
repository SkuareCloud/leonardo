"use client"

import ScenariosList from "@/app/operator/scenarios/scenarios"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ScenarioWithResult } from "@lib/api/operator"
import { MissionRead, ScenarioRead } from "@lib/api/orchestrator/types.gen"
import { useState } from "react"
import { MissionHeader } from "./mission-header"

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
        <CardTitle>Plan Mission</CardTitle>
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

export function MissionPlannerView({ mission, avatars }: { mission: MissionRead; avatars: AvatarModelWithProxy[] }) {
  const [plannedMissionScenarios, setPlannedMissionScenarios] = useState<ScenarioRead[]>([])
  const scenariosWithResult = plannedMissionScenarios.map((scenario: ScenarioRead) => ({
    [scenario.id]: {
      scenario,
      result: null,
    } satisfies ScenarioWithResult,
  }))
  return (
    <div className="flex flex-col w-full">
      <PageHeader title={`Mission ${mission.description}`} subtitle={mission.description}>
        <MissionHeader
          mission={mission}
          onPlanMission={scenarios => {
            setPlannedMissionScenarios(scenarios)
          }}
        />
      </PageHeader>
      <MissionProperties mission={mission} />
      {plannedMissionScenarios.length > 0 && <ScenariosList scenarios={scenariosWithResult} avatars={avatars} />}
    </div>
  )
}
