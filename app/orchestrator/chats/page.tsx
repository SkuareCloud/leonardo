import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { ChatView } from "@lib/api/models"
import { ChatsView } from "./chats-view"

const INITIAL_PAGE_SIZE = 50

function normalizeChatsPayload(payload: any): { chats: ChatView[]; totalCount?: number } {
    if (Array.isArray(payload)) {
        return { chats: payload, totalCount: payload.length }
    }
    if (payload && typeof payload === "object") {
        const data = payload as Record<string, unknown>
        const chats =
            (Array.isArray(data.chats) && data.chats) ||
            (Array.isArray(data.items) && data.items) ||
            (Array.isArray(data.results) && data.results) ||
            (Array.isArray(data.data) && data.data) ||
            []
        const totalKey = ["total", "total_count", "totalCount", "count"].find(
            (key) => typeof data[key] === "number",
        )
        return { chats: chats as ChatView[], totalCount: totalKey ? (data[totalKey] as number) : undefined }
    }
    return { chats: [] }
}

export default async function Page() {
    const apiService = new ApiService()
    
    // Fetch one extra record to determine if there are more pages
    const [rawChats, allCategories] = await Promise.all([
        apiService.getOrchestratorChats(0, INITIAL_PAGE_SIZE + 1),
        apiService.getOrchestratorCategories(),
    ])
    
    // Check if there are more pages and trim to page size
    const hasMore = rawChats.length > INITIAL_PAGE_SIZE
    const chats = hasMore ? rawChats.slice(0, INITIAL_PAGE_SIZE) : rawChats
    const totalCount = undefined // We don't know the total with cursor pagination

    return (
        <div className="flex flex-col">
            <PageHeader title="Chats" subtitle="Manage and monitor all chats in the system." />
            <div className="flex flex-col pt-6">
                <ChatsView
                    initialChats={chats as ChatView[]}
                    allCategories={allCategories}
                    initialPageSize={INITIAL_PAGE_SIZE}
                    initialTotalCount={totalCount}
                />
            </div>
        </div>
    )
}
