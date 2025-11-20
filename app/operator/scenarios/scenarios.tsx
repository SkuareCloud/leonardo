"use client"

import { CopyableTrimmedId } from "@/components/copyable-trimmed-id"
import { QueryClientWrapper } from "@/components/mission-view-wrapper"
import { DataTable } from "@/components/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { useOperatorStore } from "@lib/store-provider"
import { cn } from "@lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface ScenarioDataRow {
    scenarioId: string
    profileId: string
    profileName: string
    status: string
    startTime: string
    endTime: string | null
    error: string | null
}

const columns: ColumnDef<ScenarioDataRow>[] = [
    {
        accessorKey: "scenarioId",
        header: "Scenario ID",
        size: 150,
        cell: ({ row }) => {
            return <CopyableTrimmedId id={row.original.scenarioId} />
        },
    },
    {
        accessorKey: "profileName",
        header: "Avatar Name",
        size: 100,
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 20,
        cell: ({ row }) => {
            const status = row.original.status
            return (
                <span
                    className={cn(
                        "rounded-full px-2 py-1 text-xs",
                        status === "success" && "bg-green-100 text-green-800",
                        status === "failed" && "bg-red-100 text-red-800",
                        status === "pending" && "bg-yellow-100 text-yellow-800",
                        status === "finished" && "bg-blue-100 text-blue-800",
                    )}
                >
                    {status}
                </span>
            )
        },
    },
    {
        accessorKey: "error",
        header: "Error",
        size: 50,
        cell: ({ row }) => {
            return row.original.error || "-"
        },
    },
    {
        accessorKey: "startTime",
        header: "Start Time",
        size: 150,
        cell: ({ row }) => {
            return row.original.startTime
                ? new Date(row.original.startTime).toLocaleString()
                : "Not started"
        },
    },
    {
        accessorKey: "endTime",
        header: "End Time",
        size: 150,
        cell: ({ row }) => {
            return row.original.endTime
                ? new Date(row.original.endTime).toLocaleString()
                : "Not finished"
        },
    },
]

export function ScenariosList({ avatarsData }: { avatarsData: AvatarModelWithProxy[] }) {
    return (
        <QueryClientWrapper>
            <ScenariosListInner avatarsData={avatarsData} />
        </QueryClientWrapper>
    )
}

