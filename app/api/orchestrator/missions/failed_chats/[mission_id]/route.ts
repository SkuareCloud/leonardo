import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { mission_id: string } }) {
    try {
        const { mission_id } = await params

        const response = await orchestratorClient.get({
            url: `/missions/failed_chats/${mission_id}` as any,
        })

        if (response.error) {
            console.error("Failed to get mission failed chats:", response.error)
            return NextResponse.json(
                { error: "Failed to get mission failed chats" },
                { status: 500 },
            )
        }

        return NextResponse.json(response.data ?? [])
    } catch (error) {
        console.error("Failed to get mission failed chats:", error)
        return NextResponse.json({ error: "Failed to get mission failed chats" }, { status: 500 })
    }
}
