import { AvatarModelWithProxy } from "./api/avatars/types.gen";

export function isProfileActive(avatar: AvatarModelWithProxy) {
    if (!avatar.data.social_network_accounts) {
        return false;
    }

    const socialAccounts = avatar.data.social_network_accounts;
    const hasActiveAccount = Object.values(socialAccounts).some(account => account?.active === true);
    const hasValidPhone = avatar.data.phone_number !== "0";

    return hasActiveAccount && hasValidPhone;
}

export function getSocialNetworkStatus(avatar: AvatarModelWithProxy) {
    if (!avatar.data.social_network_accounts) {
        return {};
    }

    const socialAccounts = avatar.data.social_network_accounts;
    const status: Record<string, boolean> = {};

    Object.entries(socialAccounts).forEach(([network, account]) => {
        if (account) {
            status[network] = account.active === true;
        }
    });

    return status;
}