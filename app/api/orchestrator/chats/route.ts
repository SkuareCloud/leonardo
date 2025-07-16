import { NextRequest } from "next/server";
import { ApiService } from "../../lib/api_service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skip = searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : 0
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 0
  let writable = searchParams.get("writable") ? searchParams.get("writable") == 'true' : false

  const apiService = new ApiService()

  try {
    const chats = await apiService.getOrchestratorChats(skip, limit, writable);
    return new Response(JSON.stringify(chats), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (error) {
    console.error("Failed to get chats:", error);
    return new Response(JSON.stringify({ error: "Failed to get chats", details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
