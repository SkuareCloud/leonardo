import { ApiService } from "@/app/api/lib/api_service"
import { logger } from "@lib/logger"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const { profile_id, verify_profile_exists, should_override, session_data } =
        await request.json()
    logger.info(
        `Starting activation: ${profile_id}: { profile_id: ${profile_id}, verify_profile_exists: ${verify_profile_exists}, should_override: ${should_override}, session_data: ${session_data} }`,
    )
    try {
        const apiService = new ApiService()
        const activation = await apiService.startActivation(
            profile_id,
            verify_profile_exists,
            should_override,
            session_data,
        )
        return NextResponse.json(activation)
    } catch (error) {
        console.error("Failed to start activation:", error)
        return NextResponse.json({ error: "Failed to start activation" }, { status: 500 })
    }
}
