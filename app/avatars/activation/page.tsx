import { PageHeader } from "@/components/page-header";
import { isProfileActive } from "@lib/profile-utils";
import { getQueryParams } from "@lib/server-utils";
import { ServiceClient } from "@lib/service-client";
import { AvatarsList } from "../avatars/avatars-list";

export default async function Page() {
    const queryParams = await getQueryParams();
    const running = queryParams.get("running") === "true";
    const profiles = await new ServiceClient().listAvatars({ running });
    const inactiveProfiles = profiles.filter(profile => !isProfileActive(profile))

    return (
        <>
            <PageHeader title="Activation" subtitle="Dashboard to manage activation - select a user to activate." />
            <AvatarsList profiles={inactiveProfiles} running={false} hideFilters hideViewSelector />
        </>
    );
}
