import { PageHeader } from "@/components/page-header"
import { S3ImagesModal } from "@/components/s3-images-modal"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ViewJsonButton } from "@/components/view-json-button"
import { ScenarioRead } from "@lib/api/orchestrator/types.gen"
import { ServiceClient } from "@lib/service-client"
import ActionsList from "./actions-list"

const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    })
}

export default async function OrchestratorMissionScenarioPage({
    params,
}: {
    params: { id: string; scenarioId: string }
}) {
    const { scenarioId } = await params
    if (!scenarioId) {
        throw new Error("Scenario ID is required")
    }

    const serviceClient = new ServiceClient()
    const scenario: ScenarioRead | null =
        await serviceClient.getOrchestratorScenarioById(scenarioId)
    if (!scenario) {
        throw new Error("Scenario not found")
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "success":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-red-100 text-red-800"
        }
    }

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6 flex items-center justify-between">
                <PageHeader title={`Scenario ${scenario.id}`} subtitle={scenario.description} />
                <div className="flex gap-2">
                    <ViewJsonButton
                        content={scenario}
                        title="Scenario JSON"
                        subtitle="Full scenario object in JSON format (read-only)"
                    />
                    <S3ImagesModal scenarioId={scenario.id} />
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scenario Status</CardTitle>
                            <CardDescription>
                                Current status and progress of the scenario
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant="outline"
                                    className={`text-lg ${getStatusColor(scenario.status_code || "pending")}`}
                                >
                                    {(scenario.status_code || "pending").charAt(0).toUpperCase() +
                                        (scenario.status_code || "pending").slice(1)}
                                </Badge>
                                <div className="flex flex-col gap-2">
                                    {scenario.start_time && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-500">
                                                Started:
                                            </span>
                                            <span className="text-gray-700">
                                                {formatDate(scenario.start_time)}
                                            </span>
                                        </div>
                                    )}
                                    {scenario.end_time && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-gray-500">
                                                Ended:
                                            </span>
                                            <span className="text-gray-700">
                                                {formatDate(scenario.end_time)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {scenario.error && (
                                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                                    <div className="text-sm font-medium text-red-800">Error:</div>
                                    <div className="mt-1 text-sm text-red-600">
                                        {scenario.error}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {scenario.prefrences &&
                                    Object.entries(scenario.prefrences).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-600">
                                                {key
                                                    .replace(/_/g, " ")
                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </span>
                                            <span className="font-medium">
                                                {value?.toString() ?? "N/A"}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Scenario Actions</CardTitle>
                        <CardDescription>List of actions in this scenario</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ActionsList actions={scenario.actions} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
