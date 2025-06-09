import { ApiService } from "../../lib/api_service";

export async function GET() {
  const avatars = await new ApiService().listProfiles();

  return new Response(JSON.stringify(avatars), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
}
