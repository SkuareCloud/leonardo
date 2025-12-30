import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { AvatarRead } from "@lib/api/avatars"
import { CategoryRead, CharacterRead, ChatRead } from "@lib/api/orchestrator"
import { ServiceClient } from "@lib/service-client"
import { notFound } from "next/navigation"
import { ChatView } from "./chat-view"

export default async function Page({ params }: { params: { id: string } }) {
    const { id: chatId } = await params
    const apiService = new ApiService()
    const serviceClient = new ServiceClient()
    let chat: ChatRead
    let allAvatars: AvatarRead[]
    let characters: CharacterRead[]
    let allCategories: CategoryRead[]
    let chatCategories: CategoryRead[]
    try {
        ;[chat, allAvatars, characters, allCategories, chatCategories] = await Promise.all([
            apiService.getOrchestratorChat(chatId),
            serviceClient.getAvatars(),
            apiService.getOrchestratorChatCharacters(chatId),
            apiService.getOrchestratorCategories(),
            apiService.getOrchestratorChatCategories(chatId),
        ])
    } catch (error) {
        return notFound()
    }

    // Filter avatars to only include those that are members of this chat
    // avatar_id == character_id == profile_id
    const characterIds = characters.map((char) => char.id)
    const chatMemberAvatars = allAvatars.filter((avatar) => characterIds.includes(avatar.id))

    return (
        <div className="flex flex-col">
            <PageHeader
                title={`Chat ${chat.title || chat.username}`}
                subtitle="View and manage a chat."
            />
            <div className="flex flex-col pt-6">
                <ChatView
                    chat={chat}
                    chatCategories={chatCategories}
                    allCategories={allCategories}
                    avatars={chatMemberAvatars}
                />
            </div>
        </div>
    )
}
