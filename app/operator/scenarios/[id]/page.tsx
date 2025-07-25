import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ScenarioWithResult } from "@lib/api/operator/types.gen"
import { ServiceClient } from "@lib/service-client"
import { ClockIcon, FlagIcon } from "lucide-react"
import { ViewJsonButton } from "../../../../components/view-json-button"
import { OperatorSlotDisplay } from "../../components/operator-slot-display"
import { ScenarioFormModal } from "../scenario-form-modal"
import ActionsList from "./actions-list"
import { LogButtons } from "./log-buttons"
import { ProfileIdLink } from "./profile-id-link"
import { S3ImagesModal } from "./s3-images-modal"

const formatDate = (date: Date, withoutDate: boolean = false) => {
  return date.toLocaleString("en-GB", {
    day: withoutDate ? undefined : "2-digit",
    month: withoutDate ? undefined : "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export default async function ScenarioPage({ params }: { params: { id: string } }) {
  const { id } = await params
  if (!id) {
    throw new Error("Scenario ID is required")
  }

  const serviceClient = new ServiceClient()
  const scenario: ScenarioWithResult | null = await serviceClient.getOperatorScenarioById(id)
  const avatars: AvatarModelWithProxy[] = await serviceClient.getAvatars()

  if (!scenario) {
    throw new Error("Scenario not found")
  }

  const getStatusColor = (status: string) => {
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
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title={`Scenario ${scenario.scenario.id}`}
          subtitle={<ProfileIdLink profileId={scenario.scenario.profile.id || ""} avatars={avatars} />}
        ></PageHeader>
        <div className="flex gap-2">
          <LogButtons scenarioId={scenario.scenario.id || ""} profileId={scenario.scenario.profile.id || ""} />
          <ViewJsonButton
            content={scenario}
            title="Scenario JSON"
            subtitle="Full scenario object in JSON format (read-only)"
          />
          <S3ImagesModal scenarioId={scenario.scenario.id || ""} />
          <ScenarioFormModal avatars={avatars} initialScenario={scenario.scenario} isNew={false} />
        </div>
      </div>
      <div className="mb-6">
        <OperatorSlotDisplay readOnly={true} />
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Status</CardTitle>
              <CardDescription>Current status and progress of the scenario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={`text-lg ${getStatusColor(scenario.result?.status?.status_code || "pending")}`}
                >
                  {(scenario.result?.status?.status_code || "pending").charAt(0).toUpperCase() +
                    (scenario.result?.status?.status_code || "pending").slice(1)}
                </Badge>
                <div className="flex flex-col gap-2">
                  {scenario.result?.scenario_info?.start_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Started:</span>
                      </div>
                      <span className="text-gray-700">
                        {formatDate(new Date(scenario.result.scenario_info.start_time))}
                      </span>
                    </div>
                  )}
                  {scenario.result?.scenario_info?.end_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1.5">
                        <FlagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 font-medium">Ended:</span>
                      </div>
                      <span className="text-gray-700">
                        {formatDate(new Date(scenario.result.scenario_info.end_time))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {scenario.result?.status?.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm font-medium text-red-800">Error:</div>
                  <div className="text-sm text-red-600 mt-1">{scenario.result.status.error}</div>
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
                {scenario.scenario.prefrences &&
                  Object.entries(scenario.scenario.prefrences).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">
                        {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="font-medium">{value?.toString() ?? "N/A"}</span>
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
            <ActionsList scenario={scenario} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
