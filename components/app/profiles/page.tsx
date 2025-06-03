import { ServiceClient } from "@lib/service-client";
import { ProfilesList } from "./profiles-list";
import { getQueryParams } from "@lib/server-utils";
import { PageHeader } from "@/components/page-header";

export default async function Page() {
  const queryParams = await getQueryParams();
  const running = queryParams.get("running") === "true";
  const profiles = await new ServiceClient().listAvatars({ running });

  return (
    <>
      <PageHeader
        title="Profiles"
        subtitle="Inventory of all profiles in the system."
      />
      <ProfilesList profiles={profiles} running={running} />
    </>
  );
}
