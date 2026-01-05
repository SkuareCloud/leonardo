import {
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { AvatarRead, AvatarUpdate, ProxyRead } from "@lib/api/avatars"
import { client as avatarsClient } from "@lib/api/avatars/client.gen"
import {
    getAvatar as getAvatarRequest,
    getAvatars as getAvatarsRequest,
    updateAvatar as updateAvatarRequest,
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
    MissionWithExposureStats,
} from "@lib/api/models"
import { client as mystiqueClient } from "@lib/api/mystique/client.gen"
import { findTelegramChatApiChatsFindTelegramChatUserIdChatIdentifierGet } from "@lib/api/mystique/sdk.gen"
import { ActivationStatus } from "@lib/api/operator"
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
import { type ScenarioWithResultReadable } from "@lib/api/operator/types.gen"
import {
    ActionRead,
    CategoryRead,
    CharacterRead,
    ChatRead,
    ChatView,
    MissionCreate,
    MissionExposure,
    MissionRead,
    ChatCreate as OrchestratorChatCreate,
    Scenario,
    ScenarioRead,
} from "@lib/api/orchestrator"
import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import {
    addCharacterToCategoryCharactersCharacterIdCategoriesCategoryIdPost,
    addChatToCategoryChatsChatIdCategoriesCategoryIdPost,
    addManyChatsToCategoryCategoriesCategoryIdManyChatsPost,
    createCategoryCategoriesPost,
    createChatChatsPost,
    createMissionMissionsPost,
    deleteCategoryCategoriesCategoryIdDelete,
    deleteChatChatsChatIdDelete,
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
    getMissionFailureReasonsMissionsFailureReasonsMissionIdGet,
    getMissionMissionsMissionIdGet,
    getMissionPotentialExposureMissionsExposureMissionIdGet,
    getMissionsMissionsGet,
    getMissionsStatisticsMissionsStatisticsGet,
    getRootCategoryCategoriesRootGet,
    getScenarioScenariosScenarioIdGet,
    planMissionMissionsPlanMissionMissionIdPost,
    removeCharacterFromCategoryCharactersCharacterIdCategoriesCategoryIdDelete,
    removeChatFromCategoryChatsChatIdCategoriesCategoryIdDelete,
    runMissionMissionsRunMissionMissionIdPost,
    searchChatsByTopicsAndAddToCategoryChatsSearchChatsAddToCategoryPost,
    searchChatsByTopicsChatsSearchChatsPost,
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
    private mystiqueUserId: string

    constructor(
        avatarsApiEndpoint: string | null = null,
        avatarsApiKey: string | null = null,
        operatorApiEndpoint: string | null = null,
        orchestratorApiEndpoint: string | null = null,
        orchestratorApiKey: string | null = null,
        // operatorSlot: number = 1,
    ) {
        logger.info("[DEBUG] ApiService constructor called")
        const env = read_server_env()
        const operatorSlot = ServerSettings.getInstance().getOperatorSettings().operatorSlot
        logger.info(`[DEBUG] operatorSlot: ${operatorSlot}`)
        this.env = env

        const effectiveAvatarsApiEndpoint = avatarsApiEndpoint || env.avatarsApiEndpoint
        logger.info(`[DEBUG] effectiveAvatarsApiEndpoint: ${effectiveAvatarsApiEndpoint}`)
        if (!effectiveAvatarsApiEndpoint) {
            throw new Error("Avatars API endpoint not defined")
        }
        const effectiveAvatarsApiKey = avatarsApiKey || env.avatarsApiKey
        logger.info(
            `[DEBUG] effectiveAvatarsApiKey: ${effectiveAvatarsApiKey ? `${effectiveAvatarsApiKey.substring(0, 4)}...` : "MISSING"}`,
        )
        if (!effectiveAvatarsApiKey) {
            throw new Error("Avatars API key not defined")
        }
        const effectiveOperatorApiEndpoint =
            operatorApiEndpoint ||
            (
                env.operatorApiEndpoint.replace(/\/$/, "") +
                "/" +
                (operatorSlot !== 1 ? `${operatorSlot}/` : "")
            ).replace(/\/+$/, "/")
        logger.info(`[DEBUG] effectiveOperatorApiEndpoint: ${effectiveOperatorApiEndpoint}`)
        if (!effectiveOperatorApiEndpoint) {
            throw new Error("Operator API endpoint not defined")
        }
        const effectiveOrchestratorApiEndpoint =
            orchestratorApiEndpoint || env.orchestratorApiEndpoint
        logger.info(`[DEBUG] effectiveOrchestratorApiEndpoint: ${effectiveOrchestratorApiEndpoint}`)
        if (!effectiveOrchestratorApiEndpoint) {
            throw new Error("Orchestrator API endpoint not defined")
        }
        const effectiveOrchestratorApiKey = orchestratorApiKey || env.orchestratorApiKey
        logger.info(
            `[DEBUG] effectiveOrchestratorApiKey: ${effectiveOrchestratorApiKey ? `${effectiveOrchestratorApiKey.substring(0, 4)}...` : "MISSING"}`,
        )
        if (!effectiveOrchestratorApiKey) {
            throw new Error("Orchestrator API key not defined")
        }

        logger.info("[DEBUG] Setting up API clients...")
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

        mystiqueClient.setConfig({
            baseUrl: env.mystiqueApiEndpoint,
            headers: {
                "X-Api-Key": env.mystiqueApiKey,
            },
        })
        this.mystiqueUserId = env.mystiqueUserId
        logger.info("[DEBUG] API clients configured successfully")

        this.mediaS3Client = new S3Client({ region: env.mediaBucketRegion })
        this.operatorLogsS3Client = new S3Client({ region: env.mediaBucketRegion })
        logger.info("[DEBUG] ApiService constructor completed")
    }

    private async avatarsFetch<T = unknown>(
        path: string,
        init: RequestInit = {},
    ): Promise<T | undefined> {
        const baseUrl = this.env.avatarsApiEndpoint
        const url = new URL(path, baseUrl).toString()
        const headers = new Headers(init.headers || {})
        headers.set("Accept", "application/json")
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json")
        }
        headers.set("X-Api-Key", this.env.avatarsApiKey)
        const response = await fetch(url, {
            ...init,
            headers,
        })
        if (!response.ok) {
            const errorPayload = await response.text()
            throw new Error(
                `Avatars API request failed (${response.status}): ${
                    errorPayload || response.statusText
                }`,
            )
        }
        if (response.status === 204) {
            return undefined
        }
        const contentType = response.headers.get("Content-Type")
        if (contentType?.includes("application/json")) {
            return (await response.json()) as T
        }
        return undefined
    }

    private buildAvatarUpdatePayload(path: string, value: unknown): AvatarUpdate {
        if (!path) {
            if (typeof value === "object" && value !== null) {
                return value as AvatarUpdate
            }
            throw new Error("Path is required when updating avatar fields")
        }
        const segments = path.split(".")
        const payload: Record<string, unknown> = {}
        let cursor: Record<string, unknown> = payload
        segments.forEach((segment, index) => {
            if (index === segments.length - 1) {
                cursor[segment] = value
            } else {
                if (typeof cursor[segment] !== "object" || cursor[segment] === null) {
                    cursor[segment] = {}
                }
                cursor = cursor[segment] as Record<string, unknown>
            }
        })
        return payload as AvatarUpdate
    }

    async listProfiles(): Promise<CombinedAvatar[]> {
        logger.info("Listing all avatars...")
        const [allAvatarsResponse, runningAvatarsResponse] = await Promise.all([
            getAvatarsRequest({
                client: avatarsClient,
                query: { attach_proxy: true } as any,
            }),
            getAllCharactersCharactersGetOperator(),
        ])
        if (allAvatarsResponse.error || !allAvatarsResponse.data) {
            throw new Error(
                `Failed to fetch all avatars: ${JSON.stringify(allAvatarsResponse.error)}`,
            )
        }
        if (runningAvatarsResponse.error || !runningAvatarsResponse.data) {
            throw new Error(
                `Failed to fetch running avatars: ${JSON.stringify(runningAvatarsResponse.error)}`,
            )
        }
        logger.info("Successfully fetched all avatars.")

        return allAvatarsResponse.data.map((avatar) => {
            const character = runningAvatarsResponse.data.find(
                (profile) => profile.id === avatar.id,
            )

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

            const proxy = avatar.proxy ?? null

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
        const response = await this.avatarsFetch<AvatarRead>(`/avatars/${profileId}/proxy`, {
            method: "POST",
        })
        if (!response) {
            throw new Error("Failed to assign proxy")
        }
        return response
    }

    async listWeb1Accounts(): Promise<Web1Account[]> {
        const response = await new Web1Client().listAccounts()
        return response
    }

    async updateProfilePhone(profileId: string, phoneNumber: string) {
        return this.updateProfileField(profileId, "phone_number", phoneNumber)
    }

    async updateProfileField(profileId: string, path: string, value: unknown) {
        logger.info(`Updating profile field ${path} for ${profileId}...`)
        const body = this.buildAvatarUpdatePayload(path, value)
        const response = await updateAvatarRequest({
            client: avatarsClient,
            path: {
                avatar_id: profileId,
            },
            body,
        })
        if (response.error) {
            throw new Error(`Failed to update avatar field: ${JSON.stringify(response.error)}`)
        }
        logger.info(`Successfully updated avatar ${profileId}.`)
        return response.data ?? null
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
            throw new Error(
                `Failed to get orchestrator characters: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to add character to category: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully added character to category: ${characterId} -> ${categoryId}`)
        return response.data ?? null
    }

    async removeCharacterFromCategory(characterId: string, categoryId: string) {
        logger.info(`Removing character from category: ${characterId} -> ${categoryId}`)
        const response =
            await removeCharacterFromCategoryCharactersCharacterIdCategoriesCategoryIdDelete({
                client: orchestratorClient,
                path: { character_id: characterId, category_id: categoryId },
            })
        if (response.error) {
            throw new Error(
                `Failed to remove character from category: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to get orchestrator scenarios: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully got ${response.data?.length} orchestrator scenarios`)
        return response.data ?? []
    }

    async getOrchestratorScenarioById(scenarioId: string): Promise<ScenarioRead | null> {
        logger.info(`Getting orchestrator scenario by id: ${scenarioId}`)
        const response = await getScenarioScenariosScenarioIdGet({
            client: orchestratorClient,
            path: { scenario_id: scenarioId },
        })
        if (response.error) {
            throw new Error(
                `Failed to get orchestrator scenario: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully got orchestrator scenario by id: ${scenarioId}`)
        return response.data ?? null
    }

    async getOrchestratorChats(
        skip: number = 0,
        limit: number = 0,
        writable: boolean = false,
        categoryName: string | null = null,
        filters?: {
            username?: string
            title?: string
            chatType?: string
            platform?: string
            minParticipants?: string
            maxParticipants?: string
            linkedChatUsername?: string
        },
        sortBy?: Array<{ field: string; order?: 'asc' | 'desc' }> | null,
    ): Promise<ChatRead[]> {
        logger.info(
            `Getting orchestrator chats (limit: ${limit}, categoryName: ${categoryName}, filters: ${JSON.stringify(filters)}, sortBy: ${JSON.stringify(sortBy)})`,
        )

        const queryParams: any = {
            skip,
            limit,
        }

        if (categoryName) {
            queryParams.has_category = categoryName
        }

        // Add filter parameters
        if (filters) {
            if (filters.username) {
                queryParams.username = filters.username
            }
            if (filters.title) {
                queryParams.title = filters.title
            }
            if (filters.chatType) {
                queryParams.chat_type = filters.chatType
            }
            if (filters.platform) {
                // Try to parse as number for platform_id, otherwise skip
                const platformId = parseInt(filters.platform)
                if (!isNaN(platformId)) {
                    queryParams.platform_id = platformId
                }
            }
            if (filters.minParticipants) {
                const minPart = parseInt(filters.minParticipants)
                if (!isNaN(minPart)) {
                    queryParams.min_participants_count = minPart
                }
            }
            if (filters.maxParticipants) {
                const maxPart = parseInt(filters.maxParticipants)
                if (!isNaN(maxPart)) {
                    queryParams.max_participants_count = maxPart
                }
            }
            if (filters.linkedChatUsername) {
                queryParams.linked_chat_username = filters.linkedChatUsername
            }
        }

        // Add sorting parameter - format as JSON string for POST endpoint
        if (sortBy && sortBy.length > 0) {
            // Format as JSON string: single object or array
            if (sortBy.length === 1) {
                queryParams.sort_by = JSON.stringify(sortBy[0])
            } else {
                queryParams.sort_by = JSON.stringify(sortBy)
            }
        }

        let response
        if (writable) {
            response = await getAllWritableGroupsChatsCanSendMessageChatsGet({
                client: orchestratorClient,
                query: queryParams,
            })
        } else {
            // Endpoint changed to POST - use body instead of query
            response = await orchestratorClient.post<Array<ChatView>, unknown, false>({
                url: '/chats/view_chats/',
                body: queryParams,
                security: [
                    {
                        name: 'X-API-Key',
                        type: 'apiKey'
                    }
                ],
            })
        }
        if (response.error) {
            logger.error(`Failed to get orchestrator chats. Body params: ${JSON.stringify(queryParams)}, Error: ${JSON.stringify(response.error)}`)
            throw new Error(`Failed to get orchestrator chats: ${JSON.stringify(response.error)}`)
        }
        logger.info(`Successfully got ${response.data?.length} orchestrator chats`)
        return (response.data ?? []) as ChatRead[]
    }

    async getOrchestratorChatsView(skip: number = 0, limit: number = 0): Promise<ChatRead[]> {
        logger.info(`Getting orchestrator chats view (limit: ${limit})`)
        // Endpoint changed to POST - use body instead of query
        const response = await orchestratorClient.post<Array<ChatView>, unknown, false>({
            url: '/chats/view_chats/',
            body: {
                skip,
                limit,
            },
            security: [
                {
                    name: 'X-API-Key',
                    type: 'apiKey'
                }
            ],
        })
        if (response.error) {
            throw new Error(
                `Failed to get orchestrator chats view: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully got ${response.data?.length} orchestrator chats`)
        return (response.data ?? []) as ChatRead[]
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
            const errorDetail =
                typeof response.error === "object" && response.error && "detail" in response.error
                    ? (response.error as { detail?: string }).detail
                    : undefined
            if (errorDetail === "Chat not found") {
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

    async searchChatsByTopics(
        query: string,
        categoryName?: string,
        topk?: number,
        threshold?: number,
        filters?: {
            username?: string
            title?: string
            chatType?: string
            platform?: string
            minParticipants?: number
            maxParticipants?: number
            linkedChatUsername?: string
            hasCategory?: string
        },
        sortBy?: Array<{ field: string; order?: 'asc' | 'desc' }> | null,
    ) {
        logger.info(`Searching chats by topics: ${query}`)

        const bodyParams: Record<string, unknown> = {
            query,
            // Use limit instead of topk (endpoint uses only one of them for pagination)
            ...(typeof topk === "number" && !Number.isNaN(topk) ? { limit: topk } : {}),
            ...(typeof threshold === "number" && !Number.isNaN(threshold) ? { threshold } : {}),
        }

        // category_name is only used when adding chats to a category (not for filtering)
        if (categoryName) {
            bodyParams.category_name = categoryName
        }

        // Add filter parameters
        if (filters) {
            if (filters.username) {
                bodyParams.username = filters.username
            }
            if (filters.title) {
                bodyParams.title = filters.title
            }
            if (filters.chatType) {
                bodyParams.chat_type = filters.chatType
            }
            if (filters.platform) {
                // Try to parse as number for platform_id, otherwise skip
                const platformId = parseInt(filters.platform)
                if (!isNaN(platformId)) {
                    bodyParams.platform_id = platformId
                }
            }
            if (typeof filters.minParticipants === "number") {
                bodyParams.min_participants_count = filters.minParticipants
            }
            if (typeof filters.maxParticipants === "number") {
                bodyParams.max_participants_count = filters.maxParticipants
            }
            if (filters.linkedChatUsername) {
                bodyParams.linked_chat_username = filters.linkedChatUsername
            }
            // has_category is used for filtering chats that have a specific category
            if (filters.hasCategory) {
                bodyParams.has_category = filters.hasCategory
            }
        }

        // Add sorting parameter - format as Array<SortField> for searchChatsByTopicsChatsSearchChatsPost
        if (sortBy && sortBy.length > 0) {
            bodyParams.sort_by = sortBy
        }

        const response = categoryName
            ? await searchChatsByTopicsAndAddToCategoryChatsSearchChatsAddToCategoryPost({
                  client: orchestratorClient,
                  body: bodyParams as any, // Type assertion needed due to dynamic filter parameters
              })
            : await searchChatsByTopicsChatsSearchChatsPost({
                  client: orchestratorClient,
                  body: bodyParams as any, // Type assertion needed due to dynamic filter parameters
              })

        if (response.error) {
            throw new Error(`Failed to search chats by topics: ${JSON.stringify(response.error)}`)
        }
        logger.info(`Successfully searched chats by topics: ${query}`)
        return response
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
            throw new Error(
                `Failed to get orchestrator chat categories: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to get orchestrator chat characters: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to get orchestrator categories: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info("Successfully got orchestrator categories")
        return response.data ?? []
    }

    async getOrchestratorChatsWithCategories(): Promise<
        [CategoryWithChatCount[], Record<string, ChatWithCategory[]>]
    > {
        const rootCategory = await this.getOrchestratorRootCategory()
        logger.info("Getting orchestrator chats descendants")
        const response = await getCategoryDescendantsCategoriesCategoryIdDescendantsGet({
            client: orchestratorClient,
            path: {
                category_id: rootCategory.id,
            },
        })
        if (response.error) {
            throw new Error(
                `Failed to get orchestrator chat descendants: ${JSON.stringify(response.error)}`,
            )
        }
        if (!response.data) {
            throw new Error("Failed to get orchestrator chat descendants")
        }
        const categories = [rootCategory, ...response.data]

        const uniqueCategories: CategoryRead[] = []
        for (const category of categories) {
            if (!uniqueCategories.some((cat) => cat.id === category.id)) {
                uniqueCategories.push(category)
            }
        }
        const chatsWithCategory = await Promise.all(
            uniqueCategories.map(async (category) => {
                const chatsWithinCategory = await getCategoryChatsCategoriesCategoryIdChatsGet({
                    client: orchestratorClient,
                    path: {
                        category_id: category.id,
                    },
                })
                if (chatsWithinCategory.error || !chatsWithinCategory.data) {
                    throw new Error(
                        `Failed to get orchestrator chat category: ${JSON.stringify(chatsWithinCategory.error)}`,
                    )
                }
                logger.info(
                    `Fetched ${chatsWithinCategory.data.length} chats for category ${category.id}`,
                )
                return {
                    chats: chatsWithinCategory.data,
                    category,
                }
            }),
        )

        const chatsByCategory: Record<string, ChatWithCategory[]> = {}
        for (const { chats, category } of chatsWithCategory) {
            chatsByCategory[category.id] = chats.map(
                (chat) =>
                    ({
                        chat,
                        category,
                    }) as ChatWithCategory,
            )
        }

        logger.info("Successfully got orchestrator chats descendants")
        return [
            uniqueCategories.map((category) => ({
                category,
                count: chatsByCategory[category.id].length,
            })),
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
            throw new Error(
                `Failed to remove chat from category: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully removed chat from category: ${chatId}`)
        return response.data ?? null
    }

    async addManyChatsToCategory(chatIds: string[], categoryId: string) {
        logger.info(`Adding ${chatIds.length} chats to category: ${categoryId}`)
        const response = await addManyChatsToCategoryCategoriesCategoryIdManyChatsPost({
            client: orchestratorClient,
            path: { category_id: categoryId },
            body: { chat_ids: chatIds },
        })
        if (response.error) {
            throw new Error(`Failed to add chats to category: ${JSON.stringify(response.error)}`)
        }
        logger.info(`Successfully added ${chatIds.length} chats to category: ${categoryId}`)
        return response.data ?? null
    }

    async deleteOrchestratorChat(chatId: string) {
        logger.info(`Deleting orchestrator chat: ${chatId}`)
        const response = await deleteChatChatsChatIdDelete({
            client: orchestratorClient,
            path: { chat_id: chatId },
        })
        if (response.error) {
            throw new Error(`Failed to delete orchestrator chat: ${JSON.stringify(response.error)}`)
        }
        logger.info(`Successfully deleted orchestrator chat: ${chatId}`)
        return response.data ?? null
    }

    private async fetchMystiqueChat(
        chatIdentifier: string,
    ): Promise<OrchestratorChatCreate | null> {
        const trimmed = chatIdentifier.trim()
        if (!trimmed) {
            throw new Error("Chat identifier is required")
        }
        const numericValue = Number(trimmed)
        const isNumeric = !Number.isNaN(numericValue) && /^\d+$/.test(trimmed)
        const identifierValue = isNumeric ? numericValue : trimmed

        logger.info(`Searching Mystique for chat identifier: ${identifierValue}`)
        const response = await findTelegramChatApiChatsFindTelegramChatUserIdChatIdentifierGet({
            client: mystiqueClient,
            path: {
                user_id: this.mystiqueUserId,
                chat_identifier: identifierValue as string | number,
            },
        })
        if (response.error) {
            throw new Error(`Mystique lookup failed: ${JSON.stringify(response.error)}`)
        }
        return (response.data as OrchestratorChatCreate | null) ?? null
    }

    async createChatFromMystique(chatIdentifier: string): Promise<ChatRead> {
        const chatPayload = await this.fetchMystiqueChat(chatIdentifier)
        if (!chatPayload) {
            throw new Error("Mystique did not return a chat for the provided identifier")
        }
        const response = await createChatChatsPost({
            client: orchestratorClient,
            body: chatPayload,
        })
        if (response.error || !response.data) {
            throw new Error(
                `Failed to create chat in orchestrator: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully imported chat ${response.data.id} via Mystique`)
        return response.data
    }

    async createOrchestratorCategory(
        name: string,
        description: string = "",
        parentId: string | null = null,
    ) {
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
            throw new Error(
                `Failed to create orchestrator category: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to delete orchestrator category: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to get orchestrator root category: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to get orchestrator missions: ${JSON.stringify(response.error)}`,
            )
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
            "FluffMission",
            "MassDmMission",
            "ResolvePhoneMission",
        ]
        const relevantMissions = missions.filter((mission) =>
            missionTypesRelevantForExposure.includes(mission.mission_type as MissionType),
        )
        const missionsWithExposureStats = await Promise.all(
            relevantMissions.map(async (mission) => {
                const response = await getMissionPotentialExposureMissionsExposureMissionIdGet({
                    client: orchestratorClient,
                    path: {
                        mission_id: mission.id,
                    },
                })
                if (response.error) {
                    throw new Error(
                        `Failed to get orchestrator mission: ${JSON.stringify(response.error)}`,
                    )
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
            "FluffMission",
            "MassDmMission",
            "ResolvePhoneMission",
        ]
        const relevantMissions = await Promise.all(
            missions
                .filter((mission) =>
                    missionTypesRelevantForExposure.includes(mission.mission_type as MissionType),
                )
                .map(async (mission) => {
                    if ((mission.mission_type as MissionType) !== "ResolvePhoneMission")
                        return mission
                    // For ResolvePhoneMission, derive status only from scenarios
                    try {
                        const detailed = await this.getOrchestratorMission(mission.id)
                        const scenarios = detailed.scenarios || []
                        const scenariosCount = detailed.scenarios_count ?? scenarios.length
                        const successCount =
                            detailed.success_scenarios ??
                            scenarios.filter((s) => s.status_code === "success").length
                        let derivedStatus = mission.status_code
                        if (scenariosCount > 0) {
                            const anyRunning = scenarios.some((s) =>
                                [
                                    "running",
                                    "in_process",
                                    "pending",
                                    "scheduled",
                                    "planned",
                                ].includes((s.status_code || "").toString()),
                            )
                            const allFinished = scenarios.every((s) =>
                                ["success", "failed", "cancelled"].includes(
                                    (s.status_code || "").toString(),
                                ),
                            )
                            if (anyRunning) {
                                derivedStatus = "running"
                            } else if (allFinished || successCount === scenariosCount) {
                                derivedStatus = "completed"
                            }
                        }
                        return { ...mission, status_code: derivedStatus }
                    } catch {
                        return mission
                    }
                }),
        )

        const filteredMissions = relevantMissions.filter((mission) => {
            const status = mission.status_code
            return status !== "failed_planning" && status !== "canceled"
        })

        const missionsWithExposureAndStats = await Promise.all(
            filteredMissions.map(async (mission) => {
                const isCompleted = mission.status_code === "completed"

                if (isCompleted && mission.run_result && typeof mission.run_result === "object") {
                    const runResult = mission.run_result as {
                        mission_exposure?: MissionExposure | null
                        mission_statistics?: MissionStatistics | null
                    }
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
                        actual_exposure_groups: 0,
                    }
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
            throw new Error(
                `Failed to get orchestrator mission statistics: ${JSON.stringify(response.error)}`,
            )
        }
        logger.info(`Successfully got orchestrator mission statistics: ${missionId}`)
        const stats = response.data ?? []
        return stats[0] ?? null
    }

    async getOrchestratorMissionFailureReasons(missionId: string): Promise<ActionRead[]> {
        logger.info(`Getting orchestrator mission failure reasons: ${missionId}`)
        const response = await getMissionFailureReasonsMissionsFailureReasonsMissionIdGet({
            client: orchestratorClient,
            path: { mission_id: missionId },
        })
        if (response.error) {
            throw new Error(
                `Failed to get orchestrator mission failure reasons: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to get orchestrator missions: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to delete orchestrator mission: ${JSON.stringify(response.error)}`,
            )
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
            throw new Error(
                `Failed to submit orchestrator mission: ${JSON.stringify(response.error)}`,
            )
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
            const detail =
                typeof response.error === "object" && response.error && "detail" in response.error
                    ? (response.error as { detail?: unknown }).detail
                    : response.error
            throw new Error(`Failed to plan orchestrator mission: ${JSON.stringify(detail)}`)
        }
        logger.info(`Successfully planned orchestrator mission: ${missionId}`)
        return response.data ?? []
    }

    async getOperatorScenarios(): Promise<{ [key: string]: ScenarioWithResultReadable }> {
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

    async getOperatorScenarioById(scenarioId: string): Promise<ScenarioWithResultReadable | null> {
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
            body: {
                profile_id: profileId,
                verify_profile_exists,
                should_override,
                session_data: {},
            },
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
        const response = await this.avatarsFetch<ProxyRead[]>("/proxies")
        logger.info("Successfully got proxies")
        return response ?? []
    }

    async getProxyById(proxyId: string) {
        logger.info("Getting proxy by id")
        const response = await this.avatarsFetch<ProxyRead>(`/proxies/${proxyId}`)
        logger.info("Successfully got proxy by id")
        return response ?? null
    }

    async pingProxy(proxyId: string) {
        logger.info("Pinging proxy")
        const response = await this.avatarsFetch(`/proxies/${proxyId}/ping`, {
            method: "PUT",
        })
        logger.info("Successfully pinged proxy")
        return response ?? null
    }

    async updateProxyStatus(proxyId: string, enabled: boolean) {
        logger.info(`Updating proxy status: ${proxyId} -> ${enabled}`)
        const response = await this.avatarsFetch<ProxyRead>(
            `/proxies/${proxyId}/status?enabled=${enabled}`,
            {
                method: "PUT",
            },
        )
        logger.info("Successfully updated proxy status")
        return response ?? null
    }

    async getAvatars() {
        logger.info("Getting avatars with proxy information")
        logger.info("[DEBUG] getAvatars called")
        logger.info(
            `[DEBUG] avatarsClient baseUrl: ${(avatarsClient as any)._options?.baseUrl || "not set"}`,
        )
        logger.info(`[DEBUG] Calling avatars API at: ${this.env.avatarsApiEndpoint}`)

        let response
        try {
            response = await avatarsClient.get({
                url: "/avatars/",
                query: { attach_proxy: true },
                parseAs: "json",
            })

            logger.info(`[DEBUG] Response received: ${response.error ? "ERROR" : "SUCCESS"}`)

            if (response.error) {
                logger.error(`[DEBUG] Avatar fetch error: ${JSON.stringify(response.error)}`)
                throw new Error(`Failed to get avatars: ${JSON.stringify(response.error)}`)
            }

            logger.info(`[DEBUG] Avatar count: ${(response.data as any[])?.length || 0}`)
        } catch (error) {
            logger.error(`[DEBUG] Exception in getAvatars: ${error}`)
            throw error
        }

        // Transform the data to fix null values and invalid formats
        const avatars = (response.data as any[]) ?? []
        const cleanedAvatars = avatars.map((avatar: any) => {
            return {
                ...avatar,
                strategy: avatar.strategy ?? "",
                strategy_expiration: avatar.strategy_expiration ?? "",

                avatar_state: avatar.avatar_state
                    ? {
                          ...avatar.avatar_state,
                          created_at: avatar.avatar_state.created_at
                              ? new Date(avatar.avatar_state.created_at).toISOString()
                              : new Date().toISOString(),
                          updated_at: avatar.avatar_state.updated_at
                              ? new Date(avatar.avatar_state.updated_at).toISOString()
                              : new Date().toISOString(),
                      }
                    : avatar.avatar_state,

                // Fix social_media_accounts
                social_media_accounts:
                    avatar.social_media_accounts?.map((account: any) => ({
                        ...account,
                        profile_image_url: account.profile_image_url ?? "",
                        subject_image_url: account.subject_image_url ?? "",
                    })) ?? [],

                // Fix proxy object
                proxy: avatar.proxy ?? {},
            }
        })

        return cleanedAvatars as AvatarRead[]
    }

    async getAvatar(profileId: string): Promise<AvatarRead> {
        const response = await getAvatarRequest({
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
            media.Contents?.map(async (item) => {
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
        const filteredMediaItems = mediaItems.filter((item) => item !== null)
        return filteredMediaItems
    }

    async getS3Images(path: string): Promise<MediaItem[]> {
        logger.info(
            `Getting S3 images from bucket ${this.env.operatorLogsBucketName} with path ${path}`,
        )
        const objects = await this.operatorLogsS3Client.send(
            new ListObjectsV2Command({
                Bucket: this.env.operatorLogsBucketName,
                Prefix: path,
            }),
        )
        logger.info(`Found ${objects.Contents?.length} images in ${path}`)

        const imageItems = await Promise.all(
            objects.Contents?.map(async (item) => {
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

        const filteredImageItems = imageItems.filter((item) => item !== null)

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
