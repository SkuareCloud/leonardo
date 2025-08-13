import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { getMissionSuccessfullDestinationChatsMissionsSuccessfullChatsMissionIdGet } from "@lib/api/orchestrator/sdk.gen"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { mission_id: string } }) {
  try {
    const {mission_id} = await params;
    const response = await getMissionSuccessfullDestinationChatsMissionsSuccessfullChatsMissionIdGet({
      client: orchestratorClient,
      path: { mission_id },
    })
    
    if (response.error) {
      console.error("Failed to get mission successful chats:", response.error)
      return NextResponse.json({ error: "Failed to get mission successful chats" }, { status: 500 })
    }
    
    return NextResponse.json(response.data ?? [])
  } catch (error) {
    console.error("Failed to get mission successful chats:", error)
    return NextResponse.json({ error: "Failed to get mission successful chats" }, { status: 500 })
  }
} 