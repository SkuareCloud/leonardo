import { ApiService } from "@/app/api/lib/api_service";
import { ProxiesList } from "@/app/avatars/proxies/proxies-list";
import { PageHeader } from "@/components/page-header";

export default async function Page() {
  const proxies = await new ApiService().getProxies();

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Proxies" subtitle="View and manage proxy servers." />
      </div>
      <ProxiesList proxies={proxies} />
    </div>
  );
}
