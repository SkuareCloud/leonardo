import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function GET(request: NextRequest, { params }: { params: { slot: string } }) {
  const { slot } = await params
  const apiService = new ApiService(null, null, null, null, null, parseInt(slot))
  const response = await apiService.getOperatorCharacters()
  return NextResponse.json(response)
} 