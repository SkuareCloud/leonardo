import { ApiService } from "@/app/api/lib/api_service"
import { PageHeader } from "@/components/page-header"
import { MediaCard } from "./media-card"

export default async function MediaPage() {
  const media = await new ApiService().getMedia()
  return (
    <div className="flex flex-col">
      <PageHeader title="Media" subtitle="Attachments to reuse across missions and scenarios" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-4">
        {media.map(item => (
          <MediaCard key={item.name} mediaItem={item} className="w-full" />
        ))}
      </div>
    </div>
  )
}
