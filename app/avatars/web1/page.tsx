import { PageHeader } from "@/components/page-header"
import { Web1AccountsList } from "@/components/web1-accounts-list"
import { read_server_env } from "@lib/server-env"
import { ServiceClient } from "@lib/service-client"
import { notFound } from "next/navigation"

export default async function Page() {
    const isLocal = read_server_env().isLocal
    if (isLocal) {
        return notFound()
    }
    const accounts = await new ServiceClient().listWeb1Accounts()

    return (
        <>
            <PageHeader title="WEB1 Accounts" subtitle="Dashboard to view WEB1 accounts." />
            <Web1AccountsList accounts={accounts} />
        </>
    )
}
