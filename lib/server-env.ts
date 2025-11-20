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

export function read_server_env(): ServerEnv {
    const isLocal = process.env.LOCAL === "true"
    const avatarsApiEndpoint = process.env.AVATARS_API_ENDPOINT
    if (!avatarsApiEndpoint) {
        throw new Error("Missing environment variable 'AVATARS_API_ENDPOINT'")
    }
    const avatarsApiKey = process.env.AVATARS_API_KEY
    if (!avatarsApiKey) {
        throw new Error("Missing environment variable 'AVATARS_API_KEY'")
    }
    const operatorApiEndpoint = process.env.OPERATOR_API_ENDPOINT
    if (!operatorApiEndpoint) {
        throw new Error("Missing environment variable 'OPERATOR_API_ENDPOINT'")
    }
    const orchestratorApiEndpoint = process.env.ORCHESTRATOR_API_ENDPOINT
    if (!orchestratorApiEndpoint) {
        throw new Error("Missing environment variable 'ORCHESTRATOR_API_ENDPOINT'")
    }
    const orchestratorApiKey = process.env.ORCHESTRATOR_API_KEY
    const mystiqueApiEndpoint = process.env.MYSTIQUE_API_ENDPOINT
    if (!mystiqueApiEndpoint) {
        throw new Error("Missing environment variable 'MYSTIQUE_API_ENDPOINT'")
    }
    const mystiqueApiKey = process.env.MYSTIQUE_API_KEY
    if (!mystiqueApiKey) {
        throw new Error("Missing environment variable 'MYSTIQUE_API_KEY'")
    }
    const mystiqueUserId = process.env.MYSTIQUE_USER_ID
    if (!mystiqueUserId) {
        throw new Error("Missing environment variable 'MYSTIQUE_USER_ID'")
    }

    if (!orchestratorApiKey) {
        throw new Error("Missing environment variable 'ORCHESTRATOR_API_KEY'")
    }

    const mediaBucketRegion = process.env.MEDIA_BUCKET_REGION
    if (!mediaBucketRegion) {
        throw new Error("Missing environment variable 'MEDIA_BUCKET_REGION'")
    }
    const mediaBucketName = process.env.MEDIA_BUCKET_NAME
    if (!mediaBucketName) {
        throw new Error("Missing environment variable 'MEDIA_BUCKET_NAME'")
    }

    const web1DataPath = process.env.WEB1_DATA_PATH
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT}`
    const allowedCountries = process.env.ALLOWED_COUNTRIES || ""
    const parsedAllowedCountries = allowedCountries.split(",")

    const operatorLogsBucketName = process.env.OPERATOR_LOGS_BUCKET_NAME
    if (!operatorLogsBucketName) {
        throw new Error("Missing environment variable 'OPERATOR_LOGS_BUCKET_NAME'")
    }

    const opensearchBaseUrl = process.env.OPENSEARCH_BASE_URL
    if (!opensearchBaseUrl) {
        throw new Error("Missing environment variable 'OPENSEARCH_BASE_URL'")
    }
    const opensearchIndexPatternId = process.env.OPENSEARCH_INDEX_PATTERN_ID
    if (!opensearchIndexPatternId) {
        throw new Error("Missing environment variable 'OPENSEARCH_INDEX_PATTERN_ID'")
    }

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
