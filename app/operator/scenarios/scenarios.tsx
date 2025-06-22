"use client"

import { CopyableTrimmedId } from "@/components/copyable-trimmed-id"
import { QueryClientWrapper } from "@/components/mission-view-wrapper"
import { DataTable } from "@/components/table"
import { Input } from "@/components/ui/input"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ScenarioWithResult } from "@lib/api/operator"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"

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
    header: "Profile Name",
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
            "px-2 py-1 rounded-full text-xs",
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
      return row.original.startTime ? new Date(row.original.startTime).toLocaleString() : "Not started"
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    size: 150,
    cell: ({ row }) => {
      return row.original.endTime ? new Date(row.original.endTime).toLocaleString() : "Not finished"
    },
  },
]

export function ScenariosList({
  scenarios,
  avatarsData,
}: {
  scenarios: { [key: string]: ScenarioWithResult }
  avatarsData: AvatarModelWithProxy[]
}) {
  return (
    <QueryClientWrapper>
      <ScenariosListInner scenarios={scenarios} avatarsData={avatarsData} />
    </QueryClientWrapper>
  )
}

const ScenariosListInner = ({
  scenarios: initialScenarios,
  avatarsData,
}: {
  scenarios: { [key: string]: ScenarioWithResult }
  avatarsData: AvatarModelWithProxy[]
}) => {
  const {
    isPending,
    isRefetching,
    error,
    data: scenarios,
  } = useQuery({
    queryKey: ["operator-scenarios"],
    queryFn: () => new ServiceBrowserClient().getOperatorScenarios(),
    initialData: initialScenarios,
    refetchInterval: 10000, // poll every 10 seconds
  })

  const data: ScenarioDataRow[] = Object.entries(scenarios || initialScenarios || {}).flatMap(
    ([scenarioId, scenarioWithResult]) => {
      const avatar = avatarsData.find(avatar => avatar.id === scenarioWithResult.scenario.profile.id)
      const profileName = 
        avatar?.data.eliza_character && typeof avatar.data.eliza_character === 'object' && avatar.data.eliza_character !== null
          ? (avatar.data.eliza_character as any).name || "Unknown Profile"
          : "Unknown Profile"

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

  return (
    <DataTable
      columns={columns}
      isRefreshing={isRefetching}
      initialSortingState={[{ id: "startTime", desc: true }]}
      data={data}
      onClickRow={row => {
        window.location.href = `/operator/scenarios/${row.scenarioId}`
      }}
      header={({ table }) => {
        return (
          <div>
            <Input
              placeholder="Filter by profile name..."
              value={(table.getColumn("profileName")?.getFilterValue() as string) ?? ""}
              onChange={event => table.getColumn("profileName")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          </div>
        )
      }}
    />
  )
}

export default ScenariosList
