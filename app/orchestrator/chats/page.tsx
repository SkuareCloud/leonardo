import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { headers } from "next/headers"
import { ChatsView } from "./chats-view"

export default async function Page() {
  const [categories, chatsByCategoryId] = await new ApiService().getOrchestratorChatsWithCategories()
  const searchParamsFromHeader = (await headers()).get("X-Search-Params")
  const searchParams = new URLSearchParams(searchParamsFromHeader || "")
  const categoryFromQuery = searchParams.get("category")
  const tabFromQuery = searchParams.get("tab")

  return (
    <div className="flex flex-col">
      <PageHeader title="Chats" subtitle="Manage and monitor all chats in the system." />
      <ChatsView
        categoriesWithChatCount={categories}
        chatsByCategoryId={chatsByCategoryId}
        category={categoryFromQuery}
        tab={tabFromQuery}
      />
    </div>
  )
}
