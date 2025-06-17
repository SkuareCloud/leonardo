import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ServiceClient } from "@lib/service-client"
import Link from "next/link"
import ScenariosList from "./scenarios"

export default async function Page() {
  const serviceClient = new ServiceClient()
  const scenarios = await serviceClient.getOperatorScenarios()
  const avatars: AvatarModelWithProxy[] = await serviceClient.getAvatars()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Scenarios" subtitle="View and manage all scenarios" />
        <div className="flex gap-2">
          <Link href="/operator/scenarios/new">
            <Button>Create New Scenario</Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <ScenariosList scenarios={scenarios} avatarsData={avatars} />
      </div>
    </div>
  )
}
