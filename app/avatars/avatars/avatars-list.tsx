"use client"

import TelegramIcon from "@/assets/telegram.svg"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AvatarModelWithProxy, Proxy } from "@lib/api/avatars"
import { logger } from "@lib/logger"
import { getSocialNetworkStatus } from "@lib/profile-utils"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { MarsIcon, VenusIcon } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AvatarDrawer } from "./avatar-drawer"
import { getBadgeClassNamesByActivationSource } from "./avatars-utils"
import { Proxy as ProxyComponent } from "./proxy"

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
  proxy: Proxy | null
  phone: string | undefined
  socialNetworks: { [network: string]: boolean }
  activationSource: string | undefined
}

function avatarToRow(avatar: AvatarModelWithProxy): ProfileDataRow {
  return {
    original: avatar,
    name: (avatar.data?.eliza_character as any)?.name || "Unknown",
    city: avatar?.home_city,
    geocode: avatar?.home_iso_3166_1_alpha_2_code,
    gender: (avatar?.data.gender as string) || "Female",
    age: (avatar?.data.date_of_birth as string) || undefined,
    telegram: (avatar?.data.social_network_accounts as any)?.telegram?.active
      ? (avatar?.data.social_network_accounts as any)?.telegram?.api?.api_id
      : undefined,
    profileId: avatar?.id || "",
    proxy: avatar?.proxy || null,
    phone: (avatar?.data.phone_number as string) || undefined,
    socialNetworks: getSocialNetworkStatus(avatar),
    activationSource: ((avatar?.data.social_network_accounts as any)?.telegram?.activation_source || "").toUpperCase(),
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
    accessorKey: "activationSource",
    header: "Activation Source",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original
      return (
        <Badge
          variant="outline"
          // style={{ backgroundColor: getBadgeColorByActivationSource(profile.activationSource || "", true) }}
          className={cn(
            "font-bold tracking-wide",
            getBadgeClassNamesByActivationSource(profile.activationSource || ""),
          )}
        >
          {profile.activationSource}
        </Badge>
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
      return profile.proxy && <ProxyComponent proxy={profile.proxy} />
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
  const [avatars, setAvatars] = useState<AvatarModelWithProxy[]>(initialAvatars)
  const tableRef = useRef<HTMLDivElement>(null)

  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const activationSources = new Set(
    avatars.map(
      avatar => (avatar.data.social_network_accounts as any)?.telegram?.activation_source?.toUpperCase() || "",
    ),
  )

  const activationSourcesArray = Array.from(activationSources)

  useEffect(() => {
    if (id) {
      const avatar = avatars.find(avatar => avatar.id === id)
      if (avatar) {
        setActiveRow(avatarToRow(avatar))
      }
    }
  }, [id, avatars])

  const refreshAvatar = async () => {
    // HACK: Slight delay to allow DB to catch up.
    await new Promise(resolve => setTimeout(resolve, 5000))
    if (!activeRow) {
      throw new Error("No active row")
    }

    logger.info(`Refreshing field for profile ${activeRow.original.id}...`)
    const avatar = await new ServiceBrowserClient().getProfile(activeRow.original.id)
    logger.info("Refreshed profile: ", avatar)

    // Update the avatar in the list
    setAvatars(prevAvatars => prevAvatars.map(av => (av.id === avatar.id ? avatar : av)))

    setActiveRow(avatarToRow(avatar))
    return avatar
  }

  const updateField = async (path: string, value: string) => {
    if (!activeRow) {
      return
    }
    logger.info("Updating avatar...")
    await new ServiceBrowserClient().updateProfile(activeRow.original.id, path, value)

    // Update the avatar in the list immediately
    setAvatars(prevAvatars =>
      prevAvatars.map(avatar => {
        if (avatar.id === activeRow.original.id) {
          const updatedAvatar = { ...avatar }
          const pathParts = path.split(".")
          let current = updatedAvatar.data as { [key: string]: unknown }

          // Navigate to the parent object
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) {
              current[pathParts[i]] = {}
            }
            current = current[pathParts[i]] as { [key: string]: unknown }
          }

          // Set the final value
          current[pathParts[pathParts.length - 1]] = value

          return updatedAvatar
        }
        return avatar
      }),
    )

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
      <div className="flex flex-row w-full">
        <div className="flex flex-col gap-4 max-w-[1280px] w-full" ref={tableRef}>
          <DataTable
            columns={profileColumns}
            onClickRow={row => {
              logger.info("Clicked row: ", row.original)
              setActiveRow(row)
            }}
            data={avatars.map(avatar => avatarToRow(avatar))}
            header={({ table }) => {
              return (
                <div className="flex flex-row gap-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Filter by name..."
                      value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                      onChange={event => table.getColumn("name")?.setFilterValue(event.target.value)}
                      className="w-[30ch]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="profileId">Profile ID</Label>
                    <Input
                      id="profileId"
                      placeholder="Filter by ID..."
                      value={(table.getColumn("profileId")?.getFilterValue() as string) ?? ""}
                      onChange={event => table.getColumn("profileId")?.setFilterValue(event.target.value)}
                      className="w-[30ch]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="activationSource">Activation Source</Label>
                    <Select
                      onValueChange={value => {
                        if (value === "all") {
                          table.getColumn("activationSource")?.setFilterValue(undefined)
                        } else {
                          table.getColumn("activationSource")?.setFilterValue(value)
                        }
                      }}
                      defaultValue={table.getColumn("activationSource")?.getFilterValue() as string}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by activation source..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {activationSourcesArray.map(source => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </div>
      
      {/* Drawer Overlay */}
      {activeRow && (
        <AvatarDrawer
          avatar={activeRow.original}
          avatarsList={avatars}
          updateField={updateField}
          refreshAvatar={refreshAvatar}
          onClose={() => setActiveRow(undefined)}
        />
      )}
    </div>
  )
}
