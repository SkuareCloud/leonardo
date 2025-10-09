import { ApiService } from "@/app/api/lib/api_service"
import { MediaView } from "./media-view"

export default async function MediaPage() {
    const media = await new ApiService().getMedia()
    return (
        <div className="flex flex-col">
            <MediaView media={media} />
        </div>
    )
}
