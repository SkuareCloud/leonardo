import { NextRequest, NextResponse } from "next/server"

import { ApiService } from "../../../lib/api_service"

const extractOrchestratorError = (message: string): string | null => {
    const jsonMatch = message.match(/\{.*\}$/)
    if (!jsonMatch) {
        return null
    }
    try {
        const parsed = JSON.parse(jsonMatch[0])
        if (typeof parsed.detail === "string") {
            return parsed.detail
        }
        if (typeof parsed.error === "string") {
            return parsed.error
        }
        if (typeof parsed.message === "string") {
            return parsed.message
        }
    } catch (error) {
        console.error("Failed to parse orchestrator error:", error)
    }
    return null
}

export async function POST(request: NextRequest) {
    const apiService = new ApiService()
    const missionId = request.nextUrl.searchParams.get("id")
    if (!missionId) {
        return NextResponse.json(
            { error: "Mission ID is required to plan a mission." },
            { status: 400 },
        )
    }

    try {
        const scenarios = await apiService.planOrchestratorMission(missionId)
        // HACK: we assume that the mission is updated after this sleep. since the api returns scenarios and not mission
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mission = await apiService.getOrchestratorMission(missionId)
        if (mission.status_code !== "planned") {
            throw new Error(`Mission was not planned: ${mission.status_code}`)
        }
        return NextResponse.json(scenarios)
    } catch (error) {
        console.error("Failed to plan orchestrator mission:", error)
        const message =
            (error instanceof Error &&
                (extractOrchestratorError(error.message) || error.message)) ||
            "Failed to plan mission."
        return NextResponse.json({ error: message }, { status: 400 })
    }
}
