import { ApiService } from "@/app/api/lib/api_service";
import { ChatsList } from "./chats-list";
import { PageHeader } from "@/components/page-header";

export default async function Page() {
  const chats = await new ApiService().getOrchestratorChats();
  
  return (
    <>
      <PageHeader 
        title="Chats" 
        subtitle="Manage and monitor all chats in the system." 
      />
      <ChatsList chats={chats} />
    </>
  );
}
