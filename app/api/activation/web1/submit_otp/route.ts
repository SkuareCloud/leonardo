import { logger } from "@lib/logger"
import { read_server_env } from "@lib/server-env"

export async function POST(request: Request) {
    const env = read_server_env()
    const { profileId, otp } = await request.json()
    logger.info(`Submitting OTP for profile ${profileId}...`)
    const endpoint = env.operatorApiEndpoint
    const resp = await fetch(`${endpoint}/activation/submit-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ profile_id: profileId, otp }),
    })
    const json = await resp.json()
    logger.info(`Successfully submitted OTP for profile ${profileId}.`)
    return json
}
