import { Label } from "@/components/ui/label"
import type { Proxy } from "@lib/api/avatars"

export function Proxy({ proxy }: { proxy: Proxy }) {
    return (
        <span>
            {`${proxy.ip_address || proxy.fqdn || ""}`}
            {proxy.status === "success" ? (
                <Label className="text-xs text-green-500">Active</Label>
            ) : (
                <Label className="text-xs text-red-500">Inactive</Label>
            )}
        </span>
    )
}
