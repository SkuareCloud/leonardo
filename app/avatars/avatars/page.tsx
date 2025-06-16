import { PageHeader } from "@/components/page-header"
import { ServiceClient } from "@lib/service-client"
import { AvatarsView } from "./avatars-view"

export default async function Page() {
  const serviceClient = new ServiceClient()
  const avatars = await serviceClient.getAvatars()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Profiles" subtitle="Inventory of all profiles in the system." />
      </div>
      <AvatarsView avatars={avatars} />
    </div>
  )
}
