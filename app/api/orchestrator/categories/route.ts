import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../lib/api_service"

export async function GET(request: NextRequest) {
    const apiService = new ApiService()
    const categories = await apiService.getOrchestratorCategories()
    return NextResponse.json(categories)
}
