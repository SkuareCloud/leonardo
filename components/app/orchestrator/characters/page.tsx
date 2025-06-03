import { ApiService } from "@/app/api/lib/api_service";
import { CharactersList } from "./characters-list";
import { PageHeader } from "@/components/page-header";

export default async function Page() {
  const characters = await new ApiService().getOrchestratorCharacters();
  
  return (
    <>
      <PageHeader 
        title="Characters" 
        subtitle="Manage and monitor all characters in the system." 
      />
      <CharactersList characters={characters} />
    </>
  );
}
