import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest, { params }: { params: { slot: string } }) {
  const { slot } = await params
  const apiService = new ApiService(null, null, null, null, null, parseInt(slot))
  const response = await apiService.getOperatorScenarios()
  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  const apiService = new ApiService()
  const body = await request.json()
  const response = await apiService.submitOperatorScenario(body)
  return NextResponse.json(response)
}
