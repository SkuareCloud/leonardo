"use client"

import { Combobox } from "@/components/combobox"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, humanizeNumber, humanizeTimeAgo } from "@/lib/utils"
import { MissionTypes, MissionWithExposureAndStats } from "@lib/api/models"
import { MissionStatus } from "@lib/api/orchestrator/types.gen"
import { logger } from "@lib/logger"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const missionColumns: ColumnDef<MissionWithExposureAndStats>[] = [
  {
    accessorKey: "mission_type",
    header: "Type",
    size: 150,
    filterFn: (row, id, value) => {
      return row.original.mission.mission_type.toLowerCase().includes(value.toLowerCase())
    },
    cell: ({ row }) => {
      const mission = row.original
      return <span className="font-medium">{mission.mission.mission_type}</span>
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 200,
    cell: ({ row }) => {
      const mission = row.original
      return <span className="w-[200px]">{mission.mission.description || "No description"}</span>
    },
  },
  {
    accessorKey: "status_code",
    header: "Status",
    size: 100,
    filterFn: (row, id, value) => {
      return row.original.mission.status_code?.toLowerCase().includes(value.toLowerCase()) || false
    },
    sortingFn: (rowA, rowB) => {
      const statusA = rowA.original.mission.status_code
      const statusB = rowB.original.mission.status_code
      const statusCodeToNumber = (status: MissionStatus | null | undefined) => {
        if (!status) return 0
        if (status === "running") return 3
        if (status === "completed") return 2
        if (status === "planned") return 1
        return 0
      }
      return statusCodeToNumber(statusA) - statusCodeToNumber(statusB)
    },
    cell: ({ row }) => {
      const mission = row.original
      const statusColors: Record<MissionStatus, { bg: string; text: string }> = {
        submitted: { bg: "bg-blue-50", text: "text-blue-800" },
        planning: { bg: "bg-amber-50", text: "text-amber-800" },
        failed_planning: { bg: "bg-red-50", text: "text-red-800" },
        running: { bg: "bg-yellow-50", text: "text-yellow-800" },
        completed: { bg: "bg-green-50", text: "text-green-800" },
        canceled: { bg: "bg-gray-50", text: "text-gray-800" },
        planned: { bg: "bg-purple-50", text: "text-purple-800" },
      }
      const colors = statusColors[mission.mission.status_code || "submitted"]
      return (
        <span className="w-[80px]">
          <Badge className={cn("px-2 text-[11px] uppercase", colors.bg, colors.text)}>
            {mission.mission.status_code || "submitted"}
          </Badge>
        </span>
      )
    },
  },
  {
    accessorKey: "scenarios",
    header: "Scenarios",
    size: 100,
    cell: ({ row }) => {
      const mission = row.original
      return <span>{mission.mission.scenarios_count || 0}</span>
    },
  },
  {
    accessorKey: "viewers_reach",
    header: "Viewers Reach",
    size: 150,
    sortingFn: (rowA, rowB) => {
      const potentialReachA = rowA.original.exposureStats?.potential_exposure || 0
      const potentialReachB = rowB.original.exposureStats?.potential_exposure || 0
      return potentialReachA - potentialReachB
    },
    cell: ({ row }) => {
      const mission = row.original
      const potentialReach = mission.exposureStats?.potential_exposure || 0
      const actualReach = mission.exposureStats?.actual_exposure || 0
      const percentage = potentialReach > 0 ? (actualReach / potentialReach) * 100 : 0
      return (
        <span>
          {humanizeNumber(actualReach)} / {humanizeNumber(potentialReach)} ({percentage.toFixed(0)}%)
        </span>
      )
    },
  },
  {
    accessorKey: "chats_reach",
    header: "Chats Reach",
    size: 150,
    sortingFn: (rowA, rowB) => {
      const potentialReachA = rowA.original.exposureStats?.potential_exposure_groups || 0
      const potentialReachB = rowB.original.exposureStats?.potential_exposure_groups || 0
      return potentialReachA - potentialReachB
    },
    cell: ({ row }) => {
      const mission = row.original
      const potentialReach = mission.exposureStats?.potential_exposure_groups || 0
      const actualReach = mission.exposureStats?.actual_exposure_groups || 0
      const percentage = potentialReach > 0 ? (actualReach / potentialReach) * 100 : 0
      return (
        <span>
          {humanizeNumber(actualReach)} / {humanizeNumber(potentialReach)} ({percentage.toFixed(0)}%)
        </span>
      )
    },
  },
    {
    accessorKey: "created_at",
    header: "Created",
    size: 150,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.mission.created_at)
      const dateB = new Date(rowB.original.mission.created_at)
      return dateA.getTime() - dateB.getTime()
    },
    cell: ({ row }) => {
      const mission = row.original
      return <DateTooltip date={new Date(mission.mission.created_at)} />
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    size: 150,
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.mission.updated_at)
      const dateB = new Date(rowB.original.mission.updated_at)
      return dateA.getTime() - dateB.getTime()
    },
    cell: ({ row }) => {
      const mission = row.original
      return <DateTooltip date={new Date(mission.mission.updated_at)} />
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    size: 200,
    cell: ({ row }) => {
      const mission = row.original
      return <span className="font-mono text-sm">{mission.mission.id}</span>
    },
  },
]

