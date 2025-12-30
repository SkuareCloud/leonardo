import { Label } from "@/components/ui/label"
import type { ProxyRead } from "@lib/api/avatars"

export function Proxy({ proxy }: { proxy: ProxyRead }) {
    const isActive = proxy.status === "active"
    return (
        <span>
            {proxy.ip_address || proxy.fqdn || ""}
            {isActive ? (
                <Label className="text-xs text-green-500">Active</Label>
            ) : (
                <Label className="text-xs text-red-500">Inactive</Label>
            )}
        </span>
    )
}
