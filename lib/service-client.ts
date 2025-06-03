import { CombinedAvatar, zCombinedAvatar } from "./api/models";
import { read_server_env, ServerEnv } from "@lib/server-env";
import { Web1Account } from "./web1/web1-models";
import { Web1Client } from "./web1/web1-client";

export interface AvatarsListFilters {
  running: boolean;
}

export class ServiceClient {
  private env: ServerEnv;
  constructor() {
    this.env = read_server_env();
  }

  async listAvatars(
    filters: AvatarsListFilters = { running: true }
  ): Promise<CombinedAvatar[]> {
    console.log(
      `Retrieving avatars (running: ${filters.running}) from '${this.env.serverUrl}'.`
    );

    const rawResponse = await fetch(`${this.env.serverUrl}/api/avatars`).then(
      (resp) => resp.json()
    );
    console.log('Raw response (first entry):', JSON.stringify(rawResponse[0], null, 2));
    const parsedResp = zCombinedAvatar.array().parse(rawResponse);
    console.log('Parsed response (first entry):', JSON.stringify(parsedResp[0], null, 2));
    return parsedResp;
  }

  async listWeb1Accounts(): Promise<Web1Account[]> {
    const accounts = await new Web1Client().listAccounts();
    return accounts;
  }

  async assignWeb1Account(
    allProfiles: CombinedAvatar[]
  ): Promise<Web1Account | null> {
    const accounts = await this.listWeb1Accounts();
    const allProfilePhoneNumbers = new Set(
      allProfiles.map((profile) => profile.avatar.data.phone_number)
    );
    const selectedAccount = accounts.find(
      (account) =>
        this.env.allowedCountries.includes(account.country) &&
        !allProfilePhoneNumbers.has(account.phoneNumber)
    );
    if (!selectedAccount) {
      console.error(
        `No WEB1 account found for country '${this.env.allowedCountries}'`
      );
      return null;
    }
    return selectedAccount;
  }
}
