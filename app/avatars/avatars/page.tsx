import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { logger } from "@lib/logger"
import { ServiceClient } from "@lib/service-client"
import { AvatarsView } from "./avatars-view"

export default async function Page() {
    const apiService = new ApiService()

    // Only fetch categories on server - avatars will be fetched client-side with pagination
    const allCategories = await apiService.getOrchestratorCategories()

    return (
        <div className="container py-6">
            <div className="mb-6 flex items-center justify-between">
                <PageHeader
                    title="Avatars"
                    subtitle="Inventory of all avatars in the system."
                />
            </div>
            <AvatarsView avatars={[]} allCategories={allCategories} />
        </div>
    )
}
