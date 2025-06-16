"use client"

import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { MissionRead, MissionStatus } from "@lib/api/orchestrator/types.gen"
import { ColumnDef } from "@tanstack/react-table"
import { RefreshCcwIcon } from "lucide-react"
import { useState } from "react"

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
  const [isRefreshing, setIsRefreshing] = useState(false)

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full pr-16">
        <div className="mb-12 flex flex-row items-center gap-6 h-4 w-full">
          <Button
            variant="link"
            className="bg-gray-100 p-1 rounded-full hover:bg-gray-200"
            onClick={async () => {
              setIsRefreshing(true)
              // TODO: Implement refresh functionality
              setIsRefreshing(false)
            }}
          >
            <RefreshCcwIcon
              className={cn("size-3 text-gray-500", isRefreshing && "animate-[spin_1s_linear_reverse_infinite]")}
            />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <DataTable
          columns={missionColumns}
          data={initialMissions}
          header={({ table }) => {
            return (
              <div>
                <Input
                  placeholder="Filter by type..."
                  value={(table.getColumn("mission_type")?.getFilterValue() as string) ?? ""}
                  onChange={event => table.getColumn("mission_type")?.setFilterValue(event.target.value)}
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
