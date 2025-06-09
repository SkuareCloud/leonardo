import { ApiService } from "@/app/api/lib/api_service";
import { PageHeader } from "@/components/page-header";
import { CharactersList } from "./characters-list";
import { StopAllButton } from "./stop-all-button";

export default async function Page() {
  const characters = await new ApiService().getOperatorCharacters();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Operator Status"
          subtitle="View and manage characters running in this operator."
        />
        <div className="flex gap-2">
          <StopAllButton />
        </div>
      </div>
      <CharactersList characters={characters} />
    </div>
  );
}
