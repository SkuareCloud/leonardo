import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MissionRead } from "@lib/api/orchestrator/types.gen";

function MissionField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-900">{children}</div>
    </div>
  )
}

export function MissionPlannerView({ mission }: { mission: MissionRead }) {
  const createdAtFormatted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(mission.created_at))
  const updatedAtFormatted = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(mission.updated_at))
  return (
    <Card className="border-0 shadow-2xl/10">
      <CardHeader>
        <CardTitle>Plan Mission</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-3 gap-2">
            <MissionField label="ID">{mission.id}</MissionField>
            <MissionField label="Status">{mission.status_code}</MissionField>
            <MissionField label="Type">{mission.mission_type}</MissionField>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MissionField label="Description">{mission.description}</MissionField>
            <MissionField label="Created At">{createdAtFormatted} </MissionField>
            <MissionField label="Updated At">{updatedAtFormatted}</MissionField>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
