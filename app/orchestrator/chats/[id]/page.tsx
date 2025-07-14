import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { CategoryRead, CharacterRead, ChatRead } from "@lib/api/orchestrator"
import { notFound } from "next/navigation"
import { ChatView } from "./chat-view"

export default async function Page({ params }: { params: { id: string } }) {
  const { id: chatId } = await params
  const apiService = new ApiService()
  let chat: ChatRead
  let characters: CharacterRead[]
  let allCategories: CategoryRead[]
  let chatCategories: CategoryRead[]
  try {
    ;[chat, characters, allCategories, chatCategories] = await Promise.all([
      apiService.getOrchestratorChat(chatId),
      apiService.getOrchestratorChatCharacters(chatId),
      apiService.getOrchestratorCategories(),
      apiService.getOrchestratorChatCategories(chatId),
    ])
  } catch (error) {
    return notFound()
  }

  return (
    <div className="flex flex-col">
      <PageHeader title={`Chat ${chat.title || chat.username}`} subtitle="View and manage a chat." />
      <div className="flex flex-col pt-6">
        <ChatView chat={chat} chatCategories={chatCategories} allCategories={allCategories} characters={characters} />
      </div>
    </div>
  )
}
