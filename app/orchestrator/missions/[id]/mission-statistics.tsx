"use client"

import { Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart"
import { MissionStatistics as MissionStatisticsType } from "@lib/api/models"
import { ActionRead, ChatRead, MissionRead } from "@lib/api/orchestrator/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { useQuery } from "@tanstack/react-query"
import { Loader2, MessageCircle, Users } from "lucide-react"

const chartConfig = {
  SCHEDULED: {
    label: "Scheduled",
    color: "var(--missions-stats-chart-scheduled)",
  },
  PENDING: {
    label: "Pending",
    color: "var(--missions-stats-chart-pending)",
  },
  IN_PROCESS: {
    label: "In Process",
    color: "var(--missions-stats-chart-in-process)",
  },
  RUNNING: {
    label: "Running",
    color: "var(--missions-stats-chart-running)",
  },
  FAILED: {
    label: "Failed",
    color: "var(--missions-stats-chart-failed)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "var(--missions-stats-chart-cancelled)",
  },
  SUCCESS: {
    label: "Success",
    color: "var(--missions-stats-chart-success)",
  },
} satisfies ChartConfig

// Custom tooltip for mission statistics
function MissionStatisticsTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0]
  const total = data.payload.total || 0
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0.0"

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <div className="font-medium text-sm">
        {chartConfig[data.name as keyof typeof chartConfig]?.label || data.name}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Count: {data.value} ({percentage}%)
      </div>
    </div>
  )
}

// Custom tooltip for failure reasons
function FailureReasonsTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0]
  const total = data.payload.total || 0
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0.0"

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
      <div className="font-medium text-sm break-words">{data.name}</div>
      <div className="text-xs text-muted-foreground mt-1">
        Count: {data.value} ({percentage}%)
      </div>
    </div>
  )
}

