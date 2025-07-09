import { ApiService } from "@/app/api/lib/api_service"
import { MissionBuilderView } from "./mission-builder-view"

export default async function Page() {
  const apiService = new ApiService()
  const [categories] = await Promise.all([
    // apiService.getOrchestratorChats(), #TODO: Find why it takes so long to load
    apiService.getOrchestratorCategories(),
  ])

  return <MissionBuilderView chats={[]} scenarios={[]} categories={categories} /> //#TODO remove scenarios from all Mission functions
}
