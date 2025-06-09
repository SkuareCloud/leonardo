import { PageHeader } from "@/components/page-header";
import { AvatarsList } from "./avatars-list";
import { ApiService } from "@/app/api/lib/api_service";
import { ServiceClient } from "@lib/service-client";

export default async function Page() {
  const serviceClient = new ServiceClient();
  const avatars = await serviceClient.getAvatars();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Profiles"
          subtitle="Inventory of all profiles in the system."
        />
      </div>
      <AvatarsList avatars={avatars} />
    </div>
  );
}
