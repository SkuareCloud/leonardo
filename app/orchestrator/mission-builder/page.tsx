import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { MissionBuilder } from "./mission-builder"

export default async function Page() {
  const [allScenarios, allProfiles] = await Promise.all([
    new ApiService().getOperatorScenarios(),
    new ApiService().getAvatars(),
  ])

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Mission Builder" subtitle="Create a new mission" />
      <MissionBuilder scenarios={allScenarios} profiles={allProfiles} />
    </div>
  )
}
