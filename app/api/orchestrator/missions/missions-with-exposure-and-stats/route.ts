import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest) {
    const apiService = new ApiService()
    const missionsWithExposureAndStats =
        await apiService.getOrchestratorMissionsWithExposureAndStats()
    // Parse datetimes
    const fixedMissionsWithExposureAndStats = missionsWithExposureAndStats.map((mission) => ({
        ...mission,
        exposureStats: mission.exposureStats
            ? {
                  ...mission.exposureStats,
                  potential_exposure_min_start: parseDatetime(
                      mission.exposureStats.potential_exposure_min_start,
                  ),
                  potential_exposure_max_end: parseDatetime(
                      mission.exposureStats.potential_exposure_max_end,
                  ),
                  actual_exposure_min_start: parseDatetime(
                      mission.exposureStats.actual_exposure_min_start,
                  ),
                  actual_exposure_max_end: parseDatetime(
                      mission.exposureStats.actual_exposure_max_end,
                  ),
              }
            : null,
        statistics: mission.statistics
            ? {
                  ...mission.statistics,
                  created_at: parseDatetime(mission.statistics.created_at),
              }
            : null,
    }))
    return NextResponse.json(fixedMissionsWithExposureAndStats)
}

function parseDatetime(datetime: string | null | undefined): string | null {
    if (!datetime) return null
    try {
        return new Date(datetime).toISOString()
    } catch (error) {
        return null
    }
}
