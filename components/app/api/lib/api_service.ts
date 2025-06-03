import { client as operatorClient } from "@lib/api/operator/client.gen";
import { client as avatarsClient } from "@lib/api/avatars/client.gen";
import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen";
import {
  stopProfileCharactersCharacterIdStopPost,
  submitScenarioAsyncScenarioPost,
  Scenario,
} from "@lib/api/operator";
import { getAllCharactersCharactersGet } from "@lib/api/orchestrator/sdk.gen";
import {
  avatarsAvatarsGet,
  patchAvatarAvatarsAvatarIdPatch,
} from "@lib/api/avatars/sdk.gen";
import { read_server_env } from "../../../lib/server-env";
import { CombinedAvatar } from "@lib/api/models";
import { Web1Client } from "@lib/web1/web1-client";
import { Web1Account } from "@lib/web1/web1-models";
import { CharacterRead, ChatRead, MissionRead } from "@lib/api/orchestrator";
import {
  getAllChatsChatsGet,
  getMissionsMissionsGet,
} from "@lib/api/orchestrator/sdk.gen";

export class ApiService {
  constructor(
    avatarsApiEndpoint: string | null = null,
    avatarsApiKey: string | null = null,
    operatorApiEndpoint: string | null = null,
    orchestratorApiEndpoint: string | null = null,
    orchestratorApiKey: string | null = null
  ) {
    const env = read_server_env();

    const effectiveAvatarsApiEndpoint =
      avatarsApiEndpoint || env.avatarsApiEndpoint;
    if (!effectiveAvatarsApiEndpoint) {
      throw new Error("Avatars API endpoint not defined");
    }
    const effectiveAvatarsApiKey = avatarsApiKey || env.avatarsApiKey;
    if (!effectiveAvatarsApiKey) {
      throw new Error("Avatars API key not defined");
    }
    const effectiveOperatorApiEndpoint =
      operatorApiEndpoint || env.operatorApiEndpoint;
    if (!effectiveOperatorApiEndpoint) {
      throw new Error("Operator API endpoint not defined");
    }
    const effectiveOrchestratorApiEndpoint =
      orchestratorApiEndpoint || env.orchestratorApiEndpoint;
    if (!effectiveOrchestratorApiEndpoint) {
      throw new Error("Orchestrator API endpoint not defined");
    }
    const effectiveOrchestratorApiKey =
      orchestratorApiKey || env.orchestratorApiKey;
    if (!effectiveOrchestratorApiKey) {
      throw new Error("Orchestrator API key not defined");
    }

    operatorClient.setConfig({
      baseUrl: effectiveOperatorApiEndpoint,
    });
    avatarsClient.setConfig({
      baseUrl: effectiveAvatarsApiEndpoint,
      headers: {
        "X-Api-Key": effectiveAvatarsApiKey,
      },
    });
    orchestratorClient.setConfig({
      baseUrl: effectiveOrchestratorApiEndpoint,
      headers: {
        "X-Api-Key": effectiveOrchestratorApiKey,
      },
    });
  }

  async listProfiles(): Promise<CombinedAvatar[]> {
    console.log("Listing all avatars...");
    const [allAvatarsResponse, runningAvatarsResponse] = await Promise.all([
      avatarsAvatarsGet(),
      getAllCharactersCharactersGet(),
    ]);
    if (allAvatarsResponse.error || !allAvatarsResponse.data) {
      throw new Error(
        `Failed to fetch all avatars: ${JSON.stringify(
          allAvatarsResponse.error
        )}`
      );
    }
    if (runningAvatarsResponse.error || !runningAvatarsResponse.data) {
      throw new Error(
        `Failed to fetch running avatars: ${JSON.stringify(
          runningAvatarsResponse.error
        )}`
      );
    }
    console.log("Successfully fetched all avatars.");

    return allAvatarsResponse.data.map((avatar) => {
      const character = runningAvatarsResponse.data.find(
        (profile) => profile.id === avatar.id
      );

      // Convert CharacterRead to ProfileWorkerView
      const profile_worker_view = character
        ? {
            id: character.id,
            state: "idle" as const, // Default state since CharacterRead doesn't have state
            current_scenario: null,
            current_scenario_result: null,
            pending_actions: 0,
          }
        : undefined;

      // Ensure proxy and its fields are properly typed
      const proxy = avatar.proxy
        ? {
            ...avatar.proxy,
            ip_api_data: avatar.proxy.ip_api_data ?? null,
            city: avatar.proxy.city ?? null,
            iso_3166_1_alpha_2_code:
              avatar.proxy.iso_3166_1_alpha_2_code ?? null,
            iso_3166_2_subdivision_code:
              avatar.proxy.iso_3166_2_subdivision_code ?? null,
            continent_code: avatar.proxy.continent_code ?? null,
            timezone: avatar.proxy.timezone ?? null,
          }
        : null;

      return {
        avatar: {
          ...avatar,
          proxy,
        },
        profile_worker_view,
      } satisfies CombinedAvatar;
    });
  }

  async listWeb1Accounts(): Promise<Web1Account[]> {
    const response = await new Web1Client().listAccounts();
    return response;
  }

  async updateProfilePhone(profileId: string, phoneNumber: string) {
    console.log(`Updating profile phone for ${profileId}...`);
    const response = await patchAvatarAvatarsAvatarIdPatch({
      path: {
        avatar_id: profileId,
      },
      body: {
        path: ["phone_number"],
        new_value: phoneNumber,
      },
    });
    if (response.error) {
      throw new Error(
        `Failed to update profile phone: ${JSON.stringify(response.error)}`
      );
    }
    console.log(`Successfully updated profile phone for ${profileId}.`);
  }

  async stop(avatarId: string) {
    const response = await stopProfileCharactersCharacterIdStopPost({
      client: operatorClient,
      path: {
        character_id: avatarId,
      },
    });
    if (response.error) {
      throw new Error(
        `Failed to stop avatar: ${JSON.stringify(response.error)}`
      );
    }
    console.log("Successfully stopped avatar.");
  }

  async submitScenario(scenario: Scenario) {
    const response = await submitScenarioAsyncScenarioPost({
      client: operatorClient,
      body: scenario,
    });
    if (response.error) {
      throw new Error(
        `Failed to stop avatar: ${JSON.stringify(response.error)}`
      );
    }
    console.log("Successfully submitted scenario.");
  }

  async getOrchestratorCharacters(): Promise<CharacterRead[]> {
    const response = await getAllCharactersCharactersGet({
      client: orchestratorClient,
    });
    if (response.error) {
      throw new Error(
        `Failed to get orchestrator characters: ${JSON.stringify(
          response.error
        )}`
      );
    }
    return response.data ?? [];
  }

  async getOrchestratorChats(): Promise<ChatRead[]> {
    const response = await getAllChatsChatsGet({
      client: orchestratorClient,
    });
    if (response.error) {
      throw new Error(
        `Failed to get orchestrator chats: ${JSON.stringify(response.error)}`
      );
    }
    return response.data ?? [];
  }

  async getOrchestratorMissions(): Promise<MissionRead[]> {
    const response = await getMissionsMissionsGet({
      client: orchestratorClient,
    });
    if (response.error) {
      throw new Error(
        `Failed to get orchestrator missions: ${JSON.stringify(response.error)}`
      );
    }
    return response.data ?? [];
  }
}
