"use client"

import { Combobox } from "@/components/combobox"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { MissionTypes } from "@lib/api/models"
import { MissionRead, MissionStatus } from "@lib/api/orchestrator/types.gen"
import { logger } from "@lib/logger"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const missionColumns: ColumnDef<MissionRead>[] = [
  {
    accessorKey: "mission_type",
    header: "Type",
    size: 150,
    cell: ({ row }) => {
      const mission = row.original
      return <span className="font-medium">{mission.mission_type}</span>
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 200,
    cell: ({ row }) => {
      const mission = row.original
      return <span>{mission.description || "No description"}</span>
    },
  },
  {
    accessorKey: "status_code",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const mission = row.original
      const statusColors: Record<MissionStatus, { bg: string; text: string }> = {
        submitted: { bg: "bg-blue-50", text: "text-blue-800" },
        planning: { bg: "bg-amber-50", text: "text-amber-800" },
        failed_planning: { bg: "bg-red-50", text: "text-red-800" },
        running: { bg: "bg-green-50", text: "text-green-800" },
        completed: { bg: "bg-gray-50", text: "text-gray-800" },
        canceled: { bg: "bg-gray-50", text: "text-gray-800" },
        planned: { bg: "bg-purple-50", text: "text-purple-800" },
      }
      const colors = statusColors[mission.status_code || "submitted"]
      return (
        <span>
          <Badge className={cn(colors.bg, colors.text)}>{mission.status_code || "submitted"}</Badge>
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
      return <span>{mission.scenarios?.length || 0}</span>
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    size: 150,
    cell: ({ row }) => {
      const mission = row.original
      return <span>{new Date(mission.created_at).toLocaleString()}</span>
    },
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    size: 150,
    cell: ({ row }) => {
      const mission = row.original
      return <span>{new Date(mission.updated_at).toLocaleString()}</span>
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    size: 200,
    cell: ({ row }) => {
      const mission = row.original
      return <span className="font-mono text-sm">{mission.id}</span>
    },
  },
]

export function MissionsList({ missions: initialMissions }: { missions: MissionRead[] }) {
  const router = useRouter()
  const [missions, setMissions] = useState<MissionRead[]>(initialMissions)

  const refreshMissions = async () => {
    const missions = await new ServiceBrowserClient().getOrchestratorMissions()
    setMissions(missions)
  }

  return (
    <div className="flex flex-col w-full">
      <PageHeader title="Missions" subtitle="View and manage missions" />
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <DataTable
          columns={missionColumns}
          data={missions}
          enableRowSelection
          header={({ table }) => {
            return (
              <div className="flex flex-row gap-6 h-full items-center">
                <Combobox
                  options={MissionTypes.map(missionType => ({
                    label: missionType,
                    value: missionType,
                  }))}
                  placeholder="Filter by type..."
                  value={(table.getColumn("mission_type")?.getFilterValue() as string) ?? ""}
                  onValueChange={value => table.getColumn("mission_type")?.setFilterValue(value)}
                  className="max-w-sm"
                />
                <Combobox
                  options={(
                    [
                      "submitted",
                      "planning",
                      "failed_planning",
                      "running",
                      "completed",
                      "canceled",
                      "planned",
                    ] satisfies MissionStatus[]
                  ).map(status => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: status,
                  }))}
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
                            await new ServiceBrowserClient().deleteMission(mission.id)
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
            router.push(`/orchestrator/missions/${row.id}`)
          }}
        />
      </div>
    </div>
  )
}
