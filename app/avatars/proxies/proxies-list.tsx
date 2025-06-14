"use client"

import { DataTable } from "@/components/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Proxy } from "@lib/api/avatars/types.gen"
import { ColumnDef } from "@tanstack/react-table"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { CirclePlay, CircleStop, RefreshCcwIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const proxyColumns: ColumnDef<Proxy>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 150,
    cell: ({ row }) => {
      const proxy = row.original
      return <span>{proxy.name}</span>
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 100,
    cell: ({ row }) => {
      const proxy = row.original
      return <span className="uppercase">{proxy.type}</span>
    },
  },
  {
    accessorKey: "ip_address",
    header: "Address",
    size: 200,
    cell: ({ row }) => {
      const proxy = row.original
      return <span>{proxy.ip_address || proxy.fqdn || ""}</span>
    },
  },
  {
    accessorKey: "port",
    header: "Port",
    size: 80,
    cell: ({ row }) => {
      const proxy = row.original
      return <span>{proxy.port}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const proxy = row.original
      return (
        <Badge
          className={cn(
            !proxy.status_is_success && "bg-red-50 text-red-800",
            proxy.status_is_success && "bg-green-100 text-green-800",
          )}
        >
          <div className="inline-flex flex-row items-center uppercase text-xs">
            {proxy.status_is_success ? "Active" : "Inactive"}
          </div>
        </Badge>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    size: 150,
    cell: ({ row }) => {
      const proxy = row.original
      const geoCode = proxy.iso_3166_1_alpha_2_code
      const flag = geoCode && getUnicodeFlagIcon(geoCode)
      return (
        <span>
          {flag && <span className="size-2 mr-2">{flag}</span>}
          {proxy.city}, {proxy.iso_3166_1_alpha_2_code}
        </span>
      )
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    size: 150,
    cell: ({ row }) => {
      const proxy = row.original

      const handlePingProxy = async () => {
        try {
          const response = await fetch(`/api/avatars/proxies/${proxy.id}/ping`, {
            method: "PUT",
          })

          if (response.ok) {
            toast.success("Proxy pinged", {
              description: "The proxy has been successfully pinged.",
            })
          } else {
            const data = await response.json()
            throw new Error(data.error || "Failed to ping proxy")
          }
        } catch (error) {
          toast.error("Failed to ping proxy", {
            description: error instanceof Error ? error.message : "An unexpected error occurred",
          })
        }
      }

      const handleUpdateStatus = async (enabled: boolean) => {
        try {
          const response = await fetch(`/api/proxies/${proxy.id}/status?enabled=${enabled}`, {
            method: "PUT",
          })

          if (response.ok) {
            toast.success(`Proxy ${enabled ? "enabled" : "disabled"}`, {
              description: `The proxy has been successfully ${enabled ? "enabled" : "disabled"}.`,
            })
          } else {
            const data = await response.json()
            throw new Error(data.error || `Failed to ${enabled ? "enable" : "disable"} proxy`)
          }
        } catch (error) {
          toast.error(`Failed to ${enabled ? "enable" : "disable"} proxy`, {
            description: error instanceof Error ? error.message : "An unexpected error occurred",
          })
        }
      }

      return (
        <div className="flex flex-row space-x-3">
          <Button className="cursor-pointer hover:bg-amber-200" variant="outline" size="xs" onClick={handlePingProxy}>
            <RefreshCcwIcon className="size-3" />
            Ping
          </Button>
          {proxy.status_is_success ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="cursor-pointer hover:bg-amber-200" variant="destructive" size="xs">
                  <CircleStop className="size-3" />
                  Disable
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Proxy</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to disable this proxy? This will prevent it from being used by any profiles.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleUpdateStatus(false)}>Disable Proxy</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="cursor-pointer hover:bg-green-50" variant="outline" size="xs">
                  <CirclePlay className="size-3" />
                  Enable
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Enable Proxy</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to enable this proxy? It will be available for use by profiles.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleUpdateStatus(true)}>Enable Proxy</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )
    },
  },
]

export function ProxiesList({ proxies: initialProxies }: { proxies: Proxy[] }) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full pr-16">
        <div className="mb-12 flex flex-row items-center gap-6 h-4 w-full">
          <Button
            variant="link"
            className="bg-gray-100 p-1 rounded-full hover:bg-gray-200"
            onClick={async () => {
              setIsRefreshing(true)
              // TODO: Implement refresh functionality
              setIsRefreshing(false)
            }}
          >
            <RefreshCcwIcon
              className={cn("size-3 text-gray-500", isRefreshing && "animate-[spin_1s_linear_reverse_infinite]")}
            />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <DataTable
          columns={proxyColumns}
          data={initialProxies}
          header={({ table }) => {
            return (
              <div>
                <Input
                  placeholder="Filter by name..."
                  value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                  onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
                  className="max-w-sm"
                />
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
