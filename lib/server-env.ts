export interface ServerEnv {
    isLocal: boolean
    avatarsApiEndpoint: string
    avatarsApiKey: string
    operatorApiEndpoint: string
    orchestratorApiEndpoint: string
    orchestratorApiKey: string
    mystiqueApiEndpoint: string
    mystiqueApiKey: string
    mystiqueUserId: string
    serverUrl: string
    web1DataPath?: string
    allowedCountries: string[]
    mediaBucketRegion: string
    mediaBucketName: string
    operatorLogsBucketName: string
    opensearchBaseUrl: string
    opensearchIndexPatternId: string
}

import { logger } from "./logger"

export function read_server_env(): ServerEnv {
    logger.info('[DEBUG] Starting read_server_env...')
    logger.info(`[DEBUG] NODE_ENV: ${process.env.NODE_ENV}`)
    
    const isLocal = process.env.LOCAL === "true"
    logger.info(`[DEBUG] isLocal: ${isLocal}`)
    
    const avatarsApiEndpoint = process.env.AVATARS_API_ENDPOINT
    logger.info(`[DEBUG] AVATARS_API_ENDPOINT: ${avatarsApiEndpoint}`)
    if (!avatarsApiEndpoint) {
        throw new Error("Missing environment variable 'AVATARS_API_ENDPOINT'")
    }
    const avatarsApiKey = process.env.AVATARS_API_KEY
    logger.info(`[DEBUG] AVATARS_API_KEY: ${avatarsApiKey ? `${avatarsApiKey.substring(0, 4)}...` : 'MISSING'}`)
    if (!avatarsApiKey) {
        throw new Error("Missing environment variable 'AVATARS_API_KEY'")
    }
    const operatorApiEndpoint = process.env.OPERATOR_API_ENDPOINT
    logger.info(`[DEBUG] OPERATOR_API_ENDPOINT: ${operatorApiEndpoint}`)
    if (!operatorApiEndpoint) {
        throw new Error("Missing environment variable 'OPERATOR_API_ENDPOINT'")
    }
    const orchestratorApiEndpoint = process.env.ORCHESTRATOR_API_ENDPOINT
    logger.info(`[DEBUG] ORCHESTRATOR_API_ENDPOINT: ${orchestratorApiEndpoint}`)
    if (!orchestratorApiEndpoint) {
        throw new Error("Missing environment variable 'ORCHESTRATOR_API_ENDPOINT'")
    }
    const orchestratorApiKey = process.env.ORCHESTRATOR_API_KEY
    logger.info(`[DEBUG] ORCHESTRATOR_API_KEY: ${orchestratorApiKey ? `${orchestratorApiKey.substring(0, 4)}...` : 'MISSING'}`)
    const mystiqueApiEndpoint = process.env.MYSTIQUE_API_ENDPOINT
    logger.info(`[DEBUG] MYSTIQUE_API_ENDPOINT: ${mystiqueApiEndpoint}`)
    if (!mystiqueApiEndpoint) {
        throw new Error("Missing environment variable 'MYSTIQUE_API_ENDPOINT'")
    }
    const mystiqueApiKey = process.env.MYSTIQUE_API_KEY
    logger.info(`[DEBUG] MYSTIQUE_API_KEY: ${mystiqueApiKey ? `${mystiqueApiKey.substring(0, 4)}...` : 'MISSING'}`)
    if (!mystiqueApiKey) {
        throw new Error("Missing environment variable 'MYSTIQUE_API_KEY'")
    }
    const mystiqueUserId = process.env.MYSTIQUE_USER_ID
    logger.info(`[DEBUG] MYSTIQUE_USER_ID: ${mystiqueUserId}`)
    if (!mystiqueUserId) {
        throw new Error("Missing environment variable 'MYSTIQUE_USER_ID'")
    }

    if (!orchestratorApiKey) {
        throw new Error("Missing environment variable 'ORCHESTRATOR_API_KEY'")
    }

    const mediaBucketRegion = process.env.MEDIA_BUCKET_REGION
    logger.info(`[DEBUG] MEDIA_BUCKET_REGION: ${mediaBucketRegion}`)
    if (!mediaBucketRegion) {
        throw new Error("Missing environment variable 'MEDIA_BUCKET_REGION'")
    }
    const mediaBucketName = process.env.MEDIA_BUCKET_NAME
    logger.info(`[DEBUG] MEDIA_BUCKET_NAME: ${mediaBucketName}`)
    if (!mediaBucketName) {
        throw new Error("Missing environment variable 'MEDIA_BUCKET_NAME'")
    }

    const web1DataPath = process.env.WEB1_DATA_PATH
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT}`
    logger.info(`[DEBUG] SERVER_URL: ${serverUrl}`)
    const allowedCountries = process.env.ALLOWED_COUNTRIES || ""
    const parsedAllowedCountries = allowedCountries.split(",")

    const operatorLogsBucketName = process.env.OPERATOR_LOGS_BUCKET_NAME
    logger.info(`[DEBUG] OPERATOR_LOGS_BUCKET_NAME: ${operatorLogsBucketName}`)
    if (!operatorLogsBucketName) {
        throw new Error("Missing environment variable 'OPERATOR_LOGS_BUCKET_NAME'")
    }

    const opensearchBaseUrl = process.env.OPENSEARCH_BASE_URL
    logger.info(`[DEBUG] OPENSEARCH_BASE_URL: ${opensearchBaseUrl}`)
    if (!opensearchBaseUrl) {
        throw new Error("Missing environment variable 'OPENSEARCH_BASE_URL'")
    }
    const opensearchIndexPatternId = process.env.OPENSEARCH_INDEX_PATTERN_ID
    logger.info(`[DEBUG] OPENSEARCH_INDEX_PATTERN_ID: ${opensearchIndexPatternId}`)
    if (!opensearchIndexPatternId) {
        throw new Error("Missing environment variable 'OPENSEARCH_INDEX_PATTERN_ID'")
    }

    logger.info('[DEBUG] Successfully loaded all environment variables')

    return {
        isLocal,
        avatarsApiEndpoint,
        avatarsApiKey,
        operatorApiEndpoint,
        orchestratorApiEndpoint,
        orchestratorApiKey,
        mystiqueApiEndpoint,
        mystiqueApiKey,
        mystiqueUserId,
        serverUrl,
        web1DataPath,
        allowedCountries: parsedAllowedCountries,
        mediaBucketRegion,
        mediaBucketName,
        operatorLogsBucketName,
        opensearchBaseUrl,
        opensearchIndexPatternId,
    }
}
