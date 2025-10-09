import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"
import { ServerSettings } from "@lib/server-settings"

export async function GET(req: Request) {
    const settings = ServerSettings.getInstance().getOperatorSettings()
    return new Response(JSON.stringify(settings), { status: 200 })
}

export async function PUT(req: Request) {
    const body = await req.json()
    logger.info(`Setting operator settings: ${JSON.stringify(body)}`)
    ServerSettings.getInstance().setOperatorSettings(body)
    return new Response(JSON.stringify(body), { status: 200 })
}
