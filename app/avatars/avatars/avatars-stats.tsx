"use client"

import { LabelList, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { AvatarRead } from "@lib/api/avatars"

const chartConfig = {
    available: {
        label: "Available",
        color: "var(--chart-1)",
    },
    active: {
        label: "Active",
        color: "var(--chart-2)",
    },
    pending: {
        label: "Pending",
        color: "var(--chart-3)",
    },
    invalid: {
        label: "Invalid",
        color: "var(--chart-4)",
    },
    unknown: {
        label: "Unknown",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function AvatarsStats({ avatars }: { avatars: AvatarRead[] }) {
    const stateHistogram = avatars.reduce((acc, avatar) => {
        const state = avatar.avatar_state?.state?.toLowerCase() || "unknown"
        acc[state] = (acc[state] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(stateHistogram).map(([state, count]) => ({
        source: state,
        count,
        fill: chartConfig[state as keyof typeof chartConfig]?.color || "var(--chart-1)",
    }))

    return (
        <Card className="-0 flex w-84 flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Avatars by state</CardTitle>
                <CardDescription>Total number of avatars by state</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[450px]"
                >
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

                        <Pie data={chartData} dataKey="count" nameKey="source" fill="fill">
                            <LabelList
                                dataKey="source"
                                className="fill-background text-xs"
                                stroke="none"
                                fontSize={10}
                                formatter={(value: keyof typeof chartConfig) =>
                                    chartConfig[value]?.label +
                                    " (" +
                                    chartData.find((d) => d.source === value)?.count +
                                    ")"
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
