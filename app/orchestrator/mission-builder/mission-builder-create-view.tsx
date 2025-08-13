"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { MissionType } from "@lib/api/models"
import { CategoryRead, ChatRead, MissionCreate, ScenarioRead } from "@lib/api/orchestrator"
import { Editor } from "@monaco-editor/react"
import { useCallback, useEffect, useState } from "react"
import { AllocateProfilesGroupsMissionBuilder } from "./allocate-profiles-groups-mission-builder"
import { EchoMissionBuilder } from "./echo-mission-builder"
import { FluffMissionBuilder } from "./fluff-mission-builder"
import { MassMessageMissionBuilder } from "./mass-message-mission"
import { MissionBuilderContext } from "./mission-builder-context"
import { InputWithLabel } from "./mission-builder-utils"
import { PuppetShowMissionBuilder } from "./puppet-show-mission-builder"
import { RandomDistributionMissionBuilder } from "./random-distribution-mission-builder"

export function MissionBuilderCreateView({
  mission,
  scenarios,
  chats,
  categories,
  onChangeRequest,
}: {
  mission: MissionType
  scenarios: ScenarioRead[]
  chats: ChatRead[]
  categories: CategoryRead[]
  onChangeRequest: (request: Partial<MissionCreate>) => void
}) {
  const [specificMissionPayload, setSpecificMissionPayload] = useState<Partial<MissionCreate>>()
  const [missionCreateRequest, setMissionCreateRequest] = useState<Partial<MissionCreate>>()

  // common properties
  const [description, setDescription] = useState("")
  const [descriptionError, setDescriptionError] = useState<string | null>(null)

  const onChangeMissionPayload = useCallback((payload: Partial<MissionCreate>) => {
    const specificMissionPayload: Partial<MissionCreate> = {
      ...payload,
    }
    setSpecificMissionPayload(specificMissionPayload)
  }, [])

  const validateDescription = (desc: string): boolean => {
    if (!desc.trim()) {
      setDescriptionError("Description is required")
      return false
    }
    setDescriptionError(null)
    return true
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    if (value.trim()) {
      validateDescription(value)
    } else {
      setDescriptionError("Description is required")
    }
  }

  useEffect(() => {
    const missionCreateRequest: Partial<MissionCreate> = {}
    if (mission) {
      missionCreateRequest.mission_type = mission
    }
    if (description) {
      missionCreateRequest.description = description
    }
    if (Object.keys(specificMissionPayload || {}).length > 0) {
      missionCreateRequest.payload = specificMissionPayload
    }
    setMissionCreateRequest(missionCreateRequest)
    onChangeRequest(missionCreateRequest)
  }, [mission, description, specificMissionPayload, onChangeRequest])

  let missionName = ""
  if (mission === "EchoMission") {
    missionName = "Echo Mission"
  } else if (mission === "AllocateProfilesGroupsMission") {
    missionName = "Allocate Profiles Groups Mission"
  } else if (mission === "PuppetShowMission") {
    missionName = "Puppet Show Mission"
  } else if (mission === "FluffMission") {
    missionName = "Fluff Mission"
  } else if (mission === "RandomDistributionMission") {
    missionName = "Random Distribution Mission"
  } else if (mission === "MassDmMission") {
    missionName = "Mass DM Mission"
  }

  return (
    <MissionBuilderContext.Provider value={{ onChangeMissionPayload, missionType: mission as MissionType }}>
      <div className="flex flex-col max-w-[80vw]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="pr-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <InputWithLabel 
                  label="Description" 
                  required
                  placeholder="Enter a description for this mission"
                  value={description}
                  onChange={e => handleDescriptionChange(e.target.value)}
                  className={descriptionError ? "border-red-500" : ""}
                />
                {descriptionError && (
                  <div className="text-red-500 text-sm">{descriptionError}</div>
                )}
              </div>
              <Separator orientation="horizontal" className="my-4" />
              {mission === "EchoMission" && (
                <EchoMissionBuilder chats={chats} scenarios={scenarios || []} categories={categories || []} />
              )}
              {mission === "AllocateProfilesGroupsMission" && (
                <AllocateProfilesGroupsMissionBuilder categories={categories || []} />
              )}
              {mission === "PuppetShowMission" && (
                <PuppetShowMissionBuilder />
              )}
              {mission === "FluffMission" && (
                <FluffMissionBuilder categories={categories || []} />
              )}
              {mission === "RandomDistributionMission" && (
                <RandomDistributionMissionBuilder chats={chats} categories={categories || []} />
              )}
              {mission === "MassDmMission" && (
                <MassMessageMissionBuilder categories={categories || []} />
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="pl-8" defaultSize={20}>
            <div className="flex flex-col gap-1 mb-12">
              <h2 className="text-lg font-bold">Mission Payload</h2>
              <p className="text-sm text-gray-500 text-wrap">JSON that will be sent to mission creation endpoint.</p>
            </div>
            <Editor
              height="90vh"
              defaultLanguage="json"
              value={JSON.stringify(missionCreateRequest, null, 2)}
              className="text-[16px] w-[20vw]"
              options={{ fontSize: 16, minimap: { enabled: false } }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </MissionBuilderContext.Provider>
  )
}
