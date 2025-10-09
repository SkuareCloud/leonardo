import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params
    const apiService = new ApiService()
    logger.info(`Getting orchestrator scenario by id: ${id}`)
    const response = await apiService.getOrchestratorScenarioById(id)
    if (!response) {
        return NextResponse.json({ error: "Scenario not found" }, { status: 404 })
    }
    return NextResponse.json(response)
}
