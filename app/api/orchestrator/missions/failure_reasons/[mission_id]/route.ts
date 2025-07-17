import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { getMissionFailureReasonsMissionsFailureReasonsMissionIdGet } from "@lib/api/orchestrator/sdk.gen"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { mission_id: string } }) {
  try {
    const response = await getMissionFailureReasonsMissionsFailureReasonsMissionIdGet({
      client: orchestratorClient,
      path: { mission_id: params.mission_id },
    })
    
    if (response.error) {
      console.error("Failed to get mission failure reasons:", response.error)
      return NextResponse.json({ error: "Failed to get mission failure reasons" }, { status: 500 })
    }
    
    return NextResponse.json(response.data ?? [])
  } catch (error) {
    console.error("Failed to get mission failure reasons:", error)
    return NextResponse.json({ error: "Failed to get mission failure reasons" }, { status: 500 })
  }
} 