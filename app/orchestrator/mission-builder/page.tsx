import { ApiService } from "@/app/api/lib/api_service"
import { MissionBuilderView } from "./mission-builder-view"

export default async function Page() {
  const apiService = new ApiService()
  const [allScenarios, chats, categories] = await Promise.all([
    apiService.getOrchestratorScenarios(),
    apiService.getOrchestratorChats(),
    apiService.getOrchestratorCategories(),
  ])

  return <MissionBuilderView chats={chats} scenarios={allScenarios} categories={categories} />
}
