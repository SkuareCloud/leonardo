import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"

/**
 * Get count of active avatars by platform.
 */
export async function GET(request: Request) {
    logger.info('[DEBUG] API route /api/avatars/active-count called')
    
    try {
        const { searchParams } = new URL(request.url)
        const platform = searchParams.get('platform')
        
        if (!platform) {
            return new Response("Platform parameter is required", { status: 400 })
        }
        
        if (platform !== 'telegram' && platform !== 'x') {
            return new Response("Platform must be 'telegram' or 'x'", { status: 400 })
        }
        
        logger.info(`[DEBUG] Getting active avatars count for platform: ${platform}`)
        const apiService = new ApiService()
        const count = await apiService.getActiveAvatarsCountByPlatform(platform as "telegram" | "x")
        logger.info(`[DEBUG] Active avatars count: ${count}`)

        return new Response(JSON.stringify({ count }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        })
    } catch (error) {
        logger.error(`[DEBUG] Error getting active avatars count: ${error}`)
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        )
    }
}

