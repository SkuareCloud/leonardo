import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"

/**
 * Fetch all profiles from DB.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const profileId = searchParams.get("profileId")
    if (!profileId) {
        return new Response("Profile ID is required", { status: 400 })
    }
    logger.info(`Retrieving activation status for profile ID: ${profileId}...`)
    const status = await new ApiService().getActivationStatus(profileId)
    logger.info(`Successfully retrieved activation status.`)

    return new Response(JSON.stringify(status), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=30",
        },
    })
}
