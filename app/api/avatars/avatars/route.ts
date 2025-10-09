import { ApiService } from "@/app/api/lib/api_service"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { logger } from "@lib/logger"

/**
 * Fetch all profiles from DB.
 */
export async function GET() {
    logger.info("Retrieving avatars...")
    const avatars: AvatarModelWithProxy[] = await new ApiService().getAvatars()
    logger.info(`Successfully retrieved ${avatars.length} avatars.`)

    return new Response(JSON.stringify(avatars), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=30",
        },
    })
}

export async function PATCH(req: Request) {
    const { profileId, path, value } = await req.json()
    const avatar = await new ApiService().updateProfileField(profileId, path, value)
    return new Response(JSON.stringify(avatar), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    })
}
