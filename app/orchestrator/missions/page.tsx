import { ApiService } from "@/app/api/lib/api_service"
import { MissionsList } from "./missions-list"

export default async function Page() {
  const missions = await new ApiService().getOrchestratorMissions(false)

  return (
    <div className="flex flex-col gap-8">
      <MissionsList missions={missions} />
    </div>
  )
}
