import { CombinedAvatar } from "./api/models";
import { ClientEnv, read_client_env } from "./client-env";
import { Web1Account } from "./web1/web1-models";
import { logger } from "./logger";
/**
 * Client for usage from the frontend.
 */
export class ServiceBrowserClient {
  env: ClientEnv;

  constructor() {
    this.env = read_client_env();
  }

  async listProfiles() {
    const resp = await fetch(`/api/avatars`);
    const json = (await resp.json()) as CombinedAvatar[];
    return json;
  }

  async activate(profileId: string) {
    const resp = await fetch("/api/avatars/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profile_id: profileId }),
    });
    const json = await resp.json();
    return json;
  }

  async assignWeb1Account(profileId: string): Promise<Web1Account> {
    logger.info(`Assigning WEB1 account for profile ${profileId}.`);
    const resp = await fetch("/api/activation/web1/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profileId }),
    });
    const json = await resp.json();
    return json.account;
  }

  async submitOtp(profileId: string, otp: string) {
    const resp = await fetch("/api/activation/web1/submit_otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profile_id: profileId, otp: otp }),
    });
    const json = await resp.json();
    return json;
  }

  async submitPassword(profileId: string, password: string) {
    const resp = await fetch("/api/activation/web1/submit_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profile_id: profileId, password }),
    });
    const json = await resp.json();
    return json;
  }
}
