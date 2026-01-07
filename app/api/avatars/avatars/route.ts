import { ApiService } from "@/app/api/lib/api_service"
import { AvatarRead } from "@lib/api/avatars/types.gen"
import { logger } from "@lib/logger"

/**
 * Fetch profiles from DB with optional pagination.
 */
export async function GET(request: Request) {
    logger.info('[DEBUG] API route /api/avatars/avatars called')
    logger.info("Retrieving avatars...")
    
    try {
        const { searchParams } = new URL(request.url)
        const skip = parseInt(searchParams.get('skip') || '0', 10)
        const limit = parseInt(searchParams.get('limit') || '0', 10)
        
        logger.info(`[DEBUG] Pagination params: skip=${skip}, limit=${limit}`)
        logger.info('[DEBUG] Creating ApiService instance...')
        const apiService = new ApiService()
        logger.info('[DEBUG] ApiService instance created, calling getAvatars...')
        const avatars: AvatarRead[] = await apiService.getAvatars(skip, limit)
        logger.info('[DEBUG] getAvatars completed successfully')
        logger.info(`Successfully retrieved ${avatars.length} avatars.`)

        return new Response(JSON.stringify(avatars), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=30",
            },
        })
    } catch (error) {
        logger.error(`[DEBUG] Error in GET /api/avatars/avatars: ${error}`)
        logger.error(`[DEBUG] Error stack: ${error instanceof Error ? error.stack : 'no stack'}`)
        logger.error(`[DEBUG] Error message: ${error instanceof Error ? error.message : String(error)}`)
        
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch avatars',
            message: error instanceof Error ? error.message : String(error),
            details: error instanceof Error ? error.stack : undefined
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        })
    }
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
