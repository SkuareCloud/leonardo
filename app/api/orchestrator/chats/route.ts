import { NextRequest } from "next/server";
import { ApiService } from "../../lib/api_service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const skip = searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : 0
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 0
  const chats = await new ApiService().getOrchestratorChats(skip, limit);

  return new Response(JSON.stringify(chats), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
}
