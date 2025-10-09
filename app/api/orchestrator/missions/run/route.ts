import { NextRequest, NextResponse } from "next/server"

import { ApiService } from "../../../lib/api_service"

export async function POST(request: NextRequest) {
    const apiService = new ApiService()
    const scenarios = await apiService.runOrchestratorMission(
        request.nextUrl.searchParams.get("id")!,
    )
    return NextResponse.json(scenarios)
}
