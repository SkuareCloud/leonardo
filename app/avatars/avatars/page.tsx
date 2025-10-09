import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { ServiceClient } from "@lib/service-client"
import { AvatarsView } from "./avatars-view"

export default async function Page() {
    const serviceClient = new ServiceClient()
    const apiService = new ApiService()

    const [avatars, allCategories] = await Promise.all([
        serviceClient.getAvatars(),
        apiService.getOrchestratorCategories(),
    ])

    return (
        <div className="container py-6">
            <div className="mb-6 flex items-center justify-between">
                <PageHeader title="Avatars" subtitle="Inventory of all avatars in the system." />
            </div>
            <AvatarsView avatars={avatars} allCategories={allCategories} />
        </div>
    )
}
