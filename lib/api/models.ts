import { z } from "zod"
import { zAvatarModelWithProxy } from "./avatars/zod.gen"
import { zProfileWorkerView } from "./operator/zod.gen"
import { CategoryRead, ChatRead } from "./orchestrator"

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
