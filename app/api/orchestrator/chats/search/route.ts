import { NextRequest } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get("query") ?? searchParams.get("q") ?? "").trim()
    const categoryName =
        searchParams.get("category_name") ??
        searchParams.get("category") ??
        searchParams.get("categoryName") ??
        undefined
    const topkParam = searchParams.get("topk")
    const thresholdParam = searchParams.get("threshold")

    // Extract filter parameters (matching the get chats endpoint)
    const usernameParam = searchParams.get("username")
    const username = usernameParam && usernameParam.trim() ? usernameParam.trim() : undefined
    const titleParam = searchParams.get("title")
    const title = titleParam && titleParam.trim() ? titleParam.trim() : undefined
    const chatTypeParam = searchParams.get("chat_type")
    const chatType = chatTypeParam && chatTypeParam.trim() ? chatTypeParam.trim() : undefined
    const platformParam = searchParams.get("platform")
    const platform = platformParam && platformParam.trim() ? platformParam.trim() : undefined
    const minParticipantsParam = searchParams.get("min_participants")
    const minParticipants = minParticipantsParam && minParticipantsParam.trim() ? Number(minParticipantsParam) : undefined
    const maxParticipantsParam = searchParams.get("max_participants")
    const maxParticipants = maxParticipantsParam && maxParticipantsParam.trim() ? Number(maxParticipantsParam) : undefined
    const linkedChatUsernameParam = searchParams.get("linked_chat_username")
    const linkedChatUsername = linkedChatUsernameParam && linkedChatUsernameParam.trim() ? linkedChatUsernameParam.trim() : undefined
    const hasCategoryParam = searchParams.get("has_category")
    const hasCategory = hasCategoryParam && hasCategoryParam.trim() ? hasCategoryParam.trim() : undefined

    if (!query) {
        return new Response(JSON.stringify({ error: "Search query cannot be empty" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    const topk = topkParam ? Number(topkParam) : undefined
    const threshold = thresholdParam ? Number(thresholdParam) : undefined

    const apiService = new ApiService()

    try {
        const response = await apiService.searchChatsByTopics(
            query,
            categoryName,
            topk,
            threshold,
            {
                username,
                title,
                chatType,
                platform,
                minParticipants,
                maxParticipants,
                linkedChatUsername,
                hasCategory,
            },
        )

        return new Response(JSON.stringify(response.data ?? []), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        })
    } catch (error) {
        console.error("Search chats failed:", error)
        return new Response(
            JSON.stringify({
                error: "Search failed",
                details: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        )
    }
}
