import { read_server_env, ServerEnv } from "@lib/server-env"
import { AvatarModelWithProxy } from "./api/avatars/types.gen"
import { CombinedAvatar, zCombinedAvatar } from "./api/models"
import { Scenario, ScenarioWithResult } from "./api/operator/types.gen"
import { logger } from "./logger"
import { Web1Client } from "./web1/web1-client"
import { Web1Account } from "./web1/web1-models"

export interface AvatarsListFilters {
  running: boolean
}

export class ServiceClient {
  private env: ServerEnv
  constructor() {
    this.env = read_server_env()
  }

  async listAvatars(filters: AvatarsListFilters = { running: true }): Promise<CombinedAvatar[]> {
    logger.info(`Retrieving avatars (running: ${filters.running}) from '${this.env.serverUrl}'.`)

    const rawResponse = await fetch(`${this.env.serverUrl}/api/avatars/avatars`).then(resp => resp.json())
    logger.info("Raw response (first entry):", JSON.stringify(rawResponse[0], null, 2))
    const parsedResp = zCombinedAvatar.array().parse(rawResponse)
    logger.info("Parsed response (first entry):", JSON.stringify(parsedResp[0], null, 2))
    return parsedResp
  }

  async listWeb1Accounts(): Promise<Web1Account[]> {
    const accounts = await new Web1Client().listAccounts()
    return accounts
  }

  async assignWeb1Account(allProfiles: CombinedAvatar[]): Promise<Web1Account | null> {
    const accounts = await this.listWeb1Accounts()
    const allProfilePhoneNumbers = new Set(allProfiles.map(profile => profile.avatar.data.phone_number))
    const selectedAccount = accounts.find(
      account =>
        this.env.allowedCountries.includes(account.country) && !allProfilePhoneNumbers.has(account.phoneNumber),
    )
    if (!selectedAccount) {
      console.error(`No WEB1 account found for country '${this.env.allowedCountries}'`)
      return null
    }
    return selectedAccount
  }

  async getOperatorScenarios(): Promise<{ [key: string]: ScenarioWithResult }> {
    const response = await fetch(`${this.env.serverUrl}/api/operator/scenario`)
    return response.json()
  }

  async getOperatorScenarioById(scenarioId: string): Promise<ScenarioWithResult | null> {
    const response = await fetch(`${this.env.serverUrl}/api/operator/scenario/${scenarioId}`)
    return response.json()
  }

  async getAvatars(): Promise<Array<AvatarModelWithProxy>> {
    const response = await fetch(`${this.env.serverUrl}/api/avatars/avatars`)
    return response.json()
  }

  async submitOperatorScenario(scenario: Scenario): Promise<void> {
    const response = await fetch(`${this.env.serverUrl}/api/operator/scenario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scenario),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit scenario: ${response.statusText}`)
    }
  }
}