function DateTooltip({ date }: { date: Date }) {
  return (
    <Tooltip>
      <TooltipTrigger>{humanizeTimeAgo(date)}</TooltipTrigger>
      <TooltipContent>{date.toLocaleString()}</TooltipContent>
    </Tooltip>
  )
}

export function MissionsList({ data }: { data: MissionWithExposureAndStats[] }) {
  const router = useRouter()
  const [missions, setMissions] = useState<MissionWithExposureAndStats[]>(data)

  const refreshMissions = async () => {
    const missions = await new ServiceBrowserClient().getOrchestratorMissionsWithExposureAndStats()
    setMissions(missions)
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-4 max-w-[70vw] md:max-w-[1800px]">
        <DataTable
          columns={missionColumns}
          data={missions}
          enableRowSelection
          header={({ table }) => {
            const missionTypeOptions = MissionTypes.map(missionType => ({
              label: missionType,
              value: missionType,
            }))
            const missionTypeOptionsWithAll = [
              {
                label: "All",
                value: "",
              },
              ...missionTypeOptions,
            ]
            const statusOptions = [
              "submitted",
              "planning",
              "failed_planning",
              "running",
              "completed",
              "canceled",
              "planned",
            ] satisfies MissionStatus[]
            const statusOptionsWithAll = [
              {
                label: "All",
                value: "",
              },
              ...statusOptions.map(status => ({
                label: status.charAt(0).toUpperCase() + status.slice(1),
                value: status,
              })),
            ]
            return (
              <div className="flex flex-row gap-6 h-full items-center">
                <Combobox
                  options={missionTypeOptionsWithAll}
                  placeholder="Filter by type..."
                  value={(table.getColumn("mission_type")?.getFilterValue() as string) ?? ""}
                  onValueChange={value => table.getColumn("mission_type")?.setFilterValue(value)}
                  className="max-w-sm"
                />
                <Combobox
                  options={statusOptionsWithAll}
                  placeholder="Filter by status..."
                  value={(table.getColumn("status_code")?.getFilterValue() as string) ?? ""}
                  onValueChange={value => table.getColumn("status_code")?.setFilterValue(value)}
                  className="max-w-sm"
                />
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                  <>
                    <Separator orientation="vertical" className="mx-4 max-h-6 border-1" />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const selectedMissions = table.getFilteredSelectedRowModel().rows.map(row => row.original)
                        try {
                          for (const mission of selectedMissions) {
                            await new ServiceBrowserClient().deleteMission(mission.mission.id)
                          }
                          toast.success("Missions deleted")
                          table.resetRowSelection()
                        } catch (error) {
                          toast.error("Failed to delete at least one mission: " + error)
                          logger.error(error)
                        } finally {
                          await new Promise(resolve => setTimeout(resolve, 1000))
                          await refreshMissions()
                        }
                      }}
                    >
                      Delete selected
                    </Button>
                  </>
                )}
              </div>
            )
          }}
          onClickRow={row => {
            router.push(`/orchestrator/missions/${row.mission.id}`)
          }}
        />
      </div>
    </div>
  )
}
