import { Label } from "@/components/ui/label"
import { ProxyData } from "@lib/api/models"

export function Proxy({ proxy }: { proxy: ProxyData }) {
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
