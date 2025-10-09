import { logger } from "@lib/logger"
import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../lib/api_service"

export async function GET(request: NextRequest) {
    logger.info("GET /api/missions/list called")
    const apiService = new ApiService()
    const missions = await apiService.getOrchestratorMissions()
    logger.info("GET /api/missions/list success")
    return NextResponse.json(missions)
}

export async function POST(request: NextRequest) {
    logger.info("POST /api/missions/submit called")
    const apiService = new ApiService()
    try {
        const body = await request.json()
        const response = await apiService.submitOrchestratorMission(body)
        logger.info("POST /api/missions/submit success")
        logger.info(response)
        return NextResponse.json(response)
    } catch (error) {
        logger.error("POST /api/missions/submit error")
        return NextResponse.json({ error: "Failed to submit mission" }, { status: 500 })
    }
}
