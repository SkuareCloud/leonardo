import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { searchChatsChatsSearchGet } from "@lib/api/orchestrator/sdk.gen"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")
    const writable = searchParams.get("writable") ? searchParams.get("writable") == "true" : false

    if (!q || !q.trim()) {
        return new Response(JSON.stringify({ error: "Search query cannot be empty" }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    try {
        const response = await searchChatsChatsSearchGet({
            client: orchestratorClient,
            query: {
                q,
                writable,
            },
        })

        if (response.error) {
            throw new Error(`Failed to search chats: ${JSON.stringify(response.error)}`)
        }

        return new Response(JSON.stringify(response.data), {
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
