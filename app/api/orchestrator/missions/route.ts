import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../lib/api_service"

export async function GET(request: NextRequest) {
  console.log("GET /api/missions/list called")
  const apiService = new ApiService()
  const missions = await apiService.getOrchestratorMissions()
  console.log("GET /api/missions/list success")
  return NextResponse.json(missions)
}

export async function POST(request: NextRequest) {
  console.log("POST /api/missions/submit called")
  const apiService = new ApiService()
  try {
    const body = await request.json()
    const response = await apiService.submitOrchestratorMission(body)
    console.log("POST /api/missions/submit success")
    console.log(response)
    return NextResponse.json(response)
  } catch (error) {
    console.log("POST /api/missions/submit error")
    return NextResponse.json({ error: "Failed to submit mission" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  console.log("DELETE /api/missions/delete called")
  const apiService = new ApiService()
  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }
  try {
    await apiService.deleteOrchestratorMission(id)
    console.log("DELETE /api/missions/delete success")
    return NextResponse.json({ message: "Mission deleted" })
  } catch (error) {
    console.log("DELETE /api/missions/delete error")
    return NextResponse.json({ error: "Failed to delete mission" }, { status: 500 })
  }
}
