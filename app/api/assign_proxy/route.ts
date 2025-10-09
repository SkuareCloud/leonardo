import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"

/**
 * Fetch all profiles from DB.
 */
export async function POST(req: Request) {
    const { profileId } = await req.json()
    logger.info(`Assigning proxy to profile ID: ${profileId}...`)
    const avatar = await new ApiService().assignProxy(profileId)
    logger.info(`Successfully assigned proxy.`)

    return new Response(JSON.stringify(avatar), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=30",
        },
    })
}
