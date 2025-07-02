import { ApiService } from "@/app/api/lib/api_service"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const profileId = url.searchParams.get("profileId")
    if (!profileId) {
      return NextResponse.json({ error: "Missing profileId parameter" }, { status: 400 })
    }
    const apiService = new ApiService()
    const activation = await apiService.getActivationStatus(profileId)
    return NextResponse.json(activation)
  } catch (error) {
    console.error("Failed to get activation status:", error)
    return NextResponse.json({ error: "Failed to get activation status" }, { status: 500 })
  }
}
