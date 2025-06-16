import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { MissionsList } from "./missions-list"

export default async function Page() {
  const apiService = new ApiService()
  const missions = await apiService.getOrchestratorMissions()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Missions" subtitle="View and manage all missions in the system" />
      <MissionsList missions={missions} />
    </div>
  )
}
