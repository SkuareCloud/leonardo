import { z } from "zod"
import { zProfileWorkerView } from "./api/operator/zod.gen"
import { zAvatarModelWithProxy } from "./api/avatars/zod.gen"

export const ElizaCharacter = z.object({
    name: z.string(),
})

export const Addresses = z.object({
    home: z.object({
        city: z.string(),
        continent_code: z.string().optional(),
        iso_3166_1_alpha_2_code: z.string(),
    })
})

export const SocialNetworkAccounts = z.object({
    telegram: z.object({
        api: z.object({
            api_id: z.number(),
        }).optional(),
        active: z.boolean()
    })
})

export const zAvatarDataPayload = z.object({
    eliza_character: ElizaCharacter.optional(),
    addresses: Addresses.optional(),
    gender: z.string().optional(),
    date_of_birth: z.string().optional(),
    social_network_accounts: SocialNetworkAccounts.optional(),
})

export const zCombinedAvatar = z.object({
    profile_worker_view: zProfileWorkerView.optional(),
    avatar: zAvatarModelWithProxy
})
export type CombinedAvatar = z.infer<typeof zCombinedAvatar>;