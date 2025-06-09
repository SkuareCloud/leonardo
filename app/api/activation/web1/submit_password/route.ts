import { read_server_env } from "@lib/server-env";
import { logger } from "@lib/logger";
export async function POST(request: Request) {
  const env = read_server_env();
  const { profileId, password } = await request.json();
  logger.info(`Submitting password for profile ${profileId}...`);
  const endpoint = env.operatorApiEndpoint;
  const resp = await fetch(`${endpoint}/activation/submit-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ profile_id: profileId, password }),
  });
  const json = await resp.json();
  logger.info(`Successfully submitted password for profile ${profileId}.`);
  return json;
}
