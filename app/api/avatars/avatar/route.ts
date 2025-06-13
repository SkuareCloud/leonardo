import { ApiService } from "@/app/api/lib/api_service"

/**
 * Fetch all profiles from DB.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const profileId = searchParams.get("profileId")
  if (!profileId) {
    return new Response("Profile ID is required", { status: 400 })
  }
  console.log(`Retrieving avatar with profile ID: ${profileId}...`)
  const avatar = await new ApiService().getAvatar(profileId)
  console.log(`Successfully retrieved avatar.`)

  return new Response(JSON.stringify(avatar), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  })
}
