import { AvatarModelWithProxy } from "./api/avatars"
import {
  CombinedAvatar,
  MediaItem,
  MediaUploadPayload,
  MissionStatistics,
  MissionWithExposureAndStats,
  MissionWithExposureStats,
} from "./api/models"
import { ActivationStatus, ProfileWorkerView, ScenarioWithResult } from "./api/operator"
import { MissionCreate, MissionRead, ScenarioRead } from "./api/orchestrator"
import { ActionRead, ChatRead } from "./api/orchestrator/types.gen"
import { ClientEnv, read_client_env } from "./client-env"
import { logger } from "./logger"
import { Web1Account } from "./web1/web1-models"

/**
 * Client for usage from the frontend.
 */
export class ServiceBrowserClient {
  env: ClientEnv

  constructor() {
    this.env = read_client_env()
  }

  async listProfiles() {
    const resp = await fetch(`/api/avatars/avatars`)
    const json = (await resp.json()) as CombinedAvatar[]
    return json
  }

  async getProfile(profileId: string) {
    const resp = await fetch(`/api/avatars/avatar?profileId=${profileId}`)
    const json = (await resp.json()) as AvatarModelWithProxy
    return json
  }

  async updateProfile(profileId: string, path: string, value: string) {
    const resp = await fetch(`/api/avatars/avatars`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profileId, path, value }),
    })
    if (!resp.ok) {
      throw new Error(`Failed to update avatar: ${resp.statusText}`)
    }
  }

  async updateChatCategories(chatId: string, newCategoryIds: string[], removedCategoryIds: string[]) {
    for (const categoryId of newCategoryIds) {
      logger.info(`Adding chat to category ${categoryId}`)
      const resp = await fetch(`/api/orchestrator/chats/${chatId}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ categoryId }),
      })
      if (!resp.ok) {
        throw new Error(`Failed to add chat to category ${categoryId}: ${resp.statusText}`)
      } else {
        logger.info(`Successfully added chat to category ${categoryId}`)
      }
    }
    for (const categoryId of removedCategoryIds) {
      const resp = await fetch(`/api/orchestrator/chats/${chatId}/categories`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ categoryId }),
      })
      if (!resp.ok) {
        throw new Error(`Failed to remove chat from category ${categoryId}: ${resp.statusText}`)
      } else {
        logger.info(`Successfully removed chat from category ${categoryId}`)
      }
    }
  }

  async assignProxy(profileId: string) {
    const resp = await fetch(`/api/assign_proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profileId }),
    })
    if (!resp.ok) {
      throw new Error(`Failed to assign proxy: ${resp.statusText}`)
    }
  }

  async getOperatorScenarios(operatorSlot?: number): Promise<{ [key: string]: ScenarioWithResult }> {
    const endpoint = operatorSlot ? `/api/operator/${operatorSlot}/scenario` : "/api/operator/scenario"
    const resp = await fetch(endpoint)
    const json = (await resp.json()) as { [key: string]: ScenarioWithResult }
    return json
  }

  async getOperatorCharacters(operatorSlot?: number): Promise<ProfileWorkerView[]> {
    const endpoint = operatorSlot ? `/api/operator/${operatorSlot}/characters` : "/api/operator/characters"
    const resp = await fetch(endpoint)
    const json = (await resp.json()) as ProfileWorkerView[]
    return json
  }

  async getOrchestratorMission(missionId: string): Promise<MissionRead> {
    const resp = await fetch(`/api/orchestrator/mission?id=${missionId}`)
    const json = (await resp.json()) as MissionRead
    return json
  }

  async getOrchestratorMissions(): Promise<MissionRead[]> {
    const resp = await fetch(`/api/orchestrator/missions`)
    const json = (await resp.json()) as MissionRead[]
    return json
  }

  async getOrchestratorMissionsWithExposureStats(): Promise<MissionWithExposureStats[]> {
    const resp = await fetch(`/api/orchestrator/missions/missions-with-statistics`)
    const json = (await resp.json()) as MissionWithExposureStats[]
    return json
  }

  async getOrchestratorMissionsWithExposureAndStats(): Promise<MissionWithExposureAndStats[]> {
    const resp = await fetch(`/api/orchestrator/missions/missions-with-exposure-and-stats`)
    const json = (await resp.json()) as MissionWithExposureAndStats[]
    return json
  }

  async getOrchestratorMissionScenarios(missionId: string): Promise<ScenarioRead[]> {
    const resp = await fetch(`/api/orchestrator/missions/scenarios?mission_id=${missionId}`)
    const json = (await resp.json()) as ScenarioRead[]
    return json
  }

  async submitMission(mission: MissionCreate): Promise<MissionRead> {
    const resp = await fetch("/api/orchestrator/missions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(mission),
    })
    if (!resp.ok) {
      throw new Error(`Failed to submit mission: ${resp.statusText}`)
    }
    const json = (await resp.json()) as MissionRead
    if (json.status_code !== "submitted") {
      throw new Error(`Failed to submit mission: ${json.status_code}`)
    }
    return json
  }

  async planMission(missionId: string): Promise<ScenarioRead[]> {
    const resp = await fetch(`/api/orchestrator/missions/plan?id=${missionId}`, {
      method: "POST",
    })
    if (!resp.ok) {
      throw new Error(`Failed to plan mission: ${resp.statusText}`)
    }
    const json = (await resp.json()) as ScenarioRead[]
    return json
  }

  async getMissionStatistics(missionId: string): Promise<MissionStatistics> {
    const resp = await fetch(`/api/orchestrator/missions/statistics?mission_id=${missionId}`)
    const json = (await resp.json()) as MissionStatistics
    return json
  }

  async getMissionFailureReasons(missionId: string): Promise<ActionRead[]> {
    const resp = await fetch(`/api/orchestrator/missions/failure_reasons/${missionId}`)
    const json = (await resp.json()) as ActionRead[]
    return json
  }

  async getMissionSuccessfulChats(missionId: string): Promise<ChatRead[]> {
    const resp = await fetch(`/api/orchestrator/missions/successfull_chats/${missionId}`)
    const json = (await resp.json()) as ChatRead[]
    return json
  }

  async runMission(missionId: string): Promise<ScenarioRead[]> {
    const resp = await fetch(`/api/orchestrator/missions/run?id=${missionId}`, {
      method: "POST",
    })
    if (!resp.ok) {
      throw new Error(`Failed to run mission: ${resp.statusText}`)
    }
    const json = (await resp.json()) as ScenarioRead[]
    return json
  }

  async deleteMission(missionId: string) {
    const resp = await fetch(`/api/orchestrator/mission?id=${missionId}`, {
      method: "DELETE",
    })
    if (!resp.ok) {
      throw new Error(`Failed to delete mission: ${resp.statusText}`)
    }
    const json = await resp.json()
    return json
  }

  async getMedia() {
    const resp = await fetch("/api/media")
    const json = (await resp.json()) as MediaItem[]
    const result = json.map(item => ({ ...item, lastUpdated: new Date(item.lastUpdated) }))
    return result
  }

  async getS3Images(path: string = "attachments/") {
    const resp = await fetch(`/api/s3-images?path=${encodeURIComponent(path)}`)
    if (!resp.ok) {
      throw new Error(`Failed to get S3 images: ${resp.statusText}`)
    }
    const json = (await resp.json()) as MediaItem[]
    const result = json.map(item => ({ ...item, lastUpdated: new Date(item.lastUpdated) }))
    return result
  }

  async uploadMedia(files: File[]) {
    console.log(`Uploading ${files.length} files...`)
    const filePayloads: MediaUploadPayload[] = await Promise.all(
      files.map(async file => {
        const base64 = await this.fileToBase64(file)
        const fileData = {
          name: file.name,
          mimeType: file.type,
          base64: base64,
        }
        return fileData
      }),
    )
    const resp = await fetch("/api/media", {
      method: "POST",
      body: JSON.stringify(filePayloads),
    })
    if (!resp.ok) {
      throw new Error(`Failed to upload media: ${resp.statusText}`)
    }
    console.log(`Uploaded ${files.length} files.`)
    const json = await resp.json()
    return json
  }

  async deleteMedia(key: string) {
    const resp = await fetch(`/api/media?key=${key}`, {
      method: "DELETE",
    })
    if (!resp.ok) {
      throw new Error(`Failed to delete media: ${resp.statusText}`)
    }
  }

  private async fileToBase64(file: File) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get pure base64
        const base64Data = result.split(",")[1]
        resolve(base64Data)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
    return base64
  }

  async activate(profileId: string, verify_profile_exists: boolean, shouldOverride: boolean, sessionData: any) {
    const resp = await fetch("/api/operator/activation/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        profile_id: profileId,
        verify_profile_exists: verify_profile_exists,
        should_override: shouldOverride,
        session_data: sessionData,
      }),
    })
    const json = await resp.json()
    return json
  }

  async getActivationStatus(profileId: string) {
    const resp = await fetch(`/api/avatars/activation_status?profileId=${profileId}`)
    const json = (await resp.json()) as ActivationStatus
    return json
  }

  async assignWeb1Account(profileId: string): Promise<Web1Account> {
    logger.info(`Assigning WEB1 account for profile ${profileId}.`)
    const resp = await fetch("/api/activation/web1/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profileId }),
    })
    const json = await resp.json()
    return json.account
  }

  async submitOtp(profileId: string, otp: string) {
    const resp = await fetch("/api/activation/web1/submit_otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profile_id: profileId, otp: otp }),
    })
    const json = await resp.json()
    return json
  }

  async submitPassword(profileId: string, password: string) {
    const resp = await fetch("/api/activation/web1/submit_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profile_id: profileId, password }),
    })
    const json = await resp.json()
    return json
  }

  async submitCredentials(profileId: string, otp: string, password: string) {
    const resp = await fetch("/api/operator/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profileId, otp, password }),
    })
    const json = await resp.json()
    return json
  }
}
