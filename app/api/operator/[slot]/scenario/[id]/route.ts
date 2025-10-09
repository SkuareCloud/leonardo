import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; slot: string } },
) {
    const { id } = await params
    const apiService = new ApiService()
    logger.info(`Getting scenario by id: ${id}`)
    const response = await apiService.getOperatorScenarioById(id)
    if (!response) {
        return NextResponse.json({ error: "Scenario not found" }, { status: 404 })
    }
    return NextResponse.json(response)
}
