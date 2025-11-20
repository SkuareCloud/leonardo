"use client"

import { ActiveIndicator } from "@/app/avatars/avatars/active-indicator"
import { DataTable } from "@/components/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ProfileWorkerView } from "@lib/api/operator/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { useOperatorStore } from "@lib/store-provider"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { CircleStop, Loader2, RefreshCcwIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

const characterColumns: ColumnDef<ProfileWorkerView>[] = [
    {
        accessorKey: "id",
        header: "ID",
        size: 200,
        cell: ({ row }) => {
            const character = row.original
            return <span className="font-mono text-sm">{character.id}</span>
        },
    },
    {
        accessorKey: "state",
        header: "Status",
        size: 100,
        cell: ({ row }) => {
            const character = row.original
            const isActive = character.state === "working" || character.state === "idle"
            return (
                <span>
                    <Badge
                        className={cn(
                            character.state === "stopped" && "bg-gray-100 text-gray-800",
                            character.state === "working" && "bg-green-100 text-green-800",
                            character.state === "idle" && "bg-yellow-100 text-yellow-800",
                        )}
                    >
                        <div className="inline-flex flex-row items-center text-xs uppercase">
                            <ActiveIndicator active={character.state === "working"} />
                            {character.state}
                        </div>
                    </Badge>
                </span>
            )
        },
    },
    {
        accessorKey: "pending_actions",
        header: "Pending Actions",
        size: 100,
        cell: ({ row }) => {
            const character = row.original
            return (
                <span>
                    <Badge
                        className={cn(
                            character.pending_actions === 0 && "bg-gray-100 text-gray-800",
                            character.pending_actions > 0 && "bg-blue-100 text-blue-800",
                        )}
                    >
                        {character.pending_actions}
                    </Badge>
                </span>
            )
        },
    },
    {
        accessorKey: "current_scenario",
        header: "Current Scenario",
        size: 200,
        cell: ({ row }) => {
            const character = row.original
            return <span>{character.current_scenario?.id || "None"}</span>
        },
    },
    {
        accessorKey: "current_scenario_result",
        header: "Scenario Status",
        size: 150,
        cell: ({ row }) => {
            const character = row.original
            const status = character.current_scenario_result?.status?.status_code
            if (!status) return <span>No result</span>

            return (
                <span>
                    <Badge
                        className={cn(
                            status === "failed" && "bg-red-50 text-red-800",
                            status === "success" && "bg-green-100 text-green-800",
                            status === "pending" && "bg-yellow-100 text-yellow-800",
                            status === "finished" && "bg-blue-100 text-blue-800",
                        )}
                    >
                        {status}
                    </Badge>
                </span>
            )
        },
    },
    {
        accessorKey: "actions",
        header: "Actions",
        size: 100,
        cell: ({ row }) => {
            const character = row.original
            const handleStop = async () => {
                try {
                    const response = await fetch(`/api/operator/stop?profileId=${character.id}`, {
                        method: "POST",
                    })

                    if (response.ok) {
                        toast.success("Avatar stopped", {
                            description: "The avatar has been successfully stopped.",
                        })
                    } else {
                        const data = await response.json()
                        throw new Error(data.error || "Failed to stop avatar")
                    }
                } catch (error) {
                    toast.error("Failed to stop avatar", {
                        description:
                            error instanceof Error ? error.message : "An unexpected error occurred",
                    })
                }
            }

            if (character.state === "working" || character.state === "idle") {
                return (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="cursor-pointer uppercase hover:bg-amber-200"
                                variant="destructive"
                                size="sm"
                            >
                                <CircleStop className="mr-1 h-3 w-3" />
                                Stop
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Stop Avatar</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to stop this avatar? This will stop all
                                    current actions and close all resources.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleStop}>
                                    Stop Avatar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )
            }
            return null
        },
    },
]

export function CharactersList() {
    const operatorSlot = useOperatorStore((state) => state.operatorSlot)
    const previousOperatorSlotRef = useRef(operatorSlot)
    const [isSlotChanging, setIsSlotChanging] = useState(false)

    const {
        isPending,
        isRefetching,
        error,
        data: characters,
    } = useQuery({
        queryKey: ["operator-characters", operatorSlot],
        queryFn: () => new ServiceBrowserClient().getOperatorCharacters(operatorSlot),
        refetchInterval: 10000, // poll every 10 seconds
    })

    // Track operator slot changes and show loading state
    useEffect(() => {
        if (previousOperatorSlotRef.current !== operatorSlot) {
            setIsSlotChanging(true)
            toast.info(`Switching to Operator Slot ${operatorSlot}`, {
                description: "Loading avatars for the new slot...",
            })

            // Reset loading state after a short delay to allow the query to complete
            const timer = setTimeout(() => {
                setIsSlotChanging(false)
                toast.success(`Switched to Operator Slot ${operatorSlot}`, {
                    description: "Avatars loaded successfully.",
                })
            }, 2000)

            previousOperatorSlotRef.current = operatorSlot

            return () => clearTimeout(timer)
        }
    }, [operatorSlot])

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
                                Loading avatars for Operator Slot {operatorSlot}...
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col">
                    <div className="flex w-full flex-row pr-16">
                        <div className="mb-12 flex h-4 w-full flex-row items-center gap-6">
                            <Button
                                variant="link"
                                className="rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                                disabled
                            >
                                <RefreshCcwIcon className="size-3 text-gray-500" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex max-w-[1280px] flex-col gap-4">
                        <DataTable
                            columns={characterColumns}
                            data={characters || []}
                            isRefreshing={isRefetching}
                            header={({ table }) => {
                                return (
                                    <div>
                                        <Input
                                            placeholder="Filter by ID..."
                                            value={
                                                (table
                                                    .getColumn("id")
                                                    ?.getFilterValue() as string) ?? ""
                                            }
                                            onChange={(event) =>
                                                table
                                                    .getColumn("id")
                                                    ?.setFilterValue(event.target.value)
                                            }
                                            className="max-w-sm"
                                        />
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="flex w-full flex-col">
            <div className="flex w-full flex-row pr-16">
                <div className="mb-12 flex h-4 w-full flex-row items-center gap-6">
                    <Button
                        variant="link"
                        className="rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                        onClick={async () => {
                            // TODO: Implement refresh functionality
                        }}
                    >
                        <RefreshCcwIcon
                            className={cn(
                                "size-3 text-gray-500",
                                isRefetching && "animate-[spin_1s_linear_reverse_infinite]",
                            )}
                        />
                    </Button>
                </div>
            </div>
            <div className="flex max-w-[1280px] flex-col gap-4">
                <DataTable
                    columns={characterColumns}
                    data={characters || []}
                    isRefreshing={isRefetching}
                    header={({ table }) => {
                        return (
                            <div>
                                <Input
                                    placeholder="Filter by ID..."
                                    value={
                                        (table.getColumn("id")?.getFilterValue() as string) ?? ""
                                    }
                                    onChange={(event) =>
                                        table.getColumn("id")?.setFilterValue(event.target.value)
                                    }
                                    className="max-w-sm"
                                />
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    )
}
