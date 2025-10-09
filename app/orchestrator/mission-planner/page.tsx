import { ApiService } from "@/app/api/lib/api_service"
import { MissionPlannerView } from "./mission-planner-view"

export default async function Page() {
    const apiService = new ApiService()
    const [allMissions] = await Promise.all([apiService.getOrchestratorMissions()])

    return <MissionPlannerView mission={allMissions[0]} />
}