// Custom legend for mission statistics
function MissionStatisticsLegend({ payload }: any) {
  if (!payload || !payload.length) return null

  const total = payload.reduce((sum: number, item: any) => sum + (item.payload?.count || 0), 0)

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-6">
      {payload.map((entry: any, index: number) => {
        const count = entry.payload?.count || 0
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
        const displayName = chartConfig[entry.value as keyof typeof chartConfig]?.label || entry.value
        const truncatedName = displayName.length > 30 ? displayName.substring(0, 30) + "..." : displayName
        return (
          <div key={index} className="flex items-center gap-2 text-xs bg-muted/50 px-3 py-2 rounded-lg w-[200px]">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium truncate" title={displayName}>
                {truncatedName}
              </span>
              <span className="text-muted-foreground">{percentage}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Custom legend for failure reasons
function FailureReasonsLegend({ payload }: any) {
  if (!payload || !payload.length) return null

  const total = payload.reduce((sum: number, item: any) => sum + (item.payload?.count || 0), 0)

  return (
    <div className="flex flex-wrap gap-3 justify-center mt-6">
      {payload.map((entry: any, index: number) => {
        const count = entry.payload?.count || 0
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
        const displayName = entry.value.length > 30 ? entry.value.substring(0, 30) + "..." : entry.value
        return (
          <div key={index} className="flex items-center gap-2 text-xs bg-muted/50 px-3 py-2 rounded-lg w-[200px]">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium truncate" title={entry.value}>
                {displayName}
              </span>
              <span className="text-muted-foreground">{percentage}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MissionsScenarioStatistics({
  statistics,
  refreshing,
}: {
  statistics: MissionStatisticsType
  refreshing: boolean
}) {
  const chartData = Object.entries(statistics)
    .filter(
      ([key, value]) =>
        (key === "SCHEDULED" ||
          key === "PENDING" ||
          key === "IN_PROCESS" ||
          key === "RUNNING" ||
          key === "SUCCESS" ||
          key === "FAILED" ||
          key === "CANCELLED") &&
        value > 0,
    )
    .map(([source, count]) => ({
      source,
      count,
      fill: chartConfig[source as keyof typeof chartConfig]?.color || "var(--chart-1)",
    }))

  const total = chartData.reduce((sum, item) => sum + item.count, 0)
  const chartDataWithTotal = chartData.map(item => ({
    ...item,
    total,
  }))

  return (
    <Card className="flex flex-col w-[500px] -0">
      <CardHeader className="items-center pb-0">
        <CardTitle>Mission Statistics</CardTitle>
        <CardDescription>Total number of scenarios by status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {refreshing && (
          <div className="flex flex-row items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        )}
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[450px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<MissionStatisticsTooltip />} />
            <Pie
              data={chartDataWithTotal}
              dataKey="count"
              nameKey="source"
              fill="fill"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              stroke="var(--background)"
              strokeWidth={2}
            />
            <ChartLegend
              content={<MissionStatisticsLegend payload={chartDataWithTotal} />}
              className="mt-6 flex-wrap gap-3 justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  )
}

function MissionFailureReasonsChart({
  failureReasons,
  refreshing,
}: {
  failureReasons: ActionRead[]
  refreshing: boolean
}) {
  // Group failure reasons by error_code (with fallback to error) and count them
  const failureReasonCounts = failureReasons.reduce((acc, action) => {
    const actionError = action.error_code || action.error || "unknown"
    acc[actionError] = (acc[actionError] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Generate dynamic colors based on error string
  const stringToColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 60%)`
  }

  const chartData = Object.entries(failureReasonCounts)
    .filter(([_, count]) => count > 0)
    .map(([actionError, count]) => ({
      actionError,
      count,
      fill: stringToColor(actionError),
    }))

  const total = chartData.reduce((sum, item) => sum + item.count, 0)
  const chartDataWithTotal = chartData.map(item => ({
    ...item,
    total,
  }))

  // Check if we have any failure data to display
  if (chartDataWithTotal.length === 0) {
    return (
      <Card className="flex flex-col w-[500px]">
        <CardHeader className="items-center pb-0">
          <CardTitle>Failure Reasons</CardTitle>
          <CardDescription>
            {safeFailureReasons.length === 0 ? "No failures found" : "No failure data available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            {safeFailureReasons.length === 0 ? "No failure data available" : "Processing failure data..."}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col w-[500px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Failure Reasons</CardTitle>
        <CardDescription>Failed actions by type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {refreshing && (
          <div className="flex flex-row items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        )}
        <ChartContainer config={{}} className="mx-auto aspect-square max-h-[750px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<FailureReasonsTooltip />} />
            <Pie
              data={chartDataWithTotal}
              dataKey="count"
              nameKey="actionError"
              fill="fill"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              stroke="var(--background)"
              strokeWidth={2}
            />
            <ChartLegend
              content={<FailureReasonsLegend payload={chartDataWithTotal} />}
              className="mt-6 flex-wrap gap-3 justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  )
}

function MissionSuccessfulChats({ successfulChats, refreshing }: { successfulChats: ChatRead[]; refreshing: boolean }) {
  if (successfulChats.length === 0) {
    return (
      <Card className="flex flex-col w-[500px]">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Successful Chats
          </CardTitle>
          <CardDescription>No successful chats found</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No successful chats available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col w-[500px]">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Successful Chats ({successfulChats.length})
        </CardTitle>
        <CardDescription>Target chats that received a message</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {refreshing && (
          <div className="flex flex-row items-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        )}
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {successfulChats.map((chat, index) => (
            <div key={chat.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium truncate max-w-[200px]">
                    {chat.username || chat.platform_id || chat.id}
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {chat.participants_count && `${chat.participants_count} participants`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  )
}

export function MissionStatistics({ mission }: { mission: MissionRead }) {
  const {
    isPending,
    error,
    data: missionStatistics,
  } = useQuery({
    queryKey: ["mission-statistics", mission.id],
    queryFn: () => new ServiceBrowserClient().getMissionStatistics(mission.id),
    refetchInterval: 10000, // poll every 10 seconds
  })

  const {
    isPending: isFailureReasonsPending,
    error: failureReasonsError,
    data: failureReasons,
  } = useQuery({
    queryKey: ["mission-failure-reasons", mission.id],
    queryFn: () => new ServiceBrowserClient().getMissionFailureReasons(mission.id),
    refetchInterval: 10000, // poll every 10 seconds
  })

  const {
    isPending: isSuccessfulChatsPending,
    error: successfulChatsError,
    data: successfulChats,
  } = useQuery({
    queryKey: ["mission-successful-chats", mission.id],
    queryFn: () => new ServiceBrowserClient().getMissionSuccessfulChats(mission.id),
    refetchInterval: 10000, // poll every 10 seconds
  })

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-wrap gap-6">
        {missionStatistics && <MissionsScenarioStatistics statistics={missionStatistics} refreshing={isPending} />}
        {failureReasons && (
          <MissionFailureReasonsChart failureReasons={failureReasons} refreshing={isFailureReasonsPending} />
        )}
        {successfulChats && (
          <MissionSuccessfulChats successfulChats={successfulChats} refreshing={isSuccessfulChatsPending} />
        )}
      </div>
    </div>
  )
}
