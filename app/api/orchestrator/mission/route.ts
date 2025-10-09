import { logger } from "@lib/logger"
import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../lib/api_service"

export async function GET(request: NextRequest) {
    logger.info("GET /api/missions/get called")
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    const apiService = new ApiService()
    const mission = await apiService.getOrchestratorMission(id)
    return NextResponse.json(mission)
}

export async function DELETE(request: NextRequest) {
    logger.info("DELETE /api/missions/delete called")
    const apiService = new ApiService()
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }
    try {
        await apiService.deleteOrchestratorMission(id)
        logger.info("DELETE /api/missions/delete success")
        return NextResponse.json({ message: "Mission deleted" })
    } catch (error) {
        logger.error("DELETE /api/missions/delete error")
        return NextResponse.json({ error: "Failed to delete mission" }, { status: 500 })
    }
}
