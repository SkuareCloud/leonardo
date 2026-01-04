import { ApiService } from "@/app/api/lib/api_service"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id: categoryId } = await params

        if (!categoryId) {
            return new Response(JSON.stringify({ error: "Category ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        const body = await request.json()
        const { chat_ids } = body

        if (!chat_ids || !Array.isArray(chat_ids) || chat_ids.length === 0) {
            return new Response(JSON.stringify({ error: "chat_ids array is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        const apiService = new ApiService()
        const result = await apiService.addManyChatsToCategory(chat_ids, categoryId)

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Failed to add chats to category:", error)
        return new Response(
            JSON.stringify({
                error: `Failed to add chats to category: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        )
    }
}
