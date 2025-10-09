"use client"

import TelegramIcon from "@/assets/telegram.svg"
import { CreateCategoryDialog } from "@/components/create-category-dialog"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { AvatarModelWithProxy, Proxy } from "@lib/api/avatars"
import { CategoryRead } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { getSocialNetworkStatus } from "@lib/profile-utils"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { MarsIcon, VenusIcon } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { CategorySelector } from "../../orchestrator/mission-builder/category-selector"
import { AvatarDrawer } from "./avatar-drawer"
import { getBadgeClassNamesByActivationSource } from "./avatars-utils"
import { Proxy as ProxyComponent } from "./proxy"

export type ViewMode = "Grid" | "Table"

function Gender({ gender }: { gender: string }) {
    return (
        <span className="inline-flex flex-row items-center gap-2 text-sm">
            {gender === "Female" ? (
                <VenusIcon className="ml-auto size-3" />
            ) : (
                <MarsIcon className="ml-auto size-3" />
            )}
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
    categories?: CategoryRead[]
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
        activationSource: (
            (avatar?.data.social_network_accounts as any)?.telegram?.activation_source || ""
        ).toUpperCase(),
        categories: [],
    }
}

const createProfileColumns = (
    categories: CategoryRead[],
    onUpdateAvatarCategories: (avatarId: string, categories: CategoryRead[]) => void,
    socialNetworksArray: string[],
): ColumnDef<ProfileDataRow>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
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
        filterFn: (row, columnId, filterValue) => {
            const socialNetworks = row.original.socialNetworks

            // Handle specific network filters
            if (filterValue === "telegram-active") {
                return socialNetworks.telegram === true
            }
            if (filterValue === "telegram-inactive") {
                return socialNetworks.telegram !== true
            }

            // Handle general active/inactive filters
            if (filterValue === "active") {
                return Object.values(socialNetworks).some(Boolean)
            }
            if (filterValue === "inactive") {
                return !Object.values(socialNetworks).some(Boolean)
            }

            // Handle specific network name filters
            if (socialNetworksArray.includes(filterValue)) {
                return socialNetworks[filterValue] === true
            }

            return true
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
                                    <Image
                                        src={TelegramIcon}
                                        alt="Telegram"
                                        width={20}
                                        height={20}
                                        className="size-5"
                                    />
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
        accessorKey: "categories",
        header: "Categories",
        size: 300,
        sortingFn: (rowA, rowB) => {
            const categoriesA = rowA.original.categories
            const categoriesB = rowB.original.categories
            if (!categoriesA && !categoriesB) {
                return 0
            }
            if (!categoriesA) {
                return 1
            }
            if (!categoriesB) {
                return -1
            }
            return categoriesA.length - categoriesB.length
        },
        cell: ({ row }) => {
            const profile = row.original
            const avatarCategories = profile.categories || []

            return (
                <div
                    className="py-2"
                    onClick={(e) => {
                        // Prevent row click when interacting with category selector
                        e.stopPropagation()
                    }}
                >
                    <CategorySelector
                        existingCategories={avatarCategories}
                        categories={categories}
                        onChangeValue={async (
                            selectedCategories: { id: string; label: string }[],
                        ) => {
                            const newCategories = selectedCategories.filter(
                                (c: { id: string; label: string }) =>
                                    !avatarCategories.some((cat: CategoryRead) => cat.id === c.id),
                            )
                            const removedCategories = avatarCategories.filter(
                                (c: CategoryRead) =>
                                    !selectedCategories.some(
                                        (cat: { id: string; label: string }) => cat.id === c.id,
                                    ),
                            )

                            try {
                                // Add new categories
                                for (const newCategory of newCategories) {
                                    await fetch(
                                        `/api/orchestrator/characters?character_id=${profile.profileId}&operation=add_category`,
                                        {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ categoryId: newCategory.id }),
                                        },
                                    )
                                }

                                // Remove categories
                                for (const removedCategory of removedCategories) {
                                    await fetch(
                                        `/api/orchestrator/characters?character_id=${profile.profileId}&operation=remove_category`,
                                        {
                                            method: "DELETE",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                categoryId: removedCategory.id,
                                            }),
                                        },
                                    )
                                }

                                // Update local state
                                const updatedCategories = categories.filter((cat) =>
                                    selectedCategories.some((selected) => selected.id === cat.id),
                                )
                                onUpdateAvatarCategories(profile.profileId, updatedCategories)

                                toast.success(
                                    `Updated categories for avatar '${profile.name}': ${selectedCategories.map((c) => c.label).join(", ")}`,
                                )
                            } catch (error) {
                                console.error("Category update error:", error)
                                toast.error(
                                    `Failed to update categories: ${error instanceof Error ? error.message : "Unknown error"}`,
                                )
                            }
                        }}
                    />
                </div>
            )
        },
    },
    {
        accessorFn: (row) => row.geocode + "," + row.city,
        header: "Location",
        cell: ({ row }) => {
            const profile = row.original
            const geoCode = profile.geocode
            const flag = geoCode && getUnicodeFlagIcon(geoCode)
            return (
                <span>
                    {flag && <span className="mr-2 size-2">{flag}</span>}
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

export function AvatarsList({
    avatars: initialAvatars,
    allCategories,
}: {
    avatars: AvatarModelWithProxy[]
    allCategories: CategoryRead[]
}) {
    const [activeRow, setActiveRow] = useState<ProfileDataRow | undefined>(undefined)
    const [avatars, setAvatars] = useState<AvatarModelWithProxy[]>(initialAvatars)
    const [profilesData, setProfilesData] = useState<ProfileDataRow[]>([])
    const [categories, setCategories] = useState<CategoryRead[]>(allCategories)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const tableRef = useRef<HTMLDivElement>(null)

    const searchParams = useSearchParams()
    const id = searchParams.get("id")

    const activationSources = new Set(
        avatars.map(
            (avatar) =>
                (
                    avatar.data.social_network_accounts as any
                )?.telegram?.activation_source?.toUpperCase() || "",
        ),
    )

    const activationSourcesArray = Array.from(activationSources)

    const socialNetworks = new Set<string>()
    avatars.forEach((avatar) => {
        const socialStatus = getSocialNetworkStatus(avatar)
        Object.keys(socialStatus).forEach((network) => socialNetworks.add(network))
    })
    const socialNetworksArray = Array.from(socialNetworks)

    useEffect(() => {
        if (id) {
            const avatar = avatars.find((avatar) => avatar.id === id)
            if (avatar) {
                setActiveRow(avatarToRow(avatar))
            }
        }
    }, [id, avatars])

    const handleCategoryCreated = (newCategory: CategoryRead) => {
        setCategories((prev) => [...prev, newCategory])
        toast.success(`Created category: ${newCategory.name}`)
    }

    const handleCategoryDeleted = (categoryId: string) => {
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
        // If the deleted category was the active filter, clear it
        if (activeCategory) {
            const deletedCategory = categories.find((cat) => cat.id === categoryId)
            if (deletedCategory && deletedCategory.name === activeCategory) {
                setActiveCategory(null)
            }
        }
        toast.success(`Category deleted successfully`)
    }

    const handleUpdateAvatarCategories = (avatarId: string, newCategories: CategoryRead[]) => {
        setProfilesData((prev) =>
            prev.map((profile) =>
                profile.profileId === avatarId
                    ? { ...profile, categories: newCategories }
                    : profile,
            ),
        )
    }

    // Load avatar categories
    const loadAvatarCategories = async () => {
        try {
            const avatarsWithCategories = await Promise.all(
                avatars.map(async (avatar) => {
                    try {
                        const response = await fetch(
                            `/api/orchestrator/characters?character_id=${avatar.id}&operation=categories`,
                        )
                        const categories = await response.json()
                        return { ...avatarToRow(avatar), categories }
                    } catch (error) {
                        console.error(`Failed to load categories for avatar ${avatar.id}:`, error)
                        return { ...avatarToRow(avatar), categories: [] }
                    }
                }),
            )
            setProfilesData(avatarsWithCategories)
        } catch (error) {
            console.error("Failed to load avatar categories:", error)
        }
    }

    // Load categories on mount
    useEffect(() => {
        loadAvatarCategories()
    }, [avatars])

    const refreshAvatar = async () => {
        // HACK: Slight delay to allow DB to catch up.
        await new Promise((resolve) => setTimeout(resolve, 5000))
        if (!activeRow) {
            throw new Error("No active row")
        }

        logger.info(`Refreshing field for profile ${activeRow.original.id}...`)
        const avatar = await new ServiceBrowserClient().getProfile(activeRow.original.id)
        logger.info("Refreshed profile: ", avatar)

        // Update the avatar in the list
        setAvatars((prevAvatars) => prevAvatars.map((av) => (av.id === avatar.id ? avatar : av)))

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
        setAvatars((prevAvatars) =>
            prevAvatars.map((avatar) => {
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

    const profileColumns = createProfileColumns(
        categories,
        handleUpdateAvatarCategories,
        socialNetworksArray,
    )

    return (
        <div
            className="flex w-full flex-col focus:outline-none"
            onKeyDown={(e) => {
                if (e.key === "Escape" && activeRow) {
                    setActiveRow(undefined)
                }
            }}
            // Required for onKeyDown to work
            tabIndex={0}
        >
            <div className="mb-4 flex flex-row items-center justify-between">
                <div className="flex flex-row gap-2">
                    <Label>Category</Label>
                    <Select
                        value={activeCategory ?? undefined}
                        onValueChange={(value) => {
                            if (value === "All") {
                                setActiveCategory(null)
                            } else {
                                setActiveCategory(value)
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.name} value={category.name ?? ""}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <CreateCategoryDialog
                        categories={categories}
                        onCategoryCreated={handleCategoryCreated}
                        onCategoryDeleted={handleCategoryDeleted}
                    />
                </div>
            </div>

            <div className="flex w-full flex-row">
                <div className="flex w-full max-w-[1280px] flex-col gap-4" ref={tableRef}>
                    <DataTable
                        columns={profileColumns}
                        onClickRow={(row) => {
                            logger.info("Clicked row: ", row.original)
                            setActiveRow(row)
                        }}
                        data={profilesData.filter((profile) => {
                            if (!activeCategory) {
                                return true
                            }
                            if (!profile.categories) {
                                return false
                            }
                            return profile.categories.some(
                                (category) => category.name === activeCategory,
                            )
                        })}
                        header={({ table }) => {
                            return (
                                <div className="flex flex-row gap-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Filter by name..."
                                            value={
                                                (table
                                                    .getColumn("name")
                                                    ?.getFilterValue() as string) ?? ""
                                            }
                                            onChange={(event) =>
                                                table
                                                    .getColumn("name")
                                                    ?.setFilterValue(event.target.value)
                                            }
                                            className="w-[30ch]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="profileId">Profile ID</Label>
                                        <Input
                                            id="profileId"
                                            placeholder="Filter by ID..."
                                            value={
                                                (table
                                                    .getColumn("profileId")
                                                    ?.getFilterValue() as string) ?? ""
                                            }
                                            onChange={(event) =>
                                                table
                                                    .getColumn("profileId")
                                                    ?.setFilterValue(event.target.value)
                                            }
                                            className="w-[30ch]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="activationSource">Activation Source</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                if (value === "all") {
                                                    table
                                                        .getColumn("activationSource")
                                                        ?.setFilterValue(undefined)
                                                } else {
                                                    table
                                                        .getColumn("activationSource")
                                                        ?.setFilterValue(value)
                                                }
                                            }}
                                            defaultValue={
                                                table
                                                    .getColumn("activationSource")
                                                    ?.getFilterValue() as string
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by activation source..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                {activationSourcesArray.map((source) => (
                                                    <SelectItem key={source} value={source}>
                                                        {source}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="socialNetworks">Social Networks</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                if (value === "all") {
                                                    table
                                                        .getColumn("socialNetworks")
                                                        ?.setFilterValue(undefined)
                                                } else {
                                                    table
                                                        .getColumn("socialNetworks")
                                                        ?.setFilterValue(value)
                                                }
                                            }}
                                            defaultValue={
                                                table
                                                    .getColumn("socialNetworks")
                                                    ?.getFilterValue() as string
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by social networks..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All</SelectItem>
                                                {socialNetworksArray.map((network) => (
                                                    <SelectItem
                                                        key={`${network}-active`}
                                                        value={network}
                                                    >
                                                        {network}
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
