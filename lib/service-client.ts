import { read_server_env, ServerEnv } from "@lib/server-env"
import { AvatarRead } from "./api/avatars/types.gen"
import { CombinedAvatar, zCombinedAvatar } from "./api/models"
import { ScenarioWithResultReadable } from "./api/operator/types.gen"
import { Scenario, ScenarioRead } from "./api/orchestrator/types.gen"
import { logger } from "./logger"
import { OperatorSettings, ServerSettings } from "./server-settings"
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

    private getOperatorSettings(): OperatorSettings {
        return ServerSettings.getInstance().getOperatorSettings()
    }

    async listAvatars(filters: AvatarsListFilters = { running: true }): Promise<CombinedAvatar[]> {
        logger.info(
            `Retrieving avatars (running: ${filters.running}) from '${this.env.serverUrl}'.`,
        )

        const rawResponse = await fetch(`${this.env.serverUrl}/api/avatars/avatars`).then((resp) =>
            resp.json(),
        )
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
        const allProfilePhoneNumbers = new Set(
            allProfiles.map((profile) => profile.avatar?.phone_number).filter((phone): phone is string => phone !== undefined),
        )
        const selectedAccount = accounts.find(
            (account) =>
                this.env.allowedCountries.includes(account.country) &&
                !allProfilePhoneNumbers.has(account.phoneNumber),
        )
        if (!selectedAccount) {
            logger.error(`No WEB1 account found for country '${this.env.allowedCountries}'`)
            return null
        }
        return selectedAccount
    }

    async getOperatorScenarios(): Promise<{ [key: string]: ScenarioWithResultReadable }> {
        const operatorSettings = this.getOperatorSettings()
        console.log("Getting operator scenarios for slot", operatorSettings.operatorSlot)
        const response = await fetch(
            `${this.env.serverUrl}/api/operator/${operatorSettings.operatorSlot}/scenario`,
        )
        return response.json()
    }

    async getOperatorScenarioById(scenarioId: string): Promise<ScenarioWithResultReadable | null> {
        const operatorSettings = this.getOperatorSettings()
        const response = await fetch(
            `${this.env.serverUrl}/api/operator/${operatorSettings.operatorSlot}/scenario/${scenarioId}`,
        )
        return response.json()
    }

    async getAvatars(skip?: number, limit?: number): Promise<Array<AvatarRead>> {
        const url = new URL(`${this.env.serverUrl}/api/avatars/avatars`)
        // If limit is 0 or undefined, don't add it (API defaults to 0 = all avatars)
        // If limit is > 0, add it for pagination
        if (skip !== undefined && skip > 0) {
            url.searchParams.set('skip', skip.toString())
        }
        if (limit !== undefined && limit > 0) {
            url.searchParams.set('limit', limit.toString())
        }
        // If limit is 0, explicitly set it to get all avatars
        if (limit === 0) {
            url.searchParams.set('limit', '0')
        }
        
        logger.info(`[DEBUG] ServiceClient.getAvatars - fetching from URL: ${url.toString()}`)
        logger.info(`[DEBUG] ServiceClient.getAvatars - serverUrl: ${this.env.serverUrl}`)
        
        try {
            const response = await fetch(url.toString())
            logger.info(`[DEBUG] ServiceClient.getAvatars - Response status: ${response.status}`)
            logger.info(`[DEBUG] ServiceClient.getAvatars - Response ok: ${response.ok}`)
            
            if (!response.ok) {
                const errorText = await response.text()
                logger.error(`[DEBUG] ServiceClient.getAvatars - Error response: ${errorText}`)
                throw new Error(`Failed to fetch avatars: ${response.status} ${response.statusText} - ${errorText}`)
            }
            
            const data = await response.json()
            logger.info(`[DEBUG] ServiceClient.getAvatars - Data length: ${Array.isArray(data) ? data.length : 'not an array'}`)
            return data
        } catch (error) {
            logger.error(`[DEBUG] ServiceClient.getAvatars - Exception: ${error}`)
            logger.error(`[DEBUG] ServiceClient.getAvatars - Error type: ${error instanceof Error ? error.constructor.name : typeof error}`)
            logger.error(`[DEBUG] ServiceClient.getAvatars - Error message: ${error instanceof Error ? error.message : String(error)}`)
            if (error instanceof Error && 'cause' in error) {
                logger.error(`[DEBUG] ServiceClient.getAvatars - Error cause: ${JSON.stringify(error.cause)}`)
            }
            throw error
        }
    }

    async getOrchestratorScenarioById(scenarioId: string): Promise<ScenarioRead | null> {
        const response = await fetch(
            `${this.env.serverUrl}/api/orchestrator/scenarios/${scenarioId}`,
        )
        if (!response.ok) {
            return null
        }
        return response.json()
    }

    async submitOperatorScenario(scenario: Scenario): Promise<void> {
        const operatorSettings = this.getOperatorSettings()
        const response = await fetch(
            `${this.env.serverUrl}/api/operator/${operatorSettings.operatorSlot}/scenario`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(scenario),
            },
        )

        if (!response.ok) {
            throw new Error(`Failed to submit scenario: ${response.statusText}`)
        }
    }
}
