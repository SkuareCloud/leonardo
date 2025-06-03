import { CombinedAvatar } from "./api/models";

export function isProfileActive(profile: CombinedAvatar) {
    return profile.avatar?.data.social_network_accounts?.telegram?.active && profile?.avatar.data.phone_number !== "0";
}