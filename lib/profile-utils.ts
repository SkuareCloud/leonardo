import { AvatarRead, SocialMediaAccountRead } from "./api/avatars/types.gen"

export function isProfileActive(avatar: AvatarRead) {
    const socialAccounts = avatar.social_media_accounts ?? []
    const hasActiveAccount = socialAccounts.some((account) => account?.active === true)
    const hasValidPhone = avatar.phone_number && avatar.phone_number !== "0"

    return hasActiveAccount && hasValidPhone
}

export function getSocialNetworkStatus(avatar: AvatarRead) {
    const socialAccounts = avatar.social_media_accounts ?? []
    const status: Record<string, boolean> = {}

    socialAccounts.forEach((account: SocialMediaAccountRead) => {
        status[account.platform] = account.active === true
    })

    return status
}

export function getAvatarDisplayName(avatar: AvatarRead) {
    const parts = [avatar.first_name, avatar.last_name].filter(Boolean)
    return parts.length > 0 ? parts.join(" ").trim() : "Unnamed Avatar"
}
