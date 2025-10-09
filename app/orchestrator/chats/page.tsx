import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { ChatsView } from "./chats-view"

export default async function Page() {
    const [chats, allCategories] = await Promise.all([
        new ApiService().getOrchestratorChats(),
        new ApiService().getOrchestratorCategories(),
    ])

    return (
        <div className="flex flex-col">
            <PageHeader title="Chats" subtitle="Manage and monitor all chats in the system." />
            <div className="flex flex-col pt-6">
                <ChatsView chats={chats} allCategories={allCategories} />
            </div>
        </div>
    )
}