const ScenariosListInner = ({
    // scenarios: initialScenarios,
    avatarsData,
}: {
    // scenarios: { [key: string]: ScenarioWithResult }
    avatarsData: AvatarModelWithProxy[]
}) => {
    const router = useRouter()
    const operatorSlot = useOperatorStore((state) => state.operatorSlot)
    const previousOperatorSlotRef = useRef(operatorSlot)
    const [isSlotChanging, setIsSlotChanging] = useState(false)

    const {
        isPending,
        isRefetching,
        error,
        data: scenarios,
    } = useQuery({
        queryKey: [operatorSlot],
        queryFn: () => new ServiceBrowserClient().getOperatorScenarios(operatorSlot),
        // initialData: initialScenarios,
        refetchInterval: 10000, // poll every 10 seconds
    })

    // Track operator slot changes and show loading state
    useEffect(() => {
        if (previousOperatorSlotRef.current !== operatorSlot) {
            setIsSlotChanging(true)
            toast.info(`Switching to Operator Slot ${operatorSlot}`, {
                description: "Loading scenarios for the new slot...",
            })

            // Reset loading state after a short delay to allow the query to complete
            const timer = setTimeout(() => {
                setIsSlotChanging(false)
                toast.success(`Switched to Operator Slot ${operatorSlot}`, {
                    description: "Scenarios loaded successfully.",
                })
            }, 2000)

            previousOperatorSlotRef.current = operatorSlot

            return () => clearTimeout(timer)
        }
    }, [operatorSlot])

    const data: ScenarioDataRow[] = Object.entries(scenarios || {}).flatMap(
        ([scenarioId, scenarioWithResult]) => {
            const avatar = avatarsData.find(
                (avatar) => avatar.id === scenarioWithResult.scenario.profile.id,
            )
            const profileName =
                avatar?.data.eliza_character &&
                typeof avatar.data.eliza_character === "object" &&
                avatar.data.eliza_character !== null
                    ? (avatar.data.eliza_character as any).name || "Unknown Avatar"
                    : "Unknown Avatar"

            return {
                scenarioId,
                profileId: scenarioWithResult.scenario.profile.id || scenarioId,
                profileName,
                status: scenarioWithResult.result?.status?.status_code || "pending",
                startTime: scenarioWithResult.result?.scenario_info?.start_time?.toString() || "",
                endTime: scenarioWithResult.result?.scenario_info?.end_time?.toString() || null,
                error: scenarioWithResult.result?.status?.error || null,
            }
        },
    )

    // Show loading overlay when slot is changing
    if (isSlotChanging) {
        return (
            <>
                <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-background flex flex-col items-center gap-4 rounded-lg border p-8 shadow-lg">
                        <Loader2 className="text-primary h-8 w-8 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold">Switching Operator Slot</h3>
                            <p className="text-muted-foreground text-sm">
                                Loading scenarios for Operator Slot {operatorSlot}...
                            </p>
                        </div>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    isRefreshing={isRefetching}
                    initialSortingState={[{ id: "startTime", desc: true }]}
                    data={data}
                    onClickRow={(row) => {
                        router.push(`/operator/scenarios/${row.scenarioId}`)
                    }}
                    header={({ table }) => {
                        return (
                            <div className="flex flex-row gap-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="profileName">Avatar Name</Label>
                                    <Input
                                        id="profileName"
                                        placeholder="Filter by avatar name..."
                                        value={
                                            (table
                                                .getColumn("profileName")
                                                ?.getFilterValue() as string) ?? ""
                                        }
                                        onChange={(event) =>
                                            table
                                                .getColumn("profileName")
                                                ?.setFilterValue(event.target.value)
                                        }
                                        className="w-[30ch]"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="scenarioId">Scenario ID</Label>
                                    <Input
                                        id="scenarioId"
                                        placeholder="Filter by scenario ID..."
                                        value={
                                            (table
                                                .getColumn("scenarioId")
                                                ?.getFilterValue() as string) ?? ""
                                        }
                                        onChange={(event) =>
                                            table
                                                .getColumn("scenarioId")
                                                ?.setFilterValue(event.target.value)
                                        }
                                        className="w-[30ch]"
                                    />
                                </div>
                            </div>
                        )
                    }}
                />
            </>
        )
    }

    return (
        <DataTable
            columns={columns}
            isRefreshing={isRefetching}
            initialSortingState={[{ id: "startTime", desc: true }]}
            data={data}
            onClickRow={(row) => {
                router.push(`/operator/scenarios/${row.scenarioId}`)
            }}
            header={({ table }) => {
                return (
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="profileName">Avatar Name</Label>
                            <Input
                                id="profileName"
                                placeholder="Filter by avatar name..."
                                value={
                                    (table.getColumn("profileName")?.getFilterValue() as string) ??
                                    ""
                                }
                                onChange={(event) =>
                                    table
                                        .getColumn("profileName")
                                        ?.setFilterValue(event.target.value)
                                }
                                className="w-[30ch]"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="scenarioId">Scenario ID</Label>
                            <Input
                                id="scenarioId"
                                placeholder="Filter by scenario ID..."
                                value={
                                    (table.getColumn("scenarioId")?.getFilterValue() as string) ??
                                    ""
                                }
                                onChange={(event) =>
                                    table
                                        .getColumn("scenarioId")
                                        ?.setFilterValue(event.target.value)
                                }
                                className="w-[30ch]"
                            />
                        </div>
                    </div>
                )
            }}
        />
    )
}

export default ScenariosList
