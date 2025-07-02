import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest) {
  const apiService = new ApiService()
  const missionsWithExposureStats = await apiService.getOrchestratorMissionsWithExposureStats()
  // Parse datetimes
  const fixedMissionsWithExposureStats = missionsWithExposureStats.map(mission => ({
    ...mission,
    exposureStats: mission.exposureStats
      ? {
          ...mission.exposureStats,
          potential_exposure_min_start: parseDatetime(mission.exposureStats.potential_exposure_min_start),
          potential_exposure_max_end: parseDatetime(mission.exposureStats.potential_exposure_max_end),
          actual_exposure_min_start: parseDatetime(mission.exposureStats.actual_exposure_min_start),
          actual_exposure_max_end: parseDatetime(mission.exposureStats.actual_exposure_max_end),
        }
      : null,
  }))
  return NextResponse.json(fixedMissionsWithExposureStats)
}

function parseDatetime(datetime: string | null | undefined) {
  if (!datetime) {
    return null
  }
  return new Date(datetime).toISOString()
}
