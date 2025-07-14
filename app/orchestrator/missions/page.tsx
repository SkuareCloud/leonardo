import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { MissionsList } from "./missions-list"

export default async function Page() {
  const missions = await new ApiService().getOrchestratorMissionsWithExposureAndStats()

  return (
    <div className="flex flex-col gap-8 w-full pr-92">
      <PageHeader title="Missions" subtitle="View and manage missions">
        <div className="flex flex-row items-center gap-6">
          <Link href="/orchestrator/mission-builder">
            <Button className="scale-100 cursor-pointer hover:scale-[102%] focus:scale-[98%]">
              <PlusIcon className="w-4 h-4" />
              Create new mission
            </Button>
          </Link>
        </div>
      </PageHeader>

      <MissionsList data={missions} />

      {/* TODO: add tab navigation when stats are added */}
      {/* <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="px-4">
            <ListIcon className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="stats" className="px-4">
            <ChartPieIcon className="w-4 h-4" />
            Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-8">
          <MissionsList data={missions} />
        </TabsContent>
      </Tabs> */}
    </div>
  )
}
