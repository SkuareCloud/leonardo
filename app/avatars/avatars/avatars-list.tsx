"use client"

import TelegramIcon from "@/assets/telegram.svg"
import { CreateCategoryDialog } from "@/components/create-category-dialog"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { AvatarRead, ProxyRead } from "@lib/api/avatars"
import { CategoryRead } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { getAvatarDisplayName, getSocialNetworkStatus } from "@lib/profile-utils"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef, PaginationState } from "@tanstack/react-table"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { Loader2, MarsIcon, VenusIcon } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { CategorySelector } from "../../orchestrator/mission-builder/category-selector"
import { AvatarDrawer } from "./avatar-drawer"
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
    original: AvatarRead
    name: string
    city: string | undefined
    geocode: string | undefined
    gender: string
    age: string | undefined
    profileId: string
    proxy: ProxyRead | null
    phone: string | undefined
    socialNetworks: { [network: string]: boolean }
    categories?: CategoryRead[]
}

function avatarToRow(avatar: AvatarRead): ProfileDataRow {
    const address = avatar.address
    return {
        original: avatar,
        name: getAvatarDisplayName(avatar),
        city: address?.city ?? undefined,
        geocode: address?.iso_3166_1_alpha_2_code ?? undefined,
        gender: avatar.gender || "Unknown",
        age: avatar.birth_date || undefined,
        profileId: avatar.id || "",
        proxy: avatar.proxy || null,
        phone: avatar.phone_number || undefined,
        socialNetworks: getSocialNetworkStatus(avatar),
        categories: [],
    }
}

