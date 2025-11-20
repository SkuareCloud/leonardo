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
        )

        return new Response(JSON.stringify(response.data ?? []), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
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
