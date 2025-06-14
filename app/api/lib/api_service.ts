import { AvatarModelWithProxy } from "@lib/api/avatars"
import { client as avatarsClient } from "@lib/api/avatars/client.gen"
import {
  assignProxyToAvatarAvatarsAvatarIdProxyPost,
  avatarsAvatarsGet,
  getAvatarAvatarsAvatarIdGet,
  getProxiesProxiesGet,
  getProxyProxiesProxyIdGet,
  patchAvatarAvatarsAvatarIdPatch,
  pingProxyProxiesProxyIdPingPut,
} from "@lib/api/avatars/sdk.gen"
import { CategoryWithChatCount, ChatWithCategory, CombinedAvatar } from "@lib/api/models"
import { Scenario, ScenarioWithResult } from "@lib/api/operator"
import { client as operatorClient } from "@lib/api/operator/client.gen"
import {
  getAllCharactersCharactersGet,
  getAllCharactersCharactersGet as getAllCharactersCharactersGetOperator,
  getScenarioByIdScenarioScenarioScenarioIdGet,
  getScenariosScenarioScenarioGet,
  stopProfileCharactersCharacterIdStopPost,
  submitScenarioAsyncScenarioPost,
} from "@lib/api/operator/sdk.gen"
import { CategoryRead, CharacterRead, ChatRead, MissionRead } from "@lib/api/orchestrator"
import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import {
  getAllCharactersCharactersGet as getAllCharactersCharactersGetOrchestrator,
  getAllChatsChatsGet,
  getCategoryChatsCategoriesCategoryIdChatsGet,
  getCategoryDescendantsCategoriesCategoryIdDescendantsGet,
  getMissionsMissionsGet,
  getRootCategoryCategoriesRootGet,
} from "@lib/api/orchestrator/sdk.gen"
import { logger } from "@lib/logger"
import { Web1Client } from "@lib/web1/web1-client"
import { Web1Account } from "@lib/web1/web1-models"
import { read_server_env } from "../../../lib/server-env"

export class ApiService {
  constructor(
    avatarsApiEndpoint: string | null = null,
    avatarsApiKey: string | null = null,
    operatorApiEndpoint: string | null = null,
    orchestratorApiEndpoint: string | null = null,
    orchestratorApiKey: string | null = null,
  ) {
    const env = read_server_env()

    const effectiveAvatarsApiEndpoint = avatarsApiEndpoint || env.avatarsApiEndpoint
    if (!effectiveAvatarsApiEndpoint) {
      throw new Error("Avatars API endpoint not defined")
    }
    const effectiveAvatarsApiKey = avatarsApiKey || env.avatarsApiKey
    if (!effectiveAvatarsApiKey) {
      throw new Error("Avatars API key not defined")
    }
    const effectiveOperatorApiEndpoint = operatorApiEndpoint || env.operatorApiEndpoint
    if (!effectiveOperatorApiEndpoint) {
      throw new Error("Operator API endpoint not defined")
    }
    const effectiveOrchestratorApiEndpoint = orchestratorApiEndpoint || env.orchestratorApiEndpoint
    if (!effectiveOrchestratorApiEndpoint) {
      throw new Error("Orchestrator API endpoint not defined")
    }
    const effectiveOrchestratorApiKey = orchestratorApiKey || env.orchestratorApiKey
    if (!effectiveOrchestratorApiKey) {
      throw new Error("Orchestrator API key not defined")
    }

    operatorClient.setConfig({
      baseUrl: effectiveOperatorApiEndpoint,
    })
    avatarsClient.setConfig({
      baseUrl: effectiveAvatarsApiEndpoint,
      headers: {
        "X-Api-Key": effectiveAvatarsApiKey,
      },
    })
    orchestratorClient.setConfig({
      baseUrl: effectiveOrchestratorApiEndpoint,
      headers: {
        "X-Api-Key": effectiveOrchestratorApiKey,
      },
    })
  }

