import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { getAllChatsChatsGet } from "@lib/api/orchestrator/sdk.gen"
import { read_server_env } from "@lib/server-env"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const skip = parseInt(searchParams.get("skip") || "0")
  const limit = parseInt(searchParams.get("limit") || "50")

  try {
    // Initialize the orchestrator client
    const env = read_server_env()
    const effectiveOrchestratorApiEndpoint = env.orchestratorApiEndpoint
    const effectiveOrchestratorApiKey = env.orchestratorApiKey
    
    if (!effectiveOrchestratorApiEndpoint || !effectiveOrchestratorApiKey) {
      throw new Error("Orchestrator API configuration not found")
    }

    orchestratorClient.setConfig({
      baseUrl: effectiveOrchestratorApiEndpoint,
      headers: {
        "X-Api-Key": effectiveOrchestratorApiKey,
      },
    })

    const response = await getAllChatsChatsGet({
      client: orchestratorClient,
      query: {
        skip,
        limit,
      },
    })

    if (response.error) {
      throw new Error(`Failed to get orchestrator chats: ${JSON.stringify(response.error)}`)
    }

    return NextResponse.json(response.data ?? [])
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    )
  }
} 