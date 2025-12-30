"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MissionType } from "@lib/api/models"
import { CategoryRead, ChatRead, MissionCreate, ScenarioRead } from "@lib/api/orchestrator"
import {
    zAllocateProfilesGroupsMissionInput,
    zEchoMissionInput,
    zFluffMissionInput,
    zMassDmMissionInput,
    zPuppetShowInput,
    zRandomDistributionMissionInput
} from "@lib/api/orchestrator/zod.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import {
    DicesIcon,
    Loader2,
    PlusIcon,
    PodcastIcon,
    RabbitIcon,
    ShuffleIcon
} from "lucide-react"
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
    // PuppetShowMission: {
    //     name: "Puppet Show",
    //     description: "Orchestrate a debate on a certain group",
    //     supported: false,
    //     icon: DramaIcon,
    // },
    FluffMission: {
        name: "Sync profiles",
        description: "Sync a group of characters with their platform feed and preferences",
        supported: true,
        icon: RabbitIcon,
    },
    // MassDmMission: {
    //     name: "Mass DM",
    //     description: "Send direct messages to a contact list using many profiles",
    //     supported: false,
    //     icon: Mail,
    // },
    // ResolvePhoneMission: {
    //     name: "Resolve Phone",
    //     description: "Resolve phone numbers to usernames and collect results",
    //     supported: false,
    //     icon: Phone,
    // },
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
    const [selectedMissionType, setSelectedMissionType] = React.useState<MissionType>(
        "RandomDistributionMission",
    )
    const [missionCreateRequest, setMissionCreateRequest] = React.useState<Partial<MissionCreate>>()
    const [error, setError] = React.useState<string | null>(null)
    const [isSubmittingMission, setIsSubmittingMission] = React.useState(false)

    const MissionIcon = selectedMissionType && MissionMetadata[selectedMissionType].icon

    return (
        <div className="w-full gap-8">
            <PageHeader title="Mission Builder" subtitle="Create a new mission" className="z-10">
                <div className="flex flex-row gap-6">
                    <div className="flex flex-row items-center gap-2 text-[16px] tracking-wide text-nowrap">
                        <div className="text-gray-600">Mission:</div>
                        <Badge className="flex flex-row items-center justify-center bg-blue-50 px-4 py-1 text-[16px] font-bold text-blue-600 uppercase">
                            {selectedMissionType && <MissionIcon className="mr-2 size-8" />}
                            <div className="normal-case">
                                {MissionMetadata[selectedMissionType].name}
                            </div>
                        </Badge>
                    </div>

                    <Separator orientation="vertical" className="h-2 bg-gray-200" />

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className="scale-100 cursor-pointer font-bold uppercase transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isSubmittingMission}
                                    onClick={async () => {
                                        if (isSubmittingMission) {
                                            return
                                        }
                                        setIsSubmittingMission(true)
                                        try {
                                            if (!selectedMissionType) return

                                            if (selectedMissionType === "ResolvePhoneMission") {
                                                const payloadAny = missionCreateRequest?.payload as any
                                                const csvFile: File | undefined = payloadAny?.csv_file
                                                if (!csvFile) {
                                                    toast.error("CSV file is required")
                                                    setError("CSV file is required")
                                                    return
                                                }
                                                try {
                                                    const scenarios =
                                                        await new ServiceBrowserClient().submitResolvePhoneMission(
                                                            {
                                                                csv_file: csvFile,
                                                                characters_categories:
                                                                    payloadAny?.characters_categories,
                                                                max_phones_per_scenario:
                                                                    payloadAny?.max_phones_per_scenario,
                                                                time_between_scenarios:
                                                                    payloadAny?.time_between_scenarios,
                                                                batch_size: payloadAny?.batch_size,
                                                                batch_interval:
                                                                    payloadAny?.batch_interval,
                                                            },
                                                        )
                                                    toast.success("Resolve phone mission submitted")
                                                    const missionId =
                                                        Array.isArray(scenarios) && scenarios.length > 0
                                                            ? scenarios[0]?.mission_id
                                                            : undefined
                                                    // Update description if provided
                                                    const desc =
                                                        missionCreateRequest?.description?.trim()
                                                    if (missionId && desc) {
                                                        try {
                                                            await new ServiceBrowserClient().updateMissionDescription(
                                                                missionId,
                                                                desc,
                                                            )
                                                        } catch {}
                                                    }
                                                    if (missionId) {
                                                        await new Promise((resolve) => {
                                                            setTimeout(resolve, 2000)
                                                        })
                                                        router.refresh()
                                                        router.push(
                                                            `/orchestrator/missions/${missionId}`,
                                                        )
                                                    }
                                                } catch (error) {
                                                    toast.error("Failed to submit mission: " + error)
                                                    setError(
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Unknown error",
                                                    )
                                                }
                                                return
                                            }

                                            if (!missionCreateRequest) {
                                                toast.error("No request found. Check the JSON.")
                                                return
                                            }
                                            if (!missionCreateRequest.payload) {
                                                toast.error("No payload found. Check the JSON.")
                                                setError("No payload found. Check the JSON.")
                                                return
                                            }
                                            if (
                                                !missionCreateRequest.description ||
                                                !missionCreateRequest.description.trim()
                                            ) {
                                                toast.error("Description is required")
                                                setError("Description is required")
                                                return
                                            }

                                        // validate specific mission payload
                                        if (selectedMissionType === "EchoMission") {
                                            const validatedPayload = zEchoMissionInput.safeParse(
                                                missionCreateRequest.payload,
                                            )
                                            if (validatedPayload.error) {
                                                toast.error(
                                                    "Invalid payload: " +
                                                        validatedPayload.error.message,
                                                )
                                                setError(validatedPayload.error.message)
                                                return
                                            }
                                        } else if (
                                            selectedMissionType === "AllocateProfilesGroupsMission"
                                        ) {
                                            const validatedPayload =
                                                zAllocateProfilesGroupsMissionInput.safeParse(
                                                    missionCreateRequest.payload,
                                                )
                                            if (validatedPayload.error) {
                                                toast.error(
                                                    "Invalid payload: " +
                                                        validatedPayload.error.message,
                                                )
                                                setError(validatedPayload.error.message)
                                                return
                                            }
                                        } else if (selectedMissionType === "PuppetShowMission") {
                                            const validatedPayload = zPuppetShowInput.safeParse(
                                                missionCreateRequest.payload,
                                            )
                                            if (validatedPayload.error) {
                                                toast.error(
                                                    "Invalid payload: " +
                                                        validatedPayload.error.message,
                                                )
                                                setError(validatedPayload.error.message)
                                                return
                                            }
                                        } else if (selectedMissionType === "FluffMission") {
                                            const validatedPayload = zFluffMissionInput.safeParse(
                                                missionCreateRequest.payload,
                                            )
                                            if (validatedPayload.error) {
                                                toast.error(
                                                    "Invalid payload: " +
                                                        validatedPayload.error.message,
                                                )
                                                setError(validatedPayload.error.message)
                                                return
                                            }
                                        } else if (
                                            selectedMissionType === "RandomDistributionMission"
                                        ) {
                                            const validatedPayload =
                                                zRandomDistributionMissionInput.safeParse(
                                                    missionCreateRequest.payload,
                                                )
                                            if (validatedPayload.error) {
                                                toast.error(
                                                    "Invalid payload: " +
                                                        validatedPayload.error.message,
                                                )
                                                setError(validatedPayload.error.message)
                                                return
                                            }
                                        } else if (selectedMissionType === "MassDmMission") {
                                            const validatedPayload = zMassDmMissionInput.safeParse(
                                                missionCreateRequest.payload,
                                            )
                                            if (validatedPayload.error) {
                                                toast.error(
                                                    "Invalid payload: " +
                                                        validatedPayload.error.message,
                                                )
                                                setError(validatedPayload.error.message)
                                                return
                                            }
                                            const payloadAny = missionCreateRequest.payload as any
                                            const hasText =
                                                payloadAny?.message?.text &&
                                                payloadAny.message.text.trim().length > 0
                                            const hasAttachments =
                                                Array.isArray(payloadAny?.message?.attachments) &&
                                                payloadAny.message.attachments.length > 0
                                            if (!hasText && !hasAttachments) {
                                                toast.error("Message content is required")
                                                setError("Message content is required")
                                                return
                                            }
                                        }

                                        const serviceBrowserClient = new ServiceBrowserClient()
                                        try {
                                            const response =
                                                await serviceBrowserClient.submitMission(
                                                    missionCreateRequest as MissionCreate,
                                                )
                                            if (response) {
                                                toast.success("Mission submitted successfully")
                                                router.push(`/orchestrator/missions/${response.id}`)
                                            } else {
                                                toast.error("Failed to submit mission")
                                            }
                                            const plannedMissionScenarios =
                                                await new ServiceBrowserClient().planMission(
                                                    response.id,
                                                )
                                            if (plannedMissionScenarios) {
                                                toast.success("Mission planned successfully")
                                                router.push(`/orchestrator/missions/${response.id}`)
                                            } else {
                                                toast.error("Failed to plan mission")
                                            }
                                            await new Promise((resolve) => {
                                                setTimeout(resolve, 2000)
                                            })
                                            router.refresh()
                                        } catch (error) {
                                            const errorMessage =
                                                error instanceof Error ? error.message : String(error)
                                            // Extract the innermost error message if it's wrapped
                                            const match = errorMessage.match(
                                                /"([^"]+)"$/,
                                            )
                                            const cleanMessage = match ? match[1] : errorMessage
                                            toast.error(cleanMessage)
                                            setError(cleanMessage)
                                        }
                                    } finally {
                                        setIsSubmittingMission(false)
                                    }
                                }}
                                >
                                    {isSubmittingMission ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <PlusIcon className="mr-2 size-4" />
                                            Submit and Plan
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side="left"
                                className="flex w-64 flex-row items-center py-4"
                            >
                                This will create a new mission and redirect you to the mission page
                                to plan the mission
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </PageHeader>
            <ul className="mb-16 flex w-full flex-row gap-8">
                {Object.entries(MissionMetadata).map(([type, data]) => {
                    return (
                        <li key={type}>
                            <Card
                                className={cn(
                                    "relative flex h-42 w-[280px] flex-col gap-2 border-2 px-4 py-1 text-left text-[16px] select-none",
                                    data.supported &&
                                        "scale-100 cursor-pointer transition-all select-none hover:scale-105 hover:bg-gray-50 active:scale-95",
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
                                    <div className="absolute top-2 right-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium tracking-wide text-yellow-900 uppercase">
                                        Unsupported
                                    </div>
                                )}
                                <CardHeader className="flex flex-row p-2 text-left">
                                    <CardTitle className="flex flex-col gap-2 pt-4">
                                        <data.icon className="mb-2 size-4" />
                                        <div>{data.name}</div>
                                    </CardTitle>
                                </CardHeader>
                                <CardDescription className="px-2 text-left">
                                    {data.description}
                                </CardDescription>
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
