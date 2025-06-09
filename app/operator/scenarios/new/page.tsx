import { PageHeader } from "@/components/page-header";
import { ScenarioForm } from "./scenario-form";
import { ServiceClient } from "@lib/service-client";
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen";
export default async function NewScenarioPage() {
  const serviceClient = new ServiceClient();
  const allAvatars: AvatarModelWithProxy[] = await serviceClient.getAvatars();
  const activeAvatars = allAvatars.filter(
    (avatar) => avatar.data.social_network_accounts?.telegram?.active
  );

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Create New Scenario"
        subtitle="Configure a new scenario with multiple actions"
      />
      <ScenarioForm avatars={activeAvatars} />
    </div>
  );
}
