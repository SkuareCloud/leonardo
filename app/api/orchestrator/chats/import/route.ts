import { ApiService } from "@/app/api/lib/api_service"
import { NextRequest, NextResponse } from "next/server"

type ImportChatPayload = {
    identifier?: string
}

export async function POST(request: NextRequest) {
    let payload: ImportChatPayload
    try {
        payload = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const identifier = payload.identifier?.trim()
    if (!identifier) {
        return NextResponse.json(
            { error: "identifier is required (username or platform ID)" },
            { status: 400 },
        )
    }

    const apiService = new ApiService()

    try {
        const chat = await apiService.createChatFromMystique(identifier)
        return NextResponse.json(chat, {
            headers: { "Cache-Control": "no-store" },
        })
    } catch (error) {
        console.error("Failed to import chat via Mystique:", error)
        return NextResponse.json(
            {
                error: "Failed to import chat",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 },
        )
    }
}



