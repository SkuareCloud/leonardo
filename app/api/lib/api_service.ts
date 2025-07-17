import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
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
import {
  CategoryWithChatCount,
  ChatWithCategory,
  CombinedAvatar,
  MediaItem,
  MediaUploadPayload,
  MissionStatistics,
  MissionType,
  MissionWithExposureAndStats,
  MissionWithExposureStats
} from "@lib/api/models"
import { ActionRead, ActivationStatus, ScenarioWithResult } from "@lib/api/operator"
import { client as operatorClient } from "@lib/api/operator/client.gen"
import {
  activateActivationActivatePost,
  getAllCharactersCharactersGet,
  getAllCharactersCharactersGet as getAllCharactersCharactersGetOperator,
  getScenarioByIdScenarioScenarioScenarioIdGet,
  getScenariosScenarioScenarioGet,
  getStatusActivationStatusGet,
  stopProfileCharactersCharacterIdStopPost,
  submitCredentialsAuthPost,
  submitScenarioAsyncScenarioPost,
} from "@lib/api/operator/sdk.gen"
import {
  CategoryRead,
  CharacterRead,
  ChatRead,
  MissionCreate,
  MissionExposure,
  MissionRead,
  Scenario,
  ScenarioRead
} from "@lib/api/orchestrator"
import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import {
  addCharacterToCategoryCharactersCharacterIdCategoriesCategoryIdPost,
  addChatToCategoryChatsChatIdCategoriesCategoryIdPost,
  createCategoryCategoriesPost,
  createMissionMissionsPost,
  deleteCategoryCategoriesCategoryIdDelete,
  deleteMissionMissionsMissionIdDelete,
  getAllCategoriesCategoriesGet,
  getAllCharactersCharactersGet as getAllCharactersCharactersGetOrchestrator,
  getScenariosScenariosGet as getAllOrchestratorScenariosGet,
  getAllWritableGroupsChatsCanSendMessageChatsGet,
  getCategoryChatsCategoriesCategoryIdChatsGet,
  getCategoryDescendantsCategoriesCategoryIdDescendantsGet,
  getCharacterCategoriesCharactersCharacterIdCategoriesGet,
  getChatByPlatformIdChatsPlatformIdPlatformIdGet,
  getChatByUsernameChatsUsernameUsernameGet,
  getChatCategoriesChatsChatIdCategoriesGet,
  getChatCharactersChatsChatIdCharactersGet,
  getChatChatsChatIdGet,
  getChatsViewChatsViewChatsGet,
  getMissionFailureReasonsMissionsFailureReasonsMissionIdGet,
  getMissionMissionsMissionIdGet,
  getMissionPotentialExposureMissionsExposureMissionIdGet,
  getMissionsMissionsGet,
  getMissionsStatisticsMissionsStatisticsGet,
  getRootCategoryCategoriesRootGet,
  planMissionMissionsPlanMissionMissionIdPost,
  removeCharacterFromCategoryCharactersCharacterIdCategoriesCategoryIdDelete,
  removeChatFromCategoryChatsChatIdCategoriesCategoryIdDelete,
  runMissionMissionsRunMissionMissionIdPost,
  searchChatsChatsSearchGet
} from "@lib/api/orchestrator/sdk.gen"
import { logger } from "@lib/logger"
import { ServerSettings } from "@lib/server-settings"
import { Web1Client } from "@lib/web1/web1-client"
import { Web1Account } from "@lib/web1/web1-models"
import { read_server_env, ServerEnv } from "../../../lib/server-env"

export class ApiService {
  private mediaS3Client: S3Client
  private operatorLogsS3Client: S3Client
  private env: ServerEnv

  constructor(
    avatarsApiEndpoint: string | null = null,
    avatarsApiKey: string | null = null,
    operatorApiEndpoint: string | null = null,
    orchestratorApiEndpoint: string | null = null,
    orchestratorApiKey: string | null = null,
    // operatorSlot: number = 1,
  ) {
    const env = read_server_env()
    const operatorSlot = ServerSettings.getInstance().getOperatorSettings().operatorSlot
    this.env = env

    const effectiveAvatarsApiEndpoint = avatarsApiEndpoint || env.avatarsApiEndpoint
    if (!effectiveAvatarsApiEndpoint) {
      throw new Error("Avatars API endpoint not defined")
    }
    const effectiveAvatarsApiKey = avatarsApiKey || env.avatarsApiKey
    if (!effectiveAvatarsApiKey) {
      throw new Error("Avatars API key not defined")
    }
    const effectiveOperatorApiEndpoint =
      operatorApiEndpoint ||
      (env.operatorApiEndpoint.replace(/\/$/, "") + "/" + (operatorSlot !== 1 ? `${operatorSlot}/` : "")).replace(
        /\/+$/,
        "/",
      )
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

    this.mediaS3Client = new S3Client({ region: env.mediaBucketRegion })
    this.operatorLogsS3Client = new S3Client({ region: env.mediaBucketRegion })
  }