  async listProfiles(): Promise<CombinedAvatar[]> {
    console.log("Listing all avatars...")
    const [allAvatarsResponse, runningAvatarsResponse] = await Promise.all([
      avatarsAvatarsGet(),
      getAllCharactersCharactersGetOperator(),
    ])
    if (allAvatarsResponse.error || !allAvatarsResponse.data) {
      throw new Error(`Failed to fetch all avatars: ${JSON.stringify(allAvatarsResponse.error)}`)
    }
    if (runningAvatarsResponse.error || !runningAvatarsResponse.data) {
      throw new Error(`Failed to fetch running avatars: ${JSON.stringify(runningAvatarsResponse.error)}`)
    }
    console.log("Successfully fetched all avatars.")

    return allAvatarsResponse.data.map(avatar => {
      const character = runningAvatarsResponse.data.find(profile => profile.id === avatar.id)

      // Convert CharacterRead to ProfileWorkerView
      const profile_worker_view = character
        ? {
            id: character.id,
            state: character.state, // Default state since CharacterRead doesn't have state
            current_scenario: character.current_scenario,
            current_scenario_result: character.current_scenario_result,
            pending_actions: character.pending_actions,
          }
        : undefined

      // Ensure proxy and its fields are properly typed
      const proxy = avatar.proxy
        ? {
            ...avatar.proxy,
            ip_api_data: avatar.proxy.ip_api_data ?? null,
            city: avatar.proxy.city ?? null,
            iso_3166_1_alpha_2_code: avatar.proxy.iso_3166_1_alpha_2_code ?? null,
            iso_3166_2_subdivision_code: avatar.proxy.iso_3166_2_subdivision_code ?? null,
            continent_code: avatar.proxy.continent_code ?? null,
            timezone: avatar.proxy.timezone ?? null,
          }
        : null

      return {
        avatar: {
          ...avatar,
          proxy,
        },
        profile_worker_view,
      } satisfies CombinedAvatar
    })
  }

  async assignProxy(profileId: string) {
    const response = await assignProxyToAvatarAvatarsAvatarIdProxyPost({
      client: avatarsClient,
      path: { avatar_id: profileId },
    })
    if (response.error) {
      throw new Error(`Failed to assign proxy: ${JSON.stringify(response.error)}`)
    }
    if (!response.data) {
      throw new Error("Failed to assign proxy")
    }
    return response.data
  }

  async listWeb1Accounts(): Promise<Web1Account[]> {
    const response = await new Web1Client().listAccounts()
    return response
  }

  async updateProfilePhone(profileId: string, phoneNumber: string) {
    return this.updateProfileField(profileId, "phone_number", phoneNumber)
  }

