import { AvatarModelWithProxy } from "./api/avatars"
import { CombinedAvatar, MissionStatistics } from "./api/models"
import { ScenarioWithResult } from "./api/operator"
import { MissionCreate, MissionRead, ScenarioRead } from "./api/orchestrator"
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

  async getOperatorScenarios(): Promise<{ [key: string]: ScenarioWithResult }> {
    const resp = await fetch("/api/operator/scenario")
    const json = (await resp.json()) as { [key: string]: ScenarioWithResult }
    return json
  }

  async getOrchestratorMission(missionId: string): Promise<MissionRead> {
    const resp = await fetch(`/api/orchestrator/mission?id=${missionId}`)
    const json = (await resp.json()) as MissionRead
    return json
  }

  async getOrchestratorMissions(): Promise<MissionRead[]> {
    const resp = await fetch("/api/orchestrator/missions")
    const json = (await resp.json()) as MissionRead[]
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

  async activate(profileId: string) {
    const resp = await fetch("/api/avatars/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ profile_id: profileId }),
    })
    const json = await resp.json()
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
}