  async listProfiles(): Promise<CombinedAvatar[]> {
    logger.info("Listing all avatars...")
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
    logger.info("Successfully fetched all avatars.")

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
    logger.info(`Updating profile field ${path} for ${profileId}...`)
    const body = {
      path: path.split("."),
      new_value: value,
    }
    logger.info("Payload: ", body)
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
      query: { limit: 0 },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator characters: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got ${response.data?.length} orchestrator characters`)
    return response.data ?? []
  }

  async getCharacterCategories(characterId: string): Promise<CategoryRead[]> {
    logger.info(`Getting character categories: ${characterId}`)
    const response = await getCharacterCategoriesCharactersCharacterIdCategoriesGet({
      client: orchestratorClient,
      path: { character_id: characterId },
    })
    if (response.error) {
      throw new Error(`Failed to get character categories: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got character categories: ${characterId}`)
    return response.data ?? []
  }

  async addCharacterToCategory(characterId: string, categoryId: string) {
    logger.info(`Adding character to category: ${characterId} -> ${categoryId}`)
    const response = await addCharacterToCategoryCharactersCharacterIdCategoriesCategoryIdPost({
      client: orchestratorClient,
      path: { character_id: characterId, category_id: categoryId },
    })
    if (response.error) {
      throw new Error(`Failed to add character to category: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully added character to category: ${characterId} -> ${categoryId}`)
    return response.data ?? null
  }

  async removeCharacterFromCategory(characterId: string, categoryId: string) {
    logger.info(`Removing character from category: ${characterId} -> ${categoryId}`)
    const response = await removeCharacterFromCategoryCharactersCharacterIdCategoriesCategoryIdDelete({
      client: orchestratorClient,
      path: { character_id: characterId, category_id: categoryId },
    })
    if (response.error) {
      throw new Error(`Failed to remove character from category: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully removed character from category: ${characterId} -> ${categoryId}`)
    return response.data ?? null
  }

  async getOrchestratorScenarios(): Promise<ScenarioRead[]> {
    logger.info("Getting orchestrator scenarios")
    const response = await getAllOrchestratorScenariosGet({
      client: orchestratorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator scenarios: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got ${response.data?.length} orchestrator scenarios`)
    return response.data ?? []
  }

  async getOrchestratorChats(skip: number = 0, limit: number = 0, writable: boolean = false): Promise<any[]> {
    logger.info(`Getting orchestrator chats (limit: ${limit})`)
    let response
    if (writable) {
      response = await getAllWritableGroupsChatsCanSendMessageChatsGet({
        client: orchestratorClient,
        query: {
          skip,
          limit,
        },
      })
    }
    else {
      response = await getChatsViewChatsViewChatsGet({
        client: orchestratorClient,
        query: {
          skip,
          limit,
        },
      })

    }
    if (response.error) {
      throw new Error(`Failed to get orchestrator chats: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got ${response.data?.length} orchestrator chats`)
    return response.data ?? []
  }

  async getOrchestratorChatsView(skip: number = 0, limit: number = 0): Promise<any[]> {
    logger.info(`Getting orchestrator chats view (limit: ${limit})`)
    const response = await getChatsViewChatsViewChatsGet({
      client: orchestratorClient,
      query: {
        skip,
        limit,
      },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator chats view: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got ${response.data?.length} orchestrator chats`)
    return response.data ?? []
  }

  async getChatByUsername(username: string): Promise<ChatRead[]> {
    logger.info(`Getting chat by username: ${username}`)
    const response = await getChatByUsernameChatsUsernameUsernameGet({
      client: orchestratorClient,
      path: {
        username,
      },
    })
    if (response.error) {
      // Handle 404 "not found" errors gracefully
      if (response.error.detail === "Chat not found") {
        logger.info(`No chat found for username: ${username}`)
        return []
      }
      throw new Error(`Failed to get chat by username: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got ${response.data?.length} chats for username: ${username}`)
    return response.data ?? []
  }

  async getChatByPlatformId(platformId: number): Promise<ChatRead> {
    logger.info(`Getting chat by platform ID: ${platformId}`)
    const response = await getChatByPlatformIdChatsPlatformIdPlatformIdGet({
      client: orchestratorClient,
      path: {
        platform_id: platformId,
      },
    })
    if (response.error) {
      throw new Error(`Failed to get chat by platform ID: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got chat for platform ID: ${platformId}`)
    return response.data!
  }

  async searchChats(query: string, writable?: boolean): Promise<ChatRead[]> {
    logger.info(`Searching chats with query: ${query}`)
    const response = await searchChatsChatsSearchGet({
      client: orchestratorClient,
      query: {
        q: query,
        writable,
      },
    })
    if (response.error) {
      throw new Error(`Failed to search chats: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully searched chats with query: ${query}`)
    return response.data ?? []
  }

  async getOrchestratorChat(chatId: string): Promise<ChatRead> {
    logger.info(`Getting orchestrator chat: ${chatId}`)
    const response = await getChatChatsChatIdGet({
      client: orchestratorClient,
      path: {
        chat_id: chatId,
      },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator chat: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got orchestrator chat: ${chatId}`)
    return response.data!
  }

  async getOrchestratorChatCategories(chatId: string): Promise<CategoryRead[]> {
    logger.info(`Getting orchestrator chat categories: ${chatId}`)
    const response = await getChatCategoriesChatsChatIdCategoriesGet({
      client: orchestratorClient,
      path: { chat_id: chatId },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator chat categories: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got orchestrator chat categories: ${chatId}`)
    return response.data ?? []
  }

  async getOrchestratorChatCharacters(chatId: string): Promise<CharacterRead[]> {
    logger.info(`Getting orchestrator chat characters: ${chatId}`)
    const response = await getChatCharactersChatsChatIdCharactersGet({
      client: orchestratorClient,
      path: { chat_id: chatId },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator chat characters: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got orchestrator chat characters: ${chatId}`)
    return response.data ?? []
  }

  async getOrchestratorCategories(): Promise<CategoryRead[]> {
    logger.info("Getting orchestrator categories")
    const response = await getAllCategoriesCategoriesGet({
      client: orchestratorClient,
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator categories: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got orchestrator categories")
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
        logger.info(`Fetched ${chatsWithinCategory.data.length} chats for category ${category.id}`)
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

  async addChatToCategory(chatId: string, categoryId: string) {
    logger.info(`Updating chat categories: ${chatId}`)
    const response = await addChatToCategoryChatsChatIdCategoriesCategoryIdPost({
      client: orchestratorClient,
      path: { chat_id: chatId, category_id: categoryId },
    })
    if (response.error) {
      throw new Error(`Failed to update chat categories: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully updated chat categories: ${chatId}`)
    return response.data ?? null
  }

  async removeChatFromCategory(chatId: string, categoryIds: string[]) {
    logger.info(`Removing chat from category: ${chatId}`)
    const response = await removeChatFromCategoryChatsChatIdCategoriesCategoryIdDelete({
      client: orchestratorClient,
      path: { chat_id: chatId, category_id: categoryIds[0] },
    })
    if (response.error) {
      throw new Error(`Failed to remove chat from category: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully removed chat from category: ${chatId}`)
    return response.data ?? null
  }

  async createOrchestratorCategory(name: string, description: string = "", parentId: string | null = null) {
    logger.info(`Creating orchestrator category: ${name}`)
    const response = await createCategoryCategoriesPost({
      client: orchestratorClient,
      body: {
        name,
        description,
        parent_id: parentId,
      },
    })
    if (response.error) {
      throw new Error(`Failed to create orchestrator category: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully created orchestrator category: ${name}`)
    return response.data
  }

  async deleteOrchestratorCategory(categoryId: string) {
    logger.info(`Deleting orchestrator category: ${categoryId}`)
    const response = await deleteCategoryCategoriesCategoryIdDelete({
      client: orchestratorClient,
      path: { category_id: categoryId },
    })
    if (response.error) {
      throw new Error(`Failed to delete orchestrator category: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully deleted orchestrator category: ${categoryId}`)
    return response.data
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
      query: { limit: 0 },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator missions: ${JSON.stringify(response.error)}`)
    }
    logger.info("Successfully got orchestrator missions")
    return response.data ?? []
  }

  async getOrchestratorMissionsWithExposureStats(): Promise<MissionWithExposureStats[]> {
    logger.info("Getting orchestrator missions")
    const missions = await this.getOrchestratorMissions()
    const missionTypesRelevantForExposure: MissionType[] = [
      "EchoMission",
      "RandomDistributionMission",
      "PuppetShowMission",
      "AllocateProfilesGroupsMission",
      "FluffMission"
    ]
    const relevantMissions = missions.filter(mission =>
      missionTypesRelevantForExposure.includes(mission.mission_type as MissionType),
    )
    const missionsWithExposureStats = await Promise.all(
      relevantMissions.map(async mission => {
        const response = await getMissionPotentialExposureMissionsExposureMissionIdGet({
          client: orchestratorClient,
          path: {
            mission_id: mission.id,
          },
        })
        if (response.error) {
          throw new Error(`Failed to get orchestrator mission: ${JSON.stringify(response.error)}`)
        }
        return {
          mission,
          exposureStats: response.data ?? null,
        } satisfies MissionWithExposureStats
      }),
    )
    logger.info("Successfully got orchestrator missions")
    return missionsWithExposureStats
  }

  async getOrchestratorMissionsWithExposureAndStats(): Promise<MissionWithExposureAndStats[]> {
    logger.info("Getting orchestrator missions with exposure and statistics")
    const missions = await this.getOrchestratorMissions()
    const missionTypesRelevantForExposure: MissionType[] = [
      "EchoMission",
      "RandomDistributionMission",
      "PuppetShowMission",
      "AllocateProfilesGroupsMission",
      "FluffMission"
    ]
    const relevantMissions = missions.filter(mission =>
      missionTypesRelevantForExposure.includes(mission.mission_type as MissionType),
    )
    
    const filteredMissions = relevantMissions.filter(mission => {
      const status = mission.status_code
      return status !== "failed_planning" && status !== "canceled"
    })
    
    const missionsWithExposureAndStats = await Promise.all(
      filteredMissions.map(async mission => {
        const isCompleted = mission.status_code === "completed"
        
        if (isCompleted && mission.run_result) {
          // For completed missions, extract data from run_result
          const runResult = mission.run_result as any
          return {
            mission,
            exposureStats: runResult.mission_exposure || null,
            statistics: runResult.mission_statistics || null,
          } satisfies MissionWithExposureAndStats
        } else {
          // For non-completed missions, fetch current exposure stats via API
            const exposureResponse: MissionExposure = {
              potential_exposure: 0,
              potential_exposure_groups: 0,
              actual_exposure: 0,
              actual_exposure_groups: 0
            };
            return {
              mission,
              exposureStats: exposureResponse,
              statistics: null, // Only available for completed missions
            } satisfies MissionWithExposureAndStats
          }
      }),
    )
    
    logger.info("Successfully got orchestrator missions with exposure and statistics")
    return missionsWithExposureAndStats
  }

  async getOrchestratorMissionStatistics(missionId: string): Promise<MissionStatistics> {
    logger.info(`Getting orchestrator mission statistics: ${missionId}`)
    const response = await getMissionsStatisticsMissionsStatisticsGet({
      client: orchestratorClient,
      query: { mission_ids: [missionId] },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator mission statistics: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got orchestrator mission statistics: ${missionId}`)
    if (!response.data) {
      throw new Error(`Failed to get orchestrator mission statistics: ${missionId}`)
    }
    return (response.data[0] as any as MissionStatistics) ?? null
  }

  async getOrchestratorMissionFailureReasons(missionId: string): Promise<ActionRead[]> {
    logger.info(`Getting orchestrator mission failure reasons: ${missionId}`)
    const response = await getMissionFailureReasonsMissionsFailureReasonsMissionIdGet({
      client: orchestratorClient,
      path: { mission_id: missionId },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator mission failure reasons: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got orchestrator mission failure reasons: ${missionId}`)
    return response.data ?? []
  }

  async getOrchestratorMission(missionId: string): Promise<MissionRead> {
    logger.info(`Getting orchestrator mission: ${missionId}`)
    const response = await getMissionMissionsMissionIdGet({
      client: orchestratorClient,
      path: {
        mission_id: missionId,
      },
    })
    if (response.error) {
      throw new Error(`Failed to get orchestrator missions: ${JSON.stringify(response.error)}`)
    }
    if (!response.data) {
      throw new Error(`Failed to get orchestrator mission: ${missionId}`)
    }
    logger.info(`Successfully got orchestrator mission: ${missionId}`)
    return response.data
  }

  async deleteOrchestratorMission(missionId: string) {
    logger.info(`Deleting orchestrator mission: ${missionId}`)
    const response = await deleteMissionMissionsMissionIdDelete({
      client: orchestratorClient,
      path: { mission_id: missionId },
    })
    if (response.error) {
      throw new Error(`Failed to delete orchestrator mission: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully deleted orchestrator mission: ${missionId}`)
  }

  async runOrchestratorMission(missionId: string): Promise<ScenarioRead[]> {
    logger.info(`Running orchestrator mission: ${missionId}`)
    const response = await runMissionMissionsRunMissionMissionIdPost({
      client: orchestratorClient,
      path: { mission_id: missionId },
    })
    if (response.error) {
      throw new Error(`Failed to run orchestrator mission: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully ran orchestrator mission: ${missionId}`)
    return response.data ?? []
  }

  async submitOrchestratorMission(mission: MissionCreate): Promise<MissionRead | null> {
    logger.info(`Submitting orchestrator mission: ${mission.description}`)
    const response = await createMissionMissionsPost({
      client: orchestratorClient,
      body: mission,
    })
    if (response.error) {
      throw new Error(`Failed to submit orchestrator mission: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully submitted orchestrator mission: ${mission.description}`)
    return response.data ?? null
  }

  async planOrchestratorMission(missionId: string): Promise<ScenarioRead[]> {
    logger.info(`Planning orchestrator mission: ${missionId}`)
    const response = await planMissionMissionsPlanMissionMissionIdPost({
      client: orchestratorClient,
      path: { mission_id: missionId },
    })
    if (response.error) {
      throw new Error(`Failed to plan orchestrator mission: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully planned orchestrator mission: ${missionId}`)
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

  async startActivation(
    profileId: string,
    verify_profile_exists: boolean,
    should_override: boolean,
    session_data: { [key: string]: unknown } | null,
  ) {
    logger.info(
      `Starting activation: ${profileId}: { profile_id: ${profileId}, verify_profile_exists: ${verify_profile_exists}, should_override: ${should_override}, session_data: ${session_data} }`,
    )
    const response = await activateActivationActivatePost({
      client: operatorClient,
      body: { profile_id: profileId, verify_profile_exists, should_override, session_data: {} },
    })
    if (response.error) {
      throw new Error(`Failed to start activation: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully started activation: ${profileId}`)
    return response.data ?? null
  }

  async submitCredentials(profileId: string, otp: string, password: string) {
    const response = await submitCredentialsAuthPost({
      client: operatorClient,
      body: { profile_id: profileId, otp, password },
    })
    if (response.error) {
      throw new Error(`Failed to submit credentials: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully submitted credentials: ${profileId}`)
    return response.data ?? null
  }

  async getActivationStatus(profileId: string): Promise<ActivationStatus> {
    const response = await getStatusActivationStatusGet({
      client: operatorClient,
      query: { profile_id: profileId },
    })
    if (response.error) {
      throw new Error(`Failed to get activation status: ${JSON.stringify(response.error)}`)
    }
    logger.info(`Successfully got activation status: ${profileId}`)
    return response.data?.status ?? null
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

  async getMedia(): Promise<MediaItem[]> {
    const media = await this.mediaS3Client.send(
      new ListObjectsV2Command({
        Bucket: this.env.mediaBucketName,
        Prefix: "attachments/",
      }),
    )
    const mediaItems = await Promise.all(
      media.Contents?.map(async item => {
        if (item.Key === "attachments/") {
          return null
        }
        const attachmentName = item.Key?.split("/").pop()
        logger.info(`Creating presigned url for ${item.Key}`)
        const uri = await this.createPresignedUrlWithClient(item.Key || "")

        const s3Uri = `s3://${this.env.mediaBucketName}/${item.Key}`

        // Get the file extension to determine MIME type
        const fileExtension = attachmentName?.split(".").pop()?.toLowerCase()
        const mimeType = this.getMimeTypeFromExtension(fileExtension)

        return {
          name: attachmentName || "",
          key: item.Key || "",
          lastUpdated: item.LastModified || new Date(),
          size: item.Size || 0,
          uri,
          s3Uri,
          mimeType,
        } satisfies MediaItem
      }) || [],
    )
    const filteredMediaItems = mediaItems.filter(item => item !== null)
    return filteredMediaItems
  }

  async getS3Images(path: string): Promise<MediaItem[]> {
    logger.info(`Getting S3 images from bucket ${this.env.operatorLogsBucketName} with path ${path}`)
    const objects = await this.operatorLogsS3Client.send(
      new ListObjectsV2Command({
        Bucket: this.env.operatorLogsBucketName,
        Prefix: path,
      }),
    )
    logger.info(`Found ${objects.Contents?.length} images in ${path}`)

    const imageItems = await Promise.all(
      objects.Contents?.map(async item => {
        if (!item.Key || item.Key === path) {
          return null
        }

        // Parse the path structure: {scenarioId}/{actionId}/{runningIndex}/screenshot.png
        const pathParts = item.Key.split("/")
        if (pathParts.length < 4) {
          return null
        }

        const fileName = pathParts[pathParts.length - 1]
        if (fileName !== "screenshot.png") {
          return null
        }

        const actionId = pathParts[pathParts.length - 3] // Second to last part
        const runningIndex = pathParts[pathParts.length - 2] // Third to last part

        logger.info(`Creating presigned url for ${item.Key}`)
        const uri = await this.createPresignedUrlForOperatorLogs(item.Key)
        const s3Uri = `s3://${this.env.operatorLogsBucketName}/${item.Key}`

        return {
          name: `Action ${actionId} - Run ${runningIndex}`,
          key: item.Key,
          lastUpdated: item.LastModified || new Date(),
          size: item.Size || 0,
          uri,
          s3Uri,
          mimeType: "image/png",
          // Add metadata for better organization
          metadata: {
            actionId,
            runningIndex: parseInt(runningIndex),
            scenarioId: path,
            displayName: `Action ${actionId} - Run ${runningIndex}`,
          },
        } satisfies MediaItem
      }) || [],
    )

    const filteredImageItems = imageItems.filter(item => item !== null)

    // Sort by actionId and then by runningIndex
    return filteredImageItems.sort((a, b) => {
      const aActionId = a.metadata?.actionId || ""
      const bActionId = b.metadata?.actionId || ""
      const aRunningIndex = a.metadata?.runningIndex || 0
      const bRunningIndex = b.metadata?.runningIndex || 0

      if (aActionId !== bActionId) {
        return aActionId.localeCompare(bActionId)
      }
      return aRunningIndex - bRunningIndex
    })
  }

  private getMimeTypeFromExtension(fileExtension: string | undefined): string {
    if (!fileExtension) {
      return "application/octet-stream"
    }

    const mimeTypes: Record<string, string> = {
      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      bmp: "image/bmp",
      ico: "image/x-icon",

      // Documents
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      rtf: "application/rtf",

      // Audio
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",

      // Video
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
      webm: "video/webm",

      // Archives
      zip: "application/zip",
      rar: "application/vnd.rar",
      "7z": "application/x-7z-compressed",
      tar: "application/x-tar",
      gz: "application/gzip",
    }

    return mimeTypes[fileExtension.toLowerCase()] || "application/octet-stream"
  }

  async uploadMedia(files: MediaUploadPayload[]) {
    const client = this.getS3Client()
    for (const file of files) {
      // decode base64
      const fileData = Buffer.from(file.base64, "base64")
      const command = new PutObjectCommand({
        Bucket: this.env.mediaBucketName,
        Key: `attachments/${file.name}`,
        Body: fileData,
        ContentType: file.mimeType,
      })
      await client.send(command)
    }
  }

  async deleteMedia(key: string) {
    logger.info(`Deleting media with key: ${key}`)
    const client = this.getS3Client()
    const command = new DeleteObjectCommand({ Bucket: this.env.mediaBucketName, Key: key })
    await client.send(command)
    logger.info(`Successfully deleted media with key: ${key}`)
  }

  private async createPresignedUrlWithClient(key: string) {
    const client = this.getS3Client()
    const command = new GetObjectCommand({ Bucket: this.env.mediaBucketName, Key: key })
    return getSignedUrl(client, command, { expiresIn: 3600 })
  }

  private async createPresignedUrlForOperatorLogs(key: string) {
    const client = this.operatorLogsS3Client
    const command = new GetObjectCommand({ Bucket: this.env.operatorLogsBucketName, Key: key })
    return getSignedUrl(client, command, { expiresIn: 3600 })
  }

  private getS3Client(): S3Client {
    return new S3Client({ region: this.env.mediaBucketRegion })
  }
}
