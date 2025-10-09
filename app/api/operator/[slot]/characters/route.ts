import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest) {
    const apiService = new ApiService(null, null, null, null, null)
    const response = await apiService.getOperatorCharacters()
    return NextResponse.json(response)
}
