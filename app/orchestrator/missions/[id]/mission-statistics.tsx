"use client"

import { LabelList, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

            <Pie data={chartData} dataKey="count" nameKey="source" fill="fill">
              <LabelList
                dataKey="source"
                className="fill-background text-xs"
                stroke="none"
                fontSize={10}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label + " (" + chartData.find(d => d.source === value)?.count + ")"
                }
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="source" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
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
  // Group failure reasons by action_type and count them
  const failureReasonCounts = failureReasons.reduce((acc, action) => {
    const actionError = action.error || "unknown"
    acc[actionError] = (acc[actionError] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Generate dynamic colors based on error string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const chartData = Object.entries(failureReasonCounts)
    .filter(([_, count]) => count > 0)
    .map(([actionError, count]) => ({
      actionError,
      count,
      fill: stringToColor(actionError),
    }))

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col w-[500px]">
        <CardHeader className="items-center pb-0">
          <CardTitle>Failure Reasons</CardTitle>
          <CardDescription>No failures found</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No failure data available
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
        <ChartContainer config={{}} className="mx-auto aspect-square max-h-[450px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" nameKey="actionError" fill="fill">
              <LabelList
                dataKey="actionError"
                className="fill-background text-xs"
                stroke="none"
                fontSize={10}
                formatter={(value: string) =>
                  value + " (" + chartData.find(d => d.actionError === value)?.count + ")"
                }
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="actionError" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  )
}

function MissionSuccessfulChats({
  successfulChats,
  refreshing,
}: {
  successfulChats: ChatRead[]
  refreshing: boolean
}) {
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
            <div
              key={chat.id || index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
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
        {missionStatistics && (
          <MissionsScenarioStatistics statistics={missionStatistics} refreshing={isPending} />
        )}
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
