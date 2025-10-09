import { NextRequest } from "next/server"
import { ApiService } from "../../../../lib/api_service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id: chatId } = await params
    const apiService = new ApiService()

    try {
        const characters = await apiService.getOrchestratorChatCharacters(chatId)
        return new Response(JSON.stringify(characters), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        })
    } catch (error) {
        console.error("Failed to get chat characters:", error)
        return new Response(
            JSON.stringify({
                error: "Failed to get chat characters",
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
