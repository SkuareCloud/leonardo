import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"
import { ServiceClient } from "@lib/service-client"
import { NextRequest, NextResponse } from "next/server"

interface Request {
    profileId: string
}

export async function POST(request: NextRequest) {
    logger.info("Received request to assign WEB1 account...")
    const { profileId } = (await request.json()) as Request
    const allProfiles = await new ServiceClient().listAvatars()
    const profileData = allProfiles.find((p) => p.avatar?.id === profileId)
    if (!profileData) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
    const serviceClient = new ServiceClient()
    const web1Account = await serviceClient.assignWeb1Account(allProfiles)
    if (!web1Account) {
        return NextResponse.json({ error: "No WEB1 account can be assigned" }, { status: 404 })
    }
    logger.info(`Updating profile phone for ${profileId}...`)
    await new ApiService().updateProfilePhone(profileId, web1Account.phoneNumber)
    logger.info(`Updated profile phone for ${profileId}.`)

    logger.info(`Assigned WEB1 account ${web1Account.item} to profile ${profileId}.`)

    return NextResponse.json({ account: web1Account })
}
