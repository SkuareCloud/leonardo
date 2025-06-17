import { ApiService } from "@/app/api/lib/api_service"
import { MissionsList } from "./missions-list"

export default async function Page() {
  const apiService = new ApiService()
  const missions = await apiService.getOrchestratorMissions()

  return (
    <div className="flex flex-col gap-8">
      <MissionsList missions={missions} />
    </div>
  )
}
