import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { updateMissionMissionsMissionIdPut } from "@lib/api/orchestrator/sdk.gen"
import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function POST(request: NextRequest) {
    // Ensure orchestrator client configured
    const _ = new ApiService()
    const { mission_id, description } = await request.json()
    if (!mission_id || typeof description !== "string") {
        return NextResponse.json(
            { error: "mission_id and description are required" },
            { status: 400 },
        )
    }
    const response = await updateMissionMissionsMissionIdPut({
        client: orchestratorClient,
        path: { mission_id },
        body: ["description"],
        query: { value: description },
    })
    if (response.error) {
        return NextResponse.json({ error: response.error }, { status: 500 })
    }
    return NextResponse.json(response.data)
}