const createProfileColumns = (
    categories: CategoryRead[],
    onUpdateAvatarCategories: (avatarId: string, categories: CategoryRead[]) => void,
    socialNetworksArray: string[],
    onCreateCategory?: (name: string) => Promise<CategoryRead | null>,
): ColumnDef<ProfileDataRow>[] => [
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
                        allowCreate
                        onCreateCategory={onCreateCategory}
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
        header: "Avatar ID",
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
    avatars: AvatarRead[]
    allCategories: CategoryRead[]
}) {
    const pageSize = 100
    const [activeRow, setActiveRow] = useState<ProfileDataRow | undefined>(undefined)
    const [avatars, setAvatars] = useState<AvatarRead[]>(initialAvatars)
    const [profilesData, setProfilesData] = useState<ProfileDataRow[]>([])
    const [categories, setCategories] = useState<CategoryRead[]>(allCategories)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [categorySelectValue, setCategorySelectValue] = useState("All")
    const [bulkCategoryInput, setBulkCategoryInput] = useState<string>("")
    const [isApplyingBulkCategory, setIsApplyingBulkCategory] = useState(false)
    const [isRemovingBulkCategory, setIsRemovingBulkCategory] = useState(false)
    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    })
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [totalCount, setTotalCount] = useState<number | null>(null)
    const [hasNextPage, setHasNextPage] = useState(() => initialAvatars.length === pageSize)
    const tableRef = useRef<HTMLDivElement>(null)
    const bulkCategoryOptionsId = "avatar-bulk-category-options"

    const searchParams = useSearchParams()
    const id = searchParams.get("id")

    const activationSources = new Set(
        avatars.map((avatar) => avatar.avatar_state?.state?.toUpperCase() || "UNKNOWN"),
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

    useEffect(() => {
        if (!activeCategory) {
            setCategorySelectValue("All")
        } else {
            setCategorySelectValue(activeCategory)
        }
    }, [activeCategory])

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

    const ensureCategoryByName = async (name: string): Promise<CategoryRead | null> => {
        const normalized = name.trim()
        if (!normalized) {
            toast.error("Category name is required")
            return null
        }
        const existing = categories.find(
            (category) => category.name?.toLowerCase() === normalized.toLowerCase(),
        )
        if (existing) {
            return existing
        }
        const rootCategory = categories.find((category) => !category.parent_id)
        try {
            const response = await fetch("/api/orchestrator/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: normalized,
                    description: "",
                    parent_id: rootCategory?.id ?? null,
                }),
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || "Failed to create category")
            }
            const newCategory = await response.json()
            handleCategoryCreated(newCategory)
            return newCategory
        } catch (error) {
            toast.error(
                `Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
            return null
        }
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

    const findCategoryByNameOrId = (value: string): CategoryRead | null => {
        const normalized = value.trim()
        if (!normalized) {
            return null
        }
        const normalizedLower = normalized.toLowerCase()
        return (
            categories.find(
                (category) =>
                    category.name?.toLowerCase() === normalizedLower ||
                    category.id === normalized ||
                    category.id?.toLowerCase() === normalizedLower,
            ) ?? null
        )
    }

    const handleBulkAssignCategories = async (
        avatarIds: string[],
        onComplete: () => void,
    ): Promise<void> => {
        if (avatarIds.length === 0) {
            toast.error("Select at least one avatar to update.")
            return
        }
        if (!bulkCategoryInput.trim()) {
            toast.error("Enter or select a category name.")
            return
        }

        setIsApplyingBulkCategory(true)
        try {
            const category = await ensureCategoryByName(bulkCategoryInput)
            if (!category) {
                return
            }

            await Promise.all(
                avatarIds.map(async (avatarId) => {
                    const response = await fetch(
                        `/api/orchestrator/characters?character_id=${avatarId}&operation=add_category`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categoryId: category.id }),
                        },
                    )
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}))
                        throw new Error(
                            errorData.error || `Failed to add category to avatar ${avatarId}`,
                        )
                    }
                }),
            )

            setProfilesData((prev) =>
                prev.map((profile) => {
                    if (!avatarIds.includes(profile.profileId)) {
                        return profile
                    }
                    const existingCategories = profile.categories || []
                    if (existingCategories.some((cat) => cat.id === category.id)) {
                        return profile
                    }
                    return {
                        ...profile,
                        categories: [...existingCategories, category],
                    }
                }),
            )

            toast.success(
                `Assigned ${category.name ?? "category"} to ${avatarIds.length} avatar${
                    avatarIds.length === 1 ? "" : "s"
                }.`,
            )
            setBulkCategoryInput("")
            onComplete()
        } catch (error) {
            toast.error(
                `Failed to assign categories: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            )
        } finally {
            setIsApplyingBulkCategory(false)
        }
    }

    const handleBulkRemoveCategories = async (
        avatarIds: string[],
        onComplete: () => void,
    ): Promise<void> => {
        if (avatarIds.length === 0) {
            toast.error("Select at least one avatar to update.")
            return
        }
        const categoryInput = bulkCategoryInput.trim()
        if (!categoryInput) {
            toast.error("Enter or select a category name.")
            return
        }

        const category = findCategoryByNameOrId(categoryInput)
        if (!category) {
            toast.error("Category not found.")
            return
        }

        setIsRemovingBulkCategory(true)
        try {
            await Promise.all(
                avatarIds.map(async (avatarId) => {
                    const response = await fetch(
                        `/api/orchestrator/characters?character_id=${avatarId}&operation=remove_category`,
                        {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categoryId: category.id }),
                        },
                    )
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}))
                        throw new Error(errorData.error || "Failed to remove category")
                    }
                }),
            )

            setProfilesData((prev) =>
                prev.map((profile) => {
                    if (!avatarIds.includes(profile.profileId)) {
                        return profile
                    }
                    const existingCategories = profile.categories || []
                    return {
                        ...profile,
                        categories: existingCategories.filter((cat) => cat.id !== category.id),
                    }
                }),
            )

            toast.success(
                `Removed ${category.name ?? "category"} from ${avatarIds.length} avatar${
                    avatarIds.length === 1 ? "" : "s"
                }.`,
            )
            setBulkCategoryInput("")
            onComplete()
        } catch (error) {
            toast.error(
                `Failed to remove categories: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            )
        } finally {
            setIsRemovingBulkCategory(false)
        }
    }

    // Fetch avatars with pagination
    const fetchAvatars = useCallback(async (skip: number, limit: number) => {
        setIsPageLoading(true)
        try {
            const response = await fetch(`/api/avatars/avatars?skip=${skip}&limit=${limit}`)
            if (!response.ok) {
                throw new Error(`Failed to fetch avatars: ${response.statusText}`)
            }
            const fetchedAvatars: AvatarRead[] = await response.json()
            setAvatars(fetchedAvatars)
            // If we got a full page, there might be more
            setHasNextPage(fetchedAvatars.length === limit)
            // If we got less than a full page, we know the total
            if (fetchedAvatars.length < limit) {
                setTotalCount(skip + fetchedAvatars.length)
            }
        } catch (error) {
            console.error("Failed to fetch avatars:", error)
            toast.error(`Failed to fetch avatars: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setIsPageLoading(false)
        }
    }, [])

    // Fetch avatars when pagination changes (but not on initial mount if we have initial data)
    useEffect(() => {
        // Skip initial fetch if we already have initial data and we're on the first page
        if (paginationState.pageIndex === 0 && initialAvatars.length > 0) {
            // Use initial data, but still set total count if we can infer it
            if (initialAvatars.length < paginationState.pageSize) {
                setTotalCount(initialAvatars.length)
            }
            return
        }
        const skip = paginationState.pageIndex * paginationState.pageSize
        const limit = paginationState.pageSize
        fetchAvatars(skip, limit)
    }, [paginationState.pageIndex, paginationState.pageSize, fetchAvatars, initialAvatars.length])

    // Load avatar categories
    const loadAvatarCategories = useCallback(async () => {
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
    }, [avatars])

    // Load categories when avatars change
    useEffect(() => {
        loadAvatarCategories()
    }, [avatars, loadAvatarCategories])

    // Log avatar counts for debugging
    useEffect(() => {
        const categoryFiltered = profilesData.filter((profile) => {
            if (!activeCategory) {
                return true
            }
            if (!profile.categories) {
                return false
            }
            return profile.categories.some((category) => category.name === activeCategory)
        })
        logger.info(
            `Avatar filtering: Total=${profilesData.length}, Category filtered (${activeCategory || "All"})=${categoryFiltered.length}`,
        )
    }, [profilesData, activeCategory])

    const refreshAvatar = async (): Promise<AvatarRead> => {
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

    const updateField = async (path: string, value: unknown) => {
        if (!activeRow) {
            return
        }
        logger.info("Updating avatar...")
        await new ServiceBrowserClient().updateProfile(activeRow.original.id, path, value)
        await refreshAvatar()
    }

    const profileColumns = createProfileColumns(
        categories,
        handleUpdateAvatarCategories,
        socialNetworksArray,
        ensureCategoryByName,
    )

    // Calculate page count for manual pagination
    const computedPageCount = totalCount !== null 
        ? Math.ceil(totalCount / paginationState.pageSize)
        : hasNextPage 
            ? paginationState.pageIndex + 2 // At least one more page
            : paginationState.pageIndex + 1

    const handlePaginationChange = (pagination: PaginationState) => {
        setPaginationState(pagination)
    }

    const filteredProfiles = profilesData.filter((profile) => {
        if (categorySelectValue === "Untagged") {
            return !profile.categories || profile.categories.length === 0
        }
        if (!activeCategory) {
            return true
        }
        if (!profile.categories) {
            return false
        }
        return profile.categories.some((category) => category.name === activeCategory)
    })

    const displayTotalItems = totalCount ?? (hasNextPage ? (paginationState.pageIndex + 1) * paginationState.pageSize + 1 : filteredProfiles.length)

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
                <div className="flex flex-row items-center gap-4">
                    <div className="flex flex-row items-center gap-2">
                        <Label>Category</Label>
                        <Select
                            value={categorySelectValue}
                            onValueChange={(value) => {
                                setCategorySelectValue(value)
                                if (value === "All" || value === "Untagged") {
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
                                <SelectItem value="Untagged">Untagged</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.name ?? category.id}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-muted-foreground text-md flex flex-row items-center gap-2">
                        <Badge variant="secondary" className="font-normal">
                            {filteredProfiles.length} of {displayTotalItems} avatars
                        </Badge>
                    </div>
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
                        enableRowSelection
                        onClickRow={(row) => {
                            logger.info("Clicked row: ", row.original)
                            setActiveRow(row)
                        }}
                        data={filteredProfiles}
                        isRefreshing={isPageLoading}
                        pageSize={paginationState.pageSize}
                        manualPagination={true}
                        externalPagination={paginationState}
                        onExternalPaginationChange={handlePaginationChange}
                        pageCount={computedPageCount}
                        totalItems={displayTotalItems}
                        paginationPosition="top"
                        header={({ table }) => {
                            const selectedRows = table.getFilteredSelectedRowModel().rows
                            return (
                                <div className="flex flex-col gap-4">
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
                                            <Label htmlFor="profileId">Avatar ID</Label>
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
                                    {selectedRows.length > 0 && (
                                        <div className="bg-muted/40 flex flex-wrap items-center gap-3 rounded-md border p-3">
                                            <Badge variant="secondary">
                                                {selectedRows.length} selected
                                            </Badge>
                                            <Input
                                                placeholder="Category name"
                                                value={bulkCategoryInput}
                                                onChange={(event) =>
                                                    setBulkCategoryInput(event.target.value)
                                                }
                                                list={bulkCategoryOptionsId}
                                                className="w-64"
                                            />
                                            <datalist id={bulkCategoryOptionsId}>
                                                {categories
                                                    .filter((category) => !!category.name)
                                                    .map((category) => (
                                                        <option
                                                            key={category.id}
                                                            value={category.name ?? ""}
                                                        />
                                                    ))}
                                            </datalist>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleBulkAssignCategories(
                                                        selectedRows.map(
                                                            (row) => row.original.profileId,
                                                        ),
                                                        () => table.resetRowSelection(),
                                                    )
                                                }
                                                disabled={
                                                    !bulkCategoryInput.trim() ||
                                                    isApplyingBulkCategory ||
                                                    isRemovingBulkCategory
                                                }
                                            >
                                                {isApplyingBulkCategory ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Assigning
                                                    </>
                                                ) : (
                                                    "Assign category"
                                                )}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleBulkRemoveCategories(
                                                        selectedRows.map(
                                                            (row) => row.original.profileId,
                                                        ),
                                                        () => table.resetRowSelection(),
                                                    )
                                                }
                                                disabled={
                                                    !bulkCategoryInput.trim() ||
                                                    isRemovingBulkCategory ||
                                                    isApplyingBulkCategory
                                                }
                                            >
                                                {isRemovingBulkCategory ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Removing
                                                    </>
                                                ) : (
                                                    "Remove category"
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => table.resetRowSelection()}
                                            >
                                                Clear selection
                                            </Button>
                                        </div>
                                    )}
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
