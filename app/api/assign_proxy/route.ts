import { ApiService } from "@/app/api/lib/api_service"

/**
 * Fetch all profiles from DB.
 */
export async function POST(req: Request) {
  const { profileId } = await req.json()
  console.log(`Assigning proxy to profile ID: ${profileId}...`)
  const avatar = await new ApiService().assignProxy(profileId)
  console.log(`Successfully assigned proxy.`)

  return new Response(JSON.stringify(avatar), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  })
}
