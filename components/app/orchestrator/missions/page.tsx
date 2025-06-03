import { ApiService } from "@/app/api/lib/api_service";
import { MissionsList } from "./missions-list";
import { PageHeader } from "@/components/page-header";

export default async function Page() {
  const missions = await ApiService.getOrchestratorMissions();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Missions"
        subtitle="View and manage all missions in the system"
      />
      <MissionsList missions={missions} />
    </div>
  );
}
