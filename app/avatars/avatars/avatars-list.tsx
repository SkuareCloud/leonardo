"use client"

import TelegramIcon from "@/assets/telegram.svg"
import { DataTable } from "@/components/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { ProxyData } from "@lib/api/models"
import { getSocialNetworkStatus } from "@lib/profile-utils"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { MarsIcon, RefreshCcwIcon, VenusIcon } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AvatarDrawer } from "./avatar-drawer"
import { Proxy } from "./proxy"

export type ViewMode = "Grid" | "Table"

function Gender({ gender }: { gender: string }) {
  return (
    <span className="text-sm inline-flex flex-row items-center gap-2">
      {gender === "Female" ? <VenusIcon className="size-3 ml-auto" /> : <MarsIcon className="size-3 ml-auto" />}
      {gender}
    </span>
  )
}

export interface ProfileDataRow {
  original: AvatarModelWithProxy
  name: string
  city: string | undefined
  geocode: string | undefined
  gender: string
  age: string | undefined
  telegram: number | undefined
  profileId: string
  proxy: ProxyData | undefined
  phone: string | undefined
  socialNetworks: { [network: string]: boolean }
}

function avatarToRow(avatar: AvatarModelWithProxy): ProfileDataRow {
  return {
    original: avatar,
    name: avatar?.data.eliza_character?.name || "Unknown",
    city: avatar?.home_city,
    geocode: avatar?.home_iso_3166_1_alpha_2_code,
    gender: (avatar?.data.gender as string) || "Female",
    age: (avatar?.data.date_of_birth as string) || undefined,
    telegram: avatar?.data.social_network_accounts?.telegram?.active
      ? avatar?.data.social_network_accounts?.telegram.api?.api_id
      : undefined,
    profileId: avatar?.id || "",
    proxy: avatar?.proxy || null,
    phone: (avatar?.data.phone_number as string) || undefined,
    socialNetworks: getSocialNetworkStatus(avatar),
  }
}

const profileColumns: ColumnDef<ProfileDataRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    size: 150,
    cell: ({ row }) => {
      const profile = row.original
      return <span>{profile.name}</span>
    },
  },
  {
    accessorKey: "socialNetworks",
    header: "Social Networks",
    size: 200,
    sortingFn: (rowA, rowB) => {
      const statusA = getSocialNetworkStatus(rowA.original.original)
      const statusB = getSocialNetworkStatus(rowB.original.original)

      // Count active accounts
      const activeA = Object.values(statusA).filter(Boolean).length
      const activeB = Object.values(statusB).filter(Boolean).length

      // If both have active accounts, compare by count
      if (activeA > 0 && activeB > 0) {
        return activeB - activeA
      }

      // If only one has active accounts, it comes first
      if (activeA > 0) return -1
      if (activeB > 0) return 1

      // If neither has active accounts, compare by total accounts
      const totalA = Object.keys(statusA).length
      const totalB = Object.keys(statusB).length

      return totalB - totalA
    },
    cell: ({ row }) => {
      const profile = row.original
      const socialStatus = getSocialNetworkStatus(profile.original)

      return (
        <div className="flex flex-row gap-2">
          {Object.entries(socialStatus).map(([network, isActive]) => (
            <div key={network} className="flex items-center gap-1">
              {network === "telegram" && (
                <div className={cn("size-5", !isActive && "opacity-50 grayscale")}>
                  <Image src={TelegramIcon} alt="Telegram" width={20} height={20} className="size-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      )
    },
  },
  {
    accessorFn: row => row.geocode + "," + row.city,
    header: "Location",
    cell: ({ row }) => {
      const profile = row.original
      const geoCode = profile.geocode
      const flag = geoCode && getUnicodeFlagIcon(geoCode)
      return (
        <span>
          {flag && <span className="size-2 mr-2">{flag}</span>}
          {profile.geocode}, {profile.city}
        </span>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original
      return (
        <span>
          <Gender gender={profile.gender} />
        </span>
      )
    },
  },
  {
    accessorKey: "profileId",
    header: "Profile ID",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original
      return <span className="w-[50ch]">{profile.profileId}</span>
    },
  },
  {
    accessorKey: "proxy",
    header: "Proxy",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original
      return profile.proxy && <Proxy proxy={profile.proxy} />
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original
      return <span>{profile.phone || ""}</span>
    },
  },
]

export function AvatarsList({ avatars: initialAvatars }: { avatars: AvatarModelWithProxy[] }) {
  const [activeRow, setActiveRow] = useState<ProfileDataRow | undefined>(undefined)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const avatarDrawerRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  useEffect(() => {
    if (id) {
      const avatar = initialAvatars.find(avatar => avatar.id === id)
      if (avatar) {
        setActiveRow(avatarToRow(avatar))
      }
    }
  }, [id, initialAvatars])

  const refreshAvatar = async () => {
    // HACK: Slight delay to allow DB to catch up.
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (!activeRow) {
      throw new Error("No active row")
    }

    console.log(`Refreshing field for profile ${activeRow.original.id}...`)
    const avatar = await new ServiceBrowserClient().getProfile(activeRow.original.id)
    console.log("Refreshed profile: ", avatar)
    setActiveRow(avatarToRow(avatar))
    return avatar
  }

  const updateField = async (path: string, value: string) => {
    if (!activeRow) {
      return
    }
    console.log("Updating avatar...")
    await new ServiceBrowserClient().updateProfile(activeRow.original.id, path, value)
    await refreshAvatar()
  }

  return (
    <div
      className="flex flex-col w-full focus:outline-none"
      onKeyDown={e => {
        if (e.key === "Escape" && activeRow) {
          setActiveRow(undefined)
        }
      }}
      // Required for onKeyDown to work
      tabIndex={0}
    >
      <div
        className="flex flex-row w-full pr-16"
        onClick={e => {
          if (tableRef.current?.contains(e.target as Node) || avatarDrawerRef.current?.contains(e.target as Node)) {
            return
          }
          setActiveRow(undefined)
        }}
      >
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="pr-8">
            <div className="">
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
            <div className="flex flex-col gap-4 max-w-[1280px]" ref={tableRef}>
              <DataTable
                columns={profileColumns}
                onClickRow={row => {
                  console.log("Clicked row: ", row.original)
                  setActiveRow(row)
                }}
                data={initialAvatars.map(avatar => avatarToRow(avatar))}
                header={({ table }) => {
                  return (
                    <div className="flex flex-row gap-2">
                      <Input
                        placeholder="Filter by name..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                      />
                      <Input
                        placeholder="Filter by ID..."
                        value={(table.getColumn("profileId")?.getFilterValue() as string) ?? ""}
                        onChange={event => table.getColumn("profileId")?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                  )
                }}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className={cn("pl-8", activeRow && "min-w-[400px]", !activeRow && "max-w-24")}>
            <div ref={avatarDrawerRef}>
              {activeRow && (
                <AvatarDrawer
                  avatar={activeRow.original}
                  avatarsList={initialAvatars}
                  updateField={updateField}
                  refreshAvatar={refreshAvatar}
                />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
