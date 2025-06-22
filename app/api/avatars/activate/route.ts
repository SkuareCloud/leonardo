import { read_server_env } from "@lib/server-env"
import { logger } from "@lib/logger"
/**
 * Start profile activation.
 */
export async function POST(request: Request) {
  const env = read_server_env()
  const endpoint = env.operatorApiEndpoint
  const body = await request.json()
  const profileId = body.profile_id
  const shouldOverride = body?.should_override || false
  logger.info(`Starting activation for profile ${profileId}...`)
  const resp = await fetch(`${endpoint}/activation/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ profile_id: profileId, should_override: shouldOverride }),
  }).then(resp => resp.json())
  return new Response(JSON.stringify(resp), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  })
}
