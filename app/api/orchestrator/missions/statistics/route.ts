import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest) {
  const apiService = new ApiService()
  const missionId = request.nextUrl.searchParams.get("mission_id")
  const statistics = await apiService.getOrchestratorMissionStatistics(missionId ?? "")
  return NextResponse.json(statistics)
}
