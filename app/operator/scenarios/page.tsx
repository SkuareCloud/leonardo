import { PageHeader } from "@/components/page-header"
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen"
import { ServiceClient } from "@lib/service-client"
import { OperatorSlotDisplay } from "../components/operator-slot-display"
import { ScenarioFormModal } from "./scenario-form-modal"
import ScenariosList from "./scenarios"

export default async function Page() {
  const serviceClient = new ServiceClient()
  const avatars: AvatarModelWithProxy[] = await serviceClient.getAvatars()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Scenarios" subtitle="View and manage all scenarios">
          <div className="flex gap-2">
            <ScenarioFormModal avatars={avatars} />
          </div>
        </PageHeader>
      </div>


      <div className="mb-6 flex flex-row-reverse">
        <OperatorSlotDisplay />
      </div>
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <ScenariosList avatarsData={avatars} />
      </div>
    </div>
  )
}
