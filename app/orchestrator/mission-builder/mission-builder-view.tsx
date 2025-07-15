"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MissionType } from "@lib/api/models"
import { CategoryRead, ChatRead, MissionCreate, ScenarioRead } from "@lib/api/orchestrator"
import { zAllocateProfilesGroupsMissionInput, zEchoMissionInput, zFluffMissionInput, zMissionCreate, zPuppetShowInput, zRandomDistributionMissionInput } from "@lib/api/orchestrator/zod.gen"
import { logger } from "@lib/logger"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import { DicesIcon, DramaIcon, PlusIcon, PodcastIcon, RabbitIcon, ShuffleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"
import { MissionBuilderCreateView } from "./mission-builder-create-view"

const MissionMetadata: Record<
  MissionType,
  {
    name: string
    description: string
    icon: React.ElementType
    supported?: boolean
  }
> = {
  RandomDistributionMission: {
    name: "Mass send messages",
    description: "Send messages to multiple groups by multiple profiles.",
    supported: true,
    icon: DicesIcon,
  },
  EchoMission: {
    name: "Echo message",
    description: "Forward a message oraganiclly accross open and closed groups",
    supported: true,
    icon: PodcastIcon,
  },
  AllocateProfilesGroupsMission: {
    name: "Join groups",
    description: "Make profiles join groups and channels",
    supported: true,
    icon: ShuffleIcon,
  },
  PuppetShowMission: {
    name: "Puppet Show",
    description: "Orchestrate a debate on a certain group",
    supported: false,
    icon: DramaIcon,
  },
  FluffMission: {
    name: "Sync profiles",
    description: "Sync a group of characters with their platform feed and preferences",
    supported: true,
    icon: RabbitIcon,
  },
}

export function MissionBuilderView({
  scenarios,
  chats,
  categories,
}: {
  scenarios: ScenarioRead[]
  chats: ChatRead[]
  categories: CategoryRead[]
}) {
  const router = useRouter()
  const [selectedMissionType, setSelectedMissionType] = React.useState<MissionType>("RandomDistributionMission")
  const [missionCreateRequest, setMissionCreateRequest] = React.useState<Partial<MissionCreate>>()
  const [error, setError] = React.useState<string | null>(null)

  const MissionIcon = selectedMissionType && MissionMetadata[selectedMissionType].icon

  return (
    <div className="w-full gap-8">
      <PageHeader title="Mission Builder" subtitle="Create a new mission" className="z-10">
        <div className="flex flex-row gap-6">
          <div className="flex flex-row gap-2 text-[16px] tracking-wide text-nowrap items-center">
            <div className="text-gray-600">Mission:</div>
            <Badge className="text-blue-600 bg-blue-50 text-[16px] uppercase flex flex-row items-center justify-center font-bold px-4 py-1">
              {selectedMissionType && <MissionIcon className="size-8 mr-2" />}
              <div className="normal-case">{MissionMetadata[selectedMissionType].name}</div>
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-2 bg-gray-200" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="uppercase font-bold cursor-pointer scale-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (!selectedMissionType) return

                    if (!missionCreateRequest) {
                      toast.error("No request found. Check the JSON.")
                      return
                    }
                    if (!missionCreateRequest.payload) {
                      toast.error("No payload found. Check the JSON.")
                      setError("No payload found. Check the JSON.")
                      return
                    }
                    logger.info("Validating mission request", missionCreateRequest)
                    const validatedMissionRequest = zMissionCreate.safeParse(missionCreateRequest)
                    logger.info("Validated mission request", validatedMissionRequest)
                    if (validatedMissionRequest.error) {
                      toast.error("Invalid mission request: " + validatedMissionRequest.error.message)
                      setError(validatedMissionRequest.error.message)
                      return
                    }

                    // validate specific mission payload
                    if (selectedMissionType === "EchoMission") {
                      const validatedPayload = zEchoMissionInput.safeParse(missionCreateRequest.payload)
                      if (validatedPayload.error) {
                        toast.error("Invalid payload: " + validatedPayload.error.message)
                        setError(validatedPayload.error.message)
                        return
                      }
                    } else if (selectedMissionType === "AllocateProfilesGroupsMission") {
                      const validatedPayload = zAllocateProfilesGroupsMissionInput.safeParse(missionCreateRequest.payload)
                      if (validatedPayload.error) {
                        toast.error("Invalid payload: " + validatedPayload.error.message)
                        setError(validatedPayload.error.message)
                        return
                      }
                    } else if (selectedMissionType === "PuppetShowMission") {
                      const validatedPayload = zPuppetShowInput.safeParse(missionCreateRequest.payload)
                      if (validatedPayload.error) {
                        toast.error("Invalid payload: " + validatedPayload.error.message)
                        setError(validatedPayload.error.message)
                        return
                      }
                    } else if (selectedMissionType === "FluffMission") {
                      const validatedPayload = zFluffMissionInput.safeParse(missionCreateRequest.payload)
                      if (validatedPayload.error) {
                        toast.error("Invalid payload: " + validatedPayload.error.message)
                        setError(validatedPayload.error.message)
                        return
                      }
                    } else if (selectedMissionType === "RandomDistributionMission") {
                      const validatedPayload = zRandomDistributionMissionInput.safeParse(missionCreateRequest.payload)
                      if (validatedPayload.error) {
                        toast.error("Invalid payload: " + validatedPayload.error.message)
                        setError(validatedPayload.error.message)
                        return
                      }
                    }

                    const serviceBrowserClient = new ServiceBrowserClient()
                    try {
                      const response = await serviceBrowserClient.submitMission(missionCreateRequest as MissionCreate)
                      if (response) {
                        toast.success("Mission submitted successfully")
                        router.push(`/orchestrator/missions/${response.id}`)
                      } else {
                        toast.error("Failed to submit mission")
                      }
                      const plannedMissionScenarios = await new ServiceBrowserClient().planMission(response.id)
                      if (plannedMissionScenarios) {
                        toast.success("Mission planned successfully")
                        router.push(`/orchestrator/missions/${response.id}`)
                      } else {
                        toast.error("Failed to plan mission")
                      }
                      await new Promise(resolve => setTimeout(resolve, 1000))
                    } catch (error) {
                      toast.error("Failed to submit mission: " + error)
                      setError(error instanceof Error ? error.message : "Unknown error")
                    }
                  }}
                >
                  <PlusIcon className="size-4 mr-2" />
                  Submit and Plan
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="w-64 py-4 flex flex-row items-center">
                This will create a new mission and redirect you to the mission page to plan the mission
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PageHeader>
      <ul className="w-full flex flex-row gap-8 mb-16">
        {Object.entries(MissionMetadata).map(([type, data]) => {
          return (
            <li key={type}>
              <Card
                className={cn(
                  "h-42 w-[280px] select-none px-4 py-1 text-left flex flex-col gap-2 relative border-2 text-[16px]",
                  data.supported &&
                    "cursor-pointer scale-100 select-none hover:scale-105 active:scale-95 transition-all hover:bg-gray-50",
                  !data.supported &&
                    "bg-[repeating-linear-gradient(45deg,theme(colors.yellow.50/10),theme(colors.yellow.50/10)_10px,transparent_10px,transparent_20px)]",
                  selectedMissionType === type && "border-blue-400",
                )}
                onClick={() => {
                  if (!data.supported) return
                  return setSelectedMissionType(type as MissionType)
                }}
              >
                {!data.supported && (
                  <div className="uppercase tracking-wide absolute top-2 right-2 bg-yellow-100 text-yellow-900 text-xs px-3 py-1 rounded-full font-medium">
                    Unsupported
                  </div>
                )}
                <CardHeader className="flex flex-row text-left p-2">
                  <CardTitle className="flex flex-col gap-2 pt-4">
                    <data.icon className="size-4 mb-2" />
                    <div>{data.name}</div>
                  </CardTitle>
                </CardHeader>
                <CardDescription className="px-2 text-left">{data.description}</CardDescription>
              </Card>
            </li>
          )
        })}
      </ul>
      {selectedMissionType && (
        <Card>
          <CardContent>
            <MissionBuilderCreateView
              mission={selectedMissionType}
              scenarios={scenarios}
              chats={chats}
              categories={categories}
              onChangeRequest={setMissionCreateRequest}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
