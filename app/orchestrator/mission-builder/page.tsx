import { ApiService } from "@/app/api/lib/api_service"
import { MissionBuilderView } from "./mission-builder-view"

export default async function Page() {
    const apiService = new ApiService()
    const [categories] = await Promise.all([apiService.getOrchestratorCategories()])
    return <MissionBuilderView chats={[]} scenarios={[]} categories={categories} /> //#TODO remove scenarios from all Mission functions
}
