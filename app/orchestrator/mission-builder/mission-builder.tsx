"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { MissionType, MissionTypes } from "@lib/api/models"
import { ScenarioWithResult } from "@lib/api/operator/types.gen"
import { useState } from "react"
import { EchoMissionBuilder } from "./echo-mission-builder"
import { SelectWithLabel } from "./mission-builder-utils"

export function MissionBuilder({
  scenarios,
  profiles,
}: {
  scenarios: Record<string, ScenarioWithResult>
  profiles: AvatarModelWithProxy[]
}) {
  const [missionType, setMissionType] = useState<MissionType>("EchoMission")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row max-w-[300px] gap-2 rounded-md shadow-xl px-6 py-4 bg-gray-50">
        <SelectWithLabel label="Mission Type">
          <Select value={missionType} onValueChange={value => setMissionType(value as MissionType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a mission type" />
            </SelectTrigger>
            <SelectContent>
              {MissionTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SelectWithLabel>
      </div>
      {missionType === "EchoMission" && <EchoMissionBuilder scenarios={scenarios || []} profiles={profiles} />}
    </div>
  )
}
