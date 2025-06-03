export interface ServerEnv {
  isLocal: boolean;
  avatarsApiEndpoint: string;
  avatarsApiKey: string;
  operatorApiEndpoint: string;
  orchestratorApiEndpoint: string;
  orchestratorApiKey: string;
  serverUrl: string;
  web1DataPath?: string;
  allowedCountries: string[];
}

export function read_server_env(): ServerEnv {
  const isLocal = process.env.LOCAL === "true";
  const avatarsApiEndpoint = process.env.AVATARS_API_ENDPOINT;
  if (!avatarsApiEndpoint) {
    throw new Error("Missing environment variable 'AVATARS_API_ENDPOINT'");
  }
  const avatarsApiKey = process.env.AVATARS_API_KEY;
  if (!avatarsApiKey) {
    throw new Error("Missing environment variable 'AVATARS_API_KEY'");
  }
  const operatorApiEndpoint = process.env.OPERATOR_API_ENDPOINT;
  if (!operatorApiEndpoint) {
    throw new Error("Missing environment variable 'OPERATOR_API_ENDPOINT'");
  }
  const orchestratorApiEndpoint = process.env.ORCHESTRATOR_API_ENDPOINT;
  if (!orchestratorApiEndpoint) {
    throw new Error("Missing environment variable 'ORCHESTRATOR_API_ENDPOINT'");
  }
  const orchestratorApiKey = process.env.ORCHESTRATOR_API_KEY;
  if (!orchestratorApiKey) {
    throw new Error("Missing environment variable 'ORCHESTRATOR_API_KEY'");
  }
  const web1DataPath = process.env.WEB1_DATA_PATH;
  const serverUrl =
    process.env.SERVER_URL || `http://localhost:${process.env.PORT}`;
  const allowedCountries = process.env.ALLOWED_COUNTRIES || "";
  const parsedAllowedCountries = allowedCountries.split(",");

  return {
    isLocal,
    avatarsApiEndpoint,
    avatarsApiKey,
    operatorApiEndpoint,
    orchestratorApiEndpoint,
    orchestratorApiKey,
    serverUrl,
    web1DataPath,
    allowedCountries: parsedAllowedCountries,
  };
}
