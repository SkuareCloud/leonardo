import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { CharacterRead, ChatRead } from "@lib/api/orchestrator"
import { notFound } from "next/navigation"
import { ChatView } from "./chat-view"

export default async function Page({ params }: { params: { id: string } }) {
  const apiService = new ApiService()
  let chat: ChatRead
  let characters: CharacterRead[]
  try {
    ;[chat, characters] = await Promise.all([
      apiService.getOrchestratorChat(params.id),
      apiService.getOrchestratorChatCharacters(params.id),
    ])
  } catch (error) {
    return notFound()
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={`Chat ${chat.title || chat.username}`} subtitle="View and manage a chat." />
      <div className="flex flex-col pt-6">
        <ChatView chat={chat} characters={characters} />
      </div>
    </div>
  )
}
