import { ApiService } from "@/app/api/lib/api_service"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { profileId, otp, password } = await request.json()
  try {
    const apiService = new ApiService()
    const credentials = await apiService.submitCredentials(profileId, otp, password)
    return NextResponse.json(credentials)
  } catch (error) {
    console.error("Failed to submit credentials:", error)
    return NextResponse.json({ error: "Failed to submit credentials" }, { status: 500 })
  }
}
