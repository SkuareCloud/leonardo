import { QueryClientWrapper } from "@/components/mission-view-wrapper"
import { PageHeader } from "@/components/page-header"
import { OperatorSlotDisplay } from "../components/operator-slot-display"
import { CharactersList } from "./characters-list"
import { StopAllButton } from "./stop-all-button"

export default async function Page() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Operator Status" subtitle="View and manage characters running in this operator." />
        <div className="flex gap-2">
          <StopAllButton />
        </div>
      </div>
      <div className="mb-6 flex flex-row-reverse">
        <OperatorSlotDisplay />
      </div>
      <QueryClientWrapper>
        <CharactersList />
      </QueryClientWrapper>
    </div>
  )
}
