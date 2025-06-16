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
import { AvatarModelWithProxy } from "@lib/api/avatars"

const chartConfig = {
  unknown: {
    label: "Unknown",
    color: "var(--chart-1)",
  },
  web1: {
    label: "WEB1",
    color: "var(--chart-2)",
  },
  web2: {
    label: "WEB2",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function AvatarsStats({ avatars }: { avatars: AvatarModelWithProxy[] }) {
  const activationSourcesHistogram = avatars.reduce((acc, avatar) => {
    const source = ((avatar.data.social_network_accounts as any)?.telegram?.activation_source as string).toLowerCase()
    if (source) {
      acc[source] = (acc[source] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(activationSourcesHistogram).map(([source, count]) => ({
    source,
    count,
    fill: chartConfig[source as keyof typeof chartConfig]?.color || "var(--chart-1)",
  }))

  return (
    <Card className="flex flex-col w-84 -0">
      <CardHeader className="items-center pb-0">
        <CardTitle>Avatars by activation source</CardTitle>
        <CardDescription>Total number of avatars by activation source</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
