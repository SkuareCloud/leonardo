import { z } from "zod"
import { zAvatarModelWithProxy } from "./avatars/zod.gen"
import { zProfileWorkerView } from "./operator/zod.gen"
import {
  CategoryRead,
  ChatRead,
  EchoMissionInput,
  MissionCreate,
  MissionExposure,
  MissionRead,
} from "./orchestrator"

export const MissionTypes = [
  "EchoMission",
  "AllocateProfilesGroupsMission",
  "PuppetShowMission",
  "FluffMission",
  "RandomDistributionMission",
  "MassDmMission",
  "ResolvePhoneMission",
] as const

export type MissionType = (typeof MissionTypes)[number]

export const zCombinedAvatar = z.object({
  profile_worker_view: zProfileWorkerView.optional(),
  avatar: zAvatarModelWithProxy.optional(),
})
export type CombinedAvatar = z.infer<typeof zCombinedAvatar>

export interface GeoData {
  iso_3166_1_alpha_2_code: string
  iso_3166_2_subdivision_code: string
  continent_code: string
  city: string
}

export interface ProxyData {
  ip_address?: string | null
  fqdn?: string | null
  status?: "success" | "failed"
}

export interface ChatWithCategory {
  chat: ChatRead
  category: CategoryRead
}

export interface CategoryWithChatCount {
  category: CategoryRead
  count: number
}

export type MissionInput<T> = MissionCreate & { payload: T }

// wrappers to enforce type safety
export type EffectiveEchoMissionInput = MissionInput<EchoMissionInput>

export interface MissionWithExposureStats {
  mission: MissionRead
  exposureStats: MissionExposure | null
}

export interface MissionWithExposureAndStats {
  mission: MissionRead
  exposureStats: MissionExposure | null
  statistics: MissionStatistics | null
}

export interface MediaItem {
  name: string
  key: string
  mimeType: string
  lastUpdated: Date
  size: number
  uri: string
  s3Uri: string
  metadata?: {
    actionId?: string
    runningIndex?: number
    scenarioId?: string
    displayName?: string
  }
}

export interface MessageWithMedia {
  text?: string
  media?: MediaItem
}

export interface MediaUploadPayload {
  name: string
  mimeType: string
  base64: string
}

export interface MissionStatistics {
  mission_type?: string | null
  description?: string | null
  created_at?: string | null
  status_code: string
  cnt: number
  planned: number
  scheduled: number
  pending: number
  in_process: number
  running: number
  success: number
  failed: number
  cancelled: number
}
