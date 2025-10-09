import { NextRequest, NextResponse } from "next/server"

import { ApiService } from "../../../lib/api_service"

export async function POST(request: NextRequest) {
    const apiService = new ApiService()
    const scenarios = await apiService.planOrchestratorMission(
        request.nextUrl.searchParams.get("id")!,
    )
    // HACK: we assume that the mission is updated after this sleep. since the api returns scenarios and not mission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mission = await apiService.getOrchestratorMission(request.nextUrl.searchParams.get("id")!)
    if (mission.status_code !== "planned") {
        throw new Error(`Mission was not planned: ${mission.status_code}`)
    }
    return NextResponse.json(scenarios)
}
