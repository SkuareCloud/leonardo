import { z } from "zod"
import { zAvatarModelWithProxy } from "./avatars/zod.gen"
import { zProfileWorkerView } from "./operator/zod.gen"

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