  async updateProfileField(profileId: string, path: string, value: string) {
    console.log(`Updating profile field ${path} for ${profileId}...`)
    const body = {
      path: path.split("."),
      new_value: value,
    }
    console.log("Payload: ", body)
    const response = await patchAvatarAvatarsAvatarIdPatch({
      path: {
        avatar_id: profileId,
      },
      body,
    })
    if (response.error) {
      throw new Error(`Failed to update profile phone: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully updated profile phone for ${profileId}.`)
  }

  async listOperatorCharacters(): Promise<CharacterRead[]> {
    const response = await getAllCharactersCharactersGetOperator({
      client: operatorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get operator characters: ${JSON.stringify(response.error)}`)
    }
    return response.data ?? []
  }

  async stop(avatarId: string) {
    logger.info(`Stopping avatar: ${avatarId}`)
    const response = await stopProfileCharactersCharacterIdStopPost({
      client: operatorClient,
      path: {
        character_id: avatarId,
      },
    })
    if (response.error) {
      throw new Error(`Failed to stop avatar: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully stopped avatar: ${avatarId}`)
  }

  async submitScenario(scenario: Scenario) {
    logger.info(`Submitting scenario: ${scenario.id}`)
    const response = await submitScenarioAsyncScenarioPost({
      client: operatorClient,
      body: scenario,
    })
    if (response.error) {
      throw new Error(`Failed to stop avatar: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully submitted scenario: ${scenario.id}`)
  }

  async getOrchestratorCharacters(): Promise<CharacterRead[]> {
    logger.info("Getting orchestrator characters")
    const response = await getAllCharactersCharactersGetOrchestrator({
      client: orchestratorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator characters: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got orchestrator characters")
    return response.data ?? []
  }

  async getOrchestratorChats(): Promise<ChatRead[]> {
    logger.info("Getting orchestrator chats")
    const response = await getAllChatsChatsGet({
      client: orchestratorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator chats: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got orchestrator chats")
    return response.data ?? []
  }

  async getOrchestratorChatsWithCategories(): Promise<[CategoryWithChatCount[], Record<string, ChatWithCategory[]>]> {
    const rootCategory = await this.getOrchestratorRootCategory()
    logger.info("Getting orchestrator chats descendants")
    const response = await getCategoryDescendantsCategoriesCategoryIdDescendantsGet({
      client: orchestratorClient,
      path: {
        category_id: rootCategory.id,
      },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator chat descendants: ${JSON.stringify(response.error)}`)
    }
    if (!response.data) {
      throw new Error("Failed to get orchestrator chat descendants")
    }
    const categories = [rootCategory, ...response.data]

    const uniqueCategories: CategoryRead[] = []
    for (const category of categories) {
      if (!uniqueCategories.some(cat => cat.id === category.id)) {
        uniqueCategories.push(category)
      }
    }
    const chatsWithCategory = await Promise.all(
      uniqueCategories.map(async category => {
        const chatsWithinCategory = await getCategoryChatsCategoriesCategoryIdChatsGet({
          client: orchestratorClient,
          path: {
            category_id: category.id,
          },
        })
        if (chatsWithinCategory.error || !chatsWithinCategory.data) {
          throw new Error(`Failed to get orchestrator chat category: ${JSON.stringify(chatsWithinCategory.error)}`)
        }
        console.log(`Fetched ${chatsWithinCategory.data.length} chats for category ${category.id}`)
        return {
          chats: chatsWithinCategory.data,
          category,
        }
      }),
    )

    const chatsByCategory: Record<string, ChatWithCategory[]> = {}
    for (const { chats, category } of chatsWithCategory) {
      chatsByCategory[category.id] = chats.map(
        chat =>
          ({
            chat,
            category,
          } as ChatWithCategory),
      )
    }

    logger.info("Successfully got orchestrator chats descendants")
    return [
      uniqueCategories.map(category => ({ category, count: chatsByCategory[category.id].length })),
      chatsByCategory,
    ] satisfies [CategoryWithChatCount[], Record<string, ChatWithCategory[]>]
  }

  async getOrchestratorRootCategory(): Promise<CategoryRead> {
    logger.info("Getting orchestrator root category")
    const response = await getRootCategoryCategoriesRootGet({
      client: orchestratorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator root category: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got orchestrator root category")
    if (!response.data) {
      throw new Error("Failed to get orchestrator root category")
    }
    return response.data
  }

  async getOrchestratorMissions(): Promise<MissionRead[]> {
    logger.info("Getting orchestrator missions")
    const response = await getMissionsMissionsGet({
      client: orchestratorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator missions: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got orchestrator missions")
    return response.data ?? []
  }

  async getOperatorScenarios(): Promise<{ [key: string]: ScenarioWithResult }> {
    logger.info("Getting operator scenarios")
    const response = await getScenariosScenarioScenarioGet({
      client: operatorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get operator scenarios: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got operator scenarios")
    return response.data ?? {}
  }

  async submitOperatorScenario(scenario: Scenario) {
    logger.info(`Submitting operator scenario: ${scenario.id}`)
    const response = await submitScenarioAsyncScenarioPost({
      client: operatorClient,
      body: scenario,
    })
    if (response.error) {
      throw new Error(`Failed to submit operator scenario: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully submitted operator scenario: ${scenario.id}`)
    return response.data ?? null
  }

  async getOperatorScenarioById(scenarioId: string): Promise<ScenarioWithResult | null> {
    logger.info(`Getting operator scenario by id: ${scenarioId}`)
    const response = await getScenarioByIdScenarioScenarioScenarioIdGet({
      client: operatorClient,
      path: { scenario_id: scenarioId },
    })
    if (response.error) {
      throw new Error(`Failed to get operator scenario: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got operator scenario by id: ${scenarioId}`)
    return response.data ?? null
  }

  async getOperatorCharacters() {
    logger.info("Getting operator characters")
    const response = await getAllCharactersCharactersGet({
      client: operatorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get operator characters: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got operator characters")
    return response.data ?? []
  }

  async getProxies() {
    logger.info("Getting proxies")
    const response = await getProxiesProxiesGet({
      client: avatarsClient,
    })
    if (response.error) {
      throw new Error(`Failed to get proxies: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got proxies")
    return response.data ?? []
  }

  async getProxyById(proxyId: string) {
    logger.info("Getting proxy by id")
    const response = await getProxyProxiesProxyIdGet({
      client: avatarsClient,
      path: { proxy_id: proxyId },
    })
    if (response.error) {
      throw new Error(`Failed to get proxy by id: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got proxy by id")
    return response.data ?? null
  }

  async pingProxy(proxyId: string) {
    logger.info("Pinging proxy")
    const response = await pingProxyProxiesProxyIdPingPut({
      client: avatarsClient,
      path: { proxy_id: proxyId },
    })
    if (response.error) {
      throw new Error(`Failed to ping proxy: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully pinged proxy")
    return response.data ?? null
  }

  async getAvatars() {
    logger.info("Getting avatars")
    const response = await avatarsAvatarsGet({
      client: avatarsClient,
    })
    if (response.error) {
      throw new Error(`Failed to get avatars: ${JSON.stringify(response.error)}`)
    }
    return response.data ?? []
  }

  async getAvatar(profileId: string): Promise<AvatarModelWithProxy> {
    const response = await getAvatarAvatarsAvatarIdGet({
      client: avatarsClient,
      path: {
        avatar_id: profileId,
      },
    })
    if (response.error) {
      throw new Error(`Failed to get avatars: ${JSON.stringify(response.error)}`)
    }
    if (!response.data) {
      throw new Error(`Avatar not found: ${profileId}`)
    }
    return response.data
  }
}
