import { z } from "zod"
import { zAvatarModelWithProxy } from "./avatars/zod.gen"
import { zProfileWorkerView } from "./operator/zod.gen"
import { CategoryRead, ChatRead, EchoMissionInput, MissionCreate } from "./orchestrator"

export const MissionTypes = [
  "EchoMission",
  "AllocateProfilesGroupsMission",
  "PuppetShowMission",
  "FluffMission",
  "RandomDistributionMission",
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

export interface MediaItem {
  name: string
  key: string
  mimeType: string
  lastUpdated: Date
  size: number
  uri: string
  s3Uri: string
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
  id: string
  mission_type: MissionType
  description: string
  created_at: string
  status_code: string
  cnt: number
  SCHEDULED: number
  PENDING: number
  IN_PROCESS: number
  RUNNING: number
  SUCCESS: number
  FAILED: number
  CANCELLED: number
}
