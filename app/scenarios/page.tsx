import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { client as operatorClient } from "@lib/api/operator/client.gen";
import { getScenariosScenarioScenarioGet } from "@lib/api/operator/sdk.gen";
import Scenarios from "./scenarios";
import { ServiceClient } from "@lib/service-client";
import { CombinedAvatar } from "@lib/api/models";
import { StopAllButton } from "./stop-all-button";

export default async function Page() {
  const scenarios = await getScenariosScenarioScenarioGet({
    client: operatorClient,
  });
  const serviceClient = new ServiceClient();
  const avatars: CombinedAvatar[] = await serviceClient.listAvatars({
    running: false,
  });

  if (scenarios.error || !scenarios.data) {
    throw new Error(
      `Failed to fetch scenarios: ${JSON.stringify(scenarios.error)}`
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Scenarios"
          subtitle="View and manage all scenarios"
        />
        <div className="flex gap-2">
          <StopAllButton />
          <Link href="/scenarios/new">
            <Button>Create New Scenario</Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <Scenarios scenarios={scenarios.data} avatarsData={avatars} />
      </div>
    </div>
  );
}
