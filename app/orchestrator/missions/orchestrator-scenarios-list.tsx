import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ScenarioRead } from "@lib/api/orchestrator/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { CheckIcon, ClockFadingIcon, XIcon } from "lucide-react"

interface ScenarioDataRow {
  scenarioId: string
  profileId: string
  profileName: string
  status?: string
  error?: string | null
  triggerTime?: string
}

const columns: ColumnDef<ScenarioDataRow>[] = [
  {
    accessorKey: "scenarioId",
    header: "Scenario ID",
    size: 50,
    cell: ({ row }) => {
      return <div>{row.original.scenarioId}</div>
    },
  },
  {
    accessorKey: "profileName",
    header: "Profile Name",
    size: 100,
    cell: ({ row }) => {
      return <div>{row.original.profileName}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 50,
    cell: ({ row }) => {
      return <StatusBadge status={row.original.status as any} />
    },
  },
  {
    accessorKey: "triggerTime",
    header: "Trigger Time",
    size: 50,
    cell: ({ row }) => {
      return <div>{row.original.triggerTime}</div>
    },
  },
]

function StatusBadge({ status }: { status: string }) {
  let icon = null
  let className = ""
  if (status === "success") {
    icon = <CheckIcon className="w-4 h-4" />
    className = "bg-green-100 text-green-700"
  }
  if (status === "failed") {
    icon = <XIcon className="w-4 h-4" />
    className = "bg-red-100 text-red-700"
  } else if (status === "pending" || status === "planned") {
    icon = <ClockFadingIcon className="w-4 h-4" />
    className = "bg-yellow-100 text-yellow-700"
  }
  return (
    <Badge
      variant="secondary"
      className={cn("py-2 flex flex-row items-center gap-2 uppercase tracking-wide", className)}
    >
      {icon} {status}
    </Badge>
  )
}

export function OrchestratorScenariosList({
  missionId,
  initialScenarios,
  avatars,
}: {
  missionId: string
  initialScenarios: ScenarioRead[]
  avatars: AvatarModelWithProxy[]
}) {
  const {
    isRefetching,
    error,
    data: scenarios,
  } = useQuery({
    queryKey: ["mission-scenarios", missionId],
    queryFn: () =>
      new ServiceBrowserClient().getOrchestratorMission(missionId).then(mission => mission.scenarios || []),
    initialData: initialScenarios,
    refetchInterval: 10000, // poll every 10 seconds
  })

  const data = (scenarios || initialScenarios || []).map(scenario => {
    const avatar = avatars.find(avatar => avatar.id === scenario.character_id)
    return {
      scenarioId: scenario.id,
      profileId: scenario.character_id,
      profileName: avatar?.data.eliza_character?.name || "Unknown Profile",
      status: scenario.status_code,
      error: scenario.error,
      triggerTime: scenario.trigger_time || undefined,
    } satisfies ScenarioDataRow
  })

  return (
    <DataTable
      columns={columns}
      isRefreshing={isRefetching}
      initialSortingState={[{ id: "triggerTime", desc: true }]}
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
