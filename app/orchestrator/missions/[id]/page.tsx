import { ApiService } from "@/app/api/lib/api_service"
import { QueryClientWrapper } from "@/components/mission-view-wrapper"
import { AvatarRead } from "@lib/api/avatars"
import { MissionRead } from "@lib/api/orchestrator/types.gen"
import { notFound } from "next/navigation"
import { MissionView } from "./mission-view"

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params
    const apiService = new ApiService()
    let mission: MissionRead
    let avatars: AvatarRead[]
    try {
        ;[mission, avatars] = await Promise.all([
            apiService.getOrchestratorMission(id),
            apiService.getAvatars(),
        ])
    } catch (error) {
        return notFound()
    }

    return (
        <div className="flex w-full flex-col">
            <QueryClientWrapper>
                <MissionView mission={mission} avatars={avatars} />
            </QueryClientWrapper>
        </div>
    )
}
