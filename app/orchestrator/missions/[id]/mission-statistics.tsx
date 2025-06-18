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
import { MissionRead } from "@lib/api/orchestrator/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

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

  return (
    <div className="flex flex-col w-full ">
      {missionStatistics && <MissionsScenarioStatistics statistics={missionStatistics} refreshing={isPending} />}
    </div>
  )
}
