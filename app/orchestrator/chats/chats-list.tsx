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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CategoryRead, ChatRead, ChatType, ChatView } from "@lib/api/models"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Filter, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react"
import { toast } from "sonner"
import { CategorySelector } from "../mission-builder/category-selector"

interface ChatRow {
    title: string
    about: string
    username?: string
    platform_id?: number
    type: ChatType
    platform: string
    participants_count?: number
    linked_chat_username?: string
    text_summary?: string
    linked_chat_id?: number
    system_chat_members?: string[]
    categories: string[]
    id: string
    original: ChatRead
}

export type ChatsListHandle = {
    exportCurrentChatsToCsv: () => Promise<void>
}

type ChatsListProps = {
    chats: ChatView[]
    allCategories: CategoryRead[]
    initialPageSize: number
    initialTotalCount?: number
    onStatsChange?: (stats: { totalCount: number; isSearchMode: boolean }) => void
}

const chatColumns: ColumnDef<ChatRow>[] = [
    {
        accessorKey: "username",
        header: "Username",
        size: 100,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col text-center">
                    <span className="font-medium text-center">{chat.username || chat.platform_id}</span>
                    {/* {chat.username && <span className="text-sm text-gray-500">@{chat.username}</span>} */}
                </div>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Title",
        size: 100,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col items-center text-center whitespace-pre-wrap">
                    <span className="font-medium text-center flex-wrap">{chat.title || "Untitled"}</span>
                    {chat.username && (
                        <span className="text-sm text-gray-500 text-center">@{chat.username}</span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        size: 75,
        cell: ({ row }) => {
            const chat = row.original
            const typeColors: Record<ChatType, { bg: string; text: string }> = {
                User: { bg: "bg-blue-50", text: "text-blue-800" },
                Group: { bg: "bg-green-50", text: "text-green-800" },
                Channel: { bg: "bg-purple-50", text: "text-purple-800" },
                Bot: { bg: "bg-amber-50", text: "text-amber-800" },
                Unknown: { bg: "bg-gray-50", text: "text-gray-800" },
            }
            const colors = typeColors[chat.type || "Unknown"]
            return (
                <span className="text-center">
                    <Badge className={cn(colors.bg, colors.text)}>{chat.type || "Unknown"}</Badge>
                </span>
            )
        },
    },
    {
        accessorKey: "participants_count",
        header: "Participants Count",
        size: 100,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col text-center">
                    <span className="font-medium">{chat.participants_count || 0}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "categories",
        header: "Categories",
        size: 100,
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
            const chat = row.original
            return (
                <div className="flex max-w-[200px] flex-wrap gap-1">
                    {chat.categories &&
                        chat.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                                {category}
                            </Badge>
                        ))}
                </div>
            )
        },
    },
    {
        accessorKey: "system_chat_members",
        header: "System members count",
        size: 100,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col text-center">
                    <span className="font-medium text-center">{chat.system_chat_members?.length || 0}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "linked_chat_username",
        header: "Linked chat (discussion or channel)",
        size: 100,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col text-center">
                    <span className="font-medium text-center">
                        {chat.linked_chat_username ||
                            (chat.linked_chat_id ? chat.linked_chat_id.toString() : "None")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "Chat summary",
        header: "Chat summary",
        size: 500,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <span className="font-medium whitespace-pre-wrap break-words">
                    {chat.text_summary || "No summary"}
                </span>
            )
        },
    },
]

// Cache key for localStorage
const FILTER_CACHE_KEY = "chats-list-filters-cache"
const CACHE_EXPIRATION_MS = 5 * 60 * 1000 // 5 minutes

interface FilterCache {
    filters: {
        username: string
        title: string
        chatType: string
        platform: string
        minParticipants: string
        maxParticipants: string
        linkedChatUsername: string
        categoryName: string
    }
    activeCategory: string | null
    pagination: PaginationState
    selectedIds: string[]
    timestamp: number
}

// Cache utility functions
const saveFilterCache = (cache: Omit<FilterCache, "timestamp">) => {
    try {
        const cacheWithTimestamp: FilterCache = {
            ...cache,
            timestamp: Date.now(),
        }
        localStorage.setItem(FILTER_CACHE_KEY, JSON.stringify(cacheWithTimestamp))
    } catch (error) {
        console.warn("Failed to save filter cache:", error)
    }
}

const loadFilterCache = (): Omit<FilterCache, "timestamp"> | null => {
    try {
        const cached = localStorage.getItem(FILTER_CACHE_KEY)
        if (!cached) return null

        const cache: FilterCache = JSON.parse(cached)
        const now = Date.now()
        const age = now - cache.timestamp

        // Check if cache is expired
        if (age > CACHE_EXPIRATION_MS) {
            localStorage.removeItem(FILTER_CACHE_KEY)
            return null
        }

        return {
            filters: cache.filters,
            activeCategory: cache.activeCategory,
            pagination: cache.pagination,
            selectedIds: cache.selectedIds || [],
        }
    } catch (error) {
        console.warn("Failed to load filter cache:", error)
        return null
    }
}

export const ChatsList = forwardRef<ChatsListHandle, ChatsListProps>(function ChatsList(
    { chats, allCategories, initialPageSize, initialTotalCount, onStatsChange },
    ref,
) {
    const router = useRouter()
    const bulkCategoryOptionsId = "chat-bulk-category-options"
    const filterCategoryOptionsId = "chat-filter-category-options"
    
    // Load cached filters on mount
    const cachedFilters = loadFilterCache()
    
    const [activeCategory, setActiveCategory] = useState<string | null>(cachedFilters?.activeCategory ?? null)
    const [chatData, setChatData] = useState<ChatView[]>(chats)
    const [categories, setCategories] = useState<CategoryRead[]>(allCategories)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchMode, setIsSearchMode] = useState(false)
    const [paginationState, setPaginationState] = useState<PaginationState>(
        cachedFilters?.pagination ?? {
            pageIndex: 0,
            pageSize: initialPageSize,
        }
    )
    const [hasNextPage, setHasNextPage] = useState(() => {
        if (typeof initialTotalCount === "number") {
            return initialTotalCount > initialPageSize
        }
        return chats.length === initialPageSize
    })
    const derivedInitialTotal =
        typeof initialTotalCount === "number"
            ? initialTotalCount
            : chats.length < initialPageSize
                ? chats.length
                : null
    const [totalCount, setTotalCount] = useState<number | null>(derivedInitialTotal)
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [isSearchingChats, setIsSearchingChats] = useState(false)
    const [searchResultCount, setSearchResultCount] = useState<number | null>(null)
    const [searchMode, setSearchMode] = useState<"topics" | "topicsAddToCategory">("topics")
    const [searchCategoryName, setSearchCategoryName] = useState("")
    const [searchTopK, setSearchTopK] = useState("")
    const [bulkCategoryInput, setBulkCategoryInput] = useState("")

    // Filter parameters - initialize from cache if available
    const [filterUsername, setFilterUsername] = useState(cachedFilters?.filters.username ?? "")
    const [filterTitle, setFilterTitle] = useState(cachedFilters?.filters.title ?? "")
    const [filterChatType, setFilterChatType] = useState<string>(cachedFilters?.filters.chatType ?? "")
    const [filterPlatform, setFilterPlatform] = useState(cachedFilters?.filters.platform ?? "")
    const [filterMinParticipants, setFilterMinParticipants] = useState(cachedFilters?.filters.minParticipants ?? "")
    const [filterMaxParticipants, setFilterMaxParticipants] = useState(cachedFilters?.filters.maxParticipants ?? "")
    const [filterLinkedChatUsername, setFilterLinkedChatUsername] = useState(cachedFilters?.filters.linkedChatUsername ?? "")
    const [filterCategoryName, setFilterCategoryName] = useState(cachedFilters?.filters.categoryName ?? "")
    const [showFilters, setShowFilters] = useState(false)
    const [isAddingBulkCategory, setIsAddingBulkCategory] = useState(false)
    const [isRemovingBulkCategory, setIsRemovingBulkCategory] = useState(false)
    const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
    const [isSelectingAllFiltered, setIsSelectingAllFiltered] = useState(false)
    const [categorySelectValue, setCategorySelectValue] = useState(
        cachedFilters?.activeCategory ? cachedFilters.activeCategory : "All"
    )
    const serviceClientRef = useRef(new ServiceBrowserClient())
    // Persistent selection state that survives page changes - initialize from cache
    const [persistentSelectedIds, setPersistentSelectedIds] = useState<Set<string>>(
        new Set(cachedFilters?.selectedIds || [])
    )
    // Row selection state for the table (using chat IDs as keys)
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

    // No client-side filtering - all filtering is done server-side
    const filteredChats = chatData

    // Sync row selection state with persistent selection when data changes
    useEffect(() => {
        const newSelection: Record<string, boolean> = {}
        chatData.forEach((chat) => {
            if (persistentSelectedIds.has(chat.id)) {
                newSelection[chat.id] = true
            }
        })
        setRowSelection(newSelection)
    }, [chatData, persistentSelectedIds])

    // Handle row selection changes - update persistent selection
    const handleRowSelectionChange = useCallback((updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
        setRowSelection((prevSelection) => {
            const newSelection = typeof updater === 'function' ? updater(prevSelection) : updater
            
            // Update persistent selection
            setPersistentSelectedIds((prevIds) => {
                const newSet = new Set(prevIds)
                
                // First, remove all current page selections from persistent set
                chatData.forEach((chat) => {
                    newSet.delete(chat.id)
                })
                
                // Then add back the ones that are selected in the new selection
                Object.entries(newSelection).forEach(([id, isSelected]) => {
                    if (isSelected) {
                        newSet.add(id)
                    }
                })
                
                return newSet
            })
            
            return newSelection
        })
    }, [chatData])

    useEffect(() => {
        if (!isSearchMode) {
            setChatData(chats)
        }
    }, [chats, isSearchMode])

    useEffect(() => {
        setCategories(allCategories)
    }, [allCategories])

    useEffect(() => {
        // Always use actual data length for accurate counts
        const visibleCount = isSearchMode
            ? chatData.length
            : totalCount ?? chatData.length
        onStatsChange?.({
            totalCount: visibleCount,
            isSearchMode,
        })
    }, [onStatsChange, isSearchMode, chatData.length, totalCount])

    // Save filters and selection to cache whenever they change
    useEffect(() => {
        saveFilterCache({
            filters: {
                username: filterUsername,
                title: filterTitle,
                chatType: filterChatType,
                platform: filterPlatform,
                minParticipants: filterMinParticipants,
                maxParticipants: filterMaxParticipants,
                linkedChatUsername: filterLinkedChatUsername,
                categoryName: filterCategoryName,
            },
            activeCategory,
            pagination: paginationState,
            selectedIds: Array.from(persistentSelectedIds),
        })
    }, [
        filterUsername,
        filterTitle,
        filterChatType,
        filterPlatform,
        filterMinParticipants,
        filterMaxParticipants,
        filterLinkedChatUsername,
        filterCategoryName,
        activeCategory,
        paginationState,
        persistentSelectedIds,
    ])

    const getCurrentFilters = () => {
        const filters = {
            username: filterUsername.trim() || undefined,
            title: filterTitle.trim() || undefined,
            chatType: filterChatType || undefined,
            platform: filterPlatform.trim() || undefined,
            minParticipants: filterMinParticipants.trim() || undefined,
            maxParticipants: filterMaxParticipants.trim() || undefined,
            linkedChatUsername: filterLinkedChatUsername.trim() || undefined,
            categoryName: filterCategoryName.trim() || undefined,
        }
        console.log('[Filters] getCurrentFilters returning:', filters)
        return filters
    }

    const fetchChatsPage = useCallback(
        async (pageIndex: number, pageSize: number, categoryName: string | null = null) => {
            setIsPageLoading(true)
            try {
                const filters = getCurrentFilters()
                // If filterCategoryName is set (advanced filter), use it instead of the categoryName parameter
                const effectiveCategoryName = filters.categoryName || categoryName || undefined
                
                // Remove categoryName from filters to avoid duplication
                const { categoryName: _, ...filtersWithoutCategory } = filters
                
                const { chats: pageChats, hasMore } =
                    await serviceClientRef.current.getOrchestratorChatsPage({
                        pageIndex,
                        pageSize,
                        categoryName: effectiveCategoryName,
                        ...filtersWithoutCategory,
                    })
                setChatData(pageChats)

                // Use hasMore flag for pagination
                setHasNextPage(hasMore ?? false)
                setTotalCount(null) // We don't have total count with cursor pagination
            } catch (error) {
                console.error("Failed to load chats page:", error)
                toast.error("Failed to load chats page")
                throw error
            } finally {
                setIsPageLoading(false)
            }
        },
        [
            filterUsername,
            filterTitle,
            filterChatType,
            filterPlatform,
            filterMinParticipants,
            filterMaxParticipants,
            filterLinkedChatUsername,
            filterCategoryName,
        ],
    )

    const handlePaginationChange = useCallback(
        (next: PaginationState) => {
            if (isSearchMode) {
                return
            }
            console.log(`[Pagination] Navigating to page ${next.pageIndex + 1} (pageSize: ${next.pageSize})`)
            setPaginationState(next)
            void fetchChatsPage(next.pageIndex, next.pageSize, activeCategory)
        },
        [fetchChatsPage, isSearchMode, activeCategory],
    )

    // Track if this is the initial mount to avoid unnecessary fetches
    const isInitialMount = useRef(true)
    const hasAppliedCache = useRef(!!cachedFilters)
    
    // Update select value when active category changes
    useEffect(() => {
        if (!activeCategory) {
            setCategorySelectValue("All")
        } else {
            setCategorySelectValue(activeCategory)
        }
    }, [activeCategory])
    
    // Apply cached filters on initial mount
    useEffect(() => {
        if (cachedFilters && hasAppliedCache.current) {
            // If we have cached filters, fetch data with them instead of using initial data
            void fetchChatsPage(
                cachedFilters.pagination.pageIndex,
                cachedFilters.pagination.pageSize,
                cachedFilters.activeCategory
            )
            hasAppliedCache.current = false // Mark as applied
        }
        isInitialMount.current = false
    }, [fetchChatsPage]) // Include fetchChatsPage to avoid stale closure
    
    // Fetch new data when category changes (but not on initial mount with initial data)
    useEffect(() => {
        // Skip on initial mount (we already have initial data or cached filters)
        if (isInitialMount.current) {
            return
        }

        // Skip if in search mode - category changes should exit search mode, but we handle that separately
        // to avoid triggering this effect when ENTERING search mode
        if (isSearchMode) {
            console.log('[Category] Skipping category refetch - in search mode')
            return
        }

        console.log('[Category] Category changed, refetching chats')
        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
        void fetchChatsPage(0, paginationState.pageSize, activeCategory)
    }, [activeCategory, isSearchMode, fetchChatsPage, paginationState.pageSize])

    // Fetch new data when filters change
    useEffect(() => {
        // Skip on initial mount
        if (isInitialMount.current) {
            return
        }

        // Skip if this is search mode
        if (isSearchMode) {
            console.log('[Filters] Skipping filter refetch - in search mode')
            return
        }

        const debounceMs = 350
        const nextPageSize = paginationState.pageSize
        const nextCategory = activeCategory

        const timeoutId = window.setTimeout(() => {
            console.log('[Filters] Filters changed, refetching chats:', {
                filterUsername,
                filterTitle,
                filterChatType,
                filterPlatform,
                filterMinParticipants,
                filterMaxParticipants,
                filterLinkedChatUsername,
                filterCategoryName
            })
            // When filters change, reset to first page and fetch with new filters
            setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
            void fetchChatsPage(0, nextPageSize, nextCategory)
        }, debounceMs)

        return () => window.clearTimeout(timeoutId)
    }, [
        filterUsername,
        filterTitle,
        filterChatType,
        filterPlatform,
        filterMinParticipants,
        filterMaxParticipants,
        filterLinkedChatUsername,
        filterCategoryName,
        isSearchMode,
        paginationState.pageSize,
        activeCategory,
        fetchChatsPage
    ])

    const handleCategoryCreated = (newCategory: CategoryRead) => {
        setCategories((prev) => [...prev, newCategory])
        toast.success(`Created category: ${newCategory.name}`)
    }

    const syncChatCategoryState = (chatId: string, updatedCategoryNames: string[]) => {
        setChatData((prevChats) =>
            prevChats.map((prevChat) =>
                prevChat.id === chatId ? { ...prevChat, categories: updatedCategoryNames } : prevChat,
            ),
        )
    }

    const removeChatFromState = (chatId: string) => {
        setChatData((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
    }

    const ensureCategoryByName = async (name: string): Promise<CategoryRead | null> => {
        const normalized = name.trim()
        if (!normalized) {
            toast.error("Category name is required")
            return null
        }

        const existingCategory = categories.find(
            (category) => category.name?.toLowerCase() === normalized.toLowerCase(),
        )
        if (existingCategory) {
            return existingCategory
        }

        const rootCategory = categories.find((category) => !category.parent_id)

        try {
            const response = await fetch("/api/orchestrator/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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

    const handleCreateCategoryForSelector = async (name: string) => {
        return await ensureCategoryByName(name)
    }

    const extractTopTopics = (summary?: string | null) => {
        if (!summary) {
            return undefined
        }

        return summary
    }

    const convertToChatView = (
        chat: ChatView | (ChatRead & { categories?: string[]; text_summary?: string | null }),
    ) => {
        const enriched = chat as ChatView &
            ChatRead & {
                categories?: string[]
                system_chat_members?: string[]
                linked_chat_id?: number
                text_summary?: string | null
            }
        return {
            id: enriched.id,
            platform_id: enriched.platform_id ?? null,
            username: enriched.username ?? null,
            title: enriched.title ?? null,
            about: enriched.about ?? null,
            chat_type: enriched.chat_type ?? "Unknown",
            linked_chat_username: enriched.linked_chat_username ?? null,
            participants_count: enriched.participants_count ?? null,
            categories: enriched.categories ?? [],
            system_chat_members: enriched.system_chat_members ?? [],
            linked_chat_id: enriched.linked_chat_id,
            text_summary: enriched.text_summary ?? undefined,
        } as ChatView & { linked_chat_id?: number; text_summary?: string }
    }

    const handleBulkApplyCategory = async (
        chatIds: string[],
        onCompleted: () => void,
    ): Promise<void> => {
        if (chatIds.length === 0) {
            toast.error("Select at least one chat to update.")
            return
        }
        if (!bulkCategoryInput.trim()) {
            toast.error("Enter or select a category name.")
            return
        }

        setIsAddingBulkCategory(true)
        try {
            const category = await ensureCategoryByName(bulkCategoryInput)
            if (!category) {
                return
            }

            const categoryName = category.name ?? bulkCategoryInput.trim()
            const client = serviceClientRef.current

            await Promise.all(
                chatIds.map(async (chatId) => {
                    await client.updateChatCategories(chatId, [category.id], [])
                    const existingCategories =
                        chatData.find((chat) => chat.id === chatId)?.categories || []
                    const updatedCategoryNames = Array.from(
                        new Set([...(existingCategories ?? []), categoryName]),
                    )
                    syncChatCategoryState(chatId, updatedCategoryNames)
                }),
            )

            toast.success(
                `Assigned ${categoryName} to ${chatIds.length} chat${chatIds.length === 1 ? "" : "s"}.`,
            )
            setBulkCategoryInput("")
            onCompleted()
        } catch (error) {
            toast.error(
                `Failed to update categories: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            )
        } finally {
            setIsAddingBulkCategory(false)
        }
    }

    const handleBulkRemoveCategory = async (
        chatIds: string[],
        onCompleted: () => void,
    ): Promise<void> => {
        if (chatIds.length === 0) {
            toast.error("Select at least one chat to update.")
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
        const client = serviceClientRef.current
        try {
            await Promise.all(
                chatIds.map(async (chatId) => {
                    await client.updateChatCategories(chatId, [], [category.id])
                    const existingCategories =
                        chatData.find((chat) => chat.id === chatId)?.categories || []
                    const targetsToRemove = new Set(
                        [category.name, category.id, categoryInput]
                            .filter((value): value is string => typeof value === "string" && value.length > 0)
                            .map((value) => value.toLowerCase()),
                    )
                    const updatedCategoryNames = existingCategories.filter((existing: string) => {
                        const normalized = existing?.toString().toLowerCase()
                        return normalized ? !targetsToRemove.has(normalized) : true
                    })
                    syncChatCategoryState(chatId, updatedCategoryNames)
                }),
            )

            const label = category.name ?? categoryInput
            toast.success(
                `Removed ${label} from ${chatIds.length} chat${chatIds.length === 1 ? "" : "s"}.`,
            )
            setBulkCategoryInput("")
            onCompleted()
        } catch (error) {
            toast.error(
                `Failed to remove category: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`,
            )
        } finally {
            setIsRemovingBulkCategory(false)
        }
    }

    const handleSearchChats = async () => {
        const query = searchQuery.trim()
        if (!query) {
            setIsSearchMode(false)
            setSearchResultCount(null)
            setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
            void fetchChatsPage(0, paginationState.pageSize)
            return
        }

        const isAddMode = searchMode === "topicsAddToCategory"
        if (isAddMode && !searchCategoryName.trim()) {
            toast.error("Enter a category name to add matching chats.")
            return
        }

        const topkValue = searchTopK.trim()
        let topkNumber: number | undefined
        if (topkValue) {
            const parsed = Number(topkValue)
            if (Number.isNaN(parsed) || parsed <= 0) {
                toast.error("TopK must be a positive number.")
                return
            }
            topkNumber = parsed
        }

        setIsSearchingChats(true)
        try {
            const params = new URLSearchParams({ query })
            
            // Only send category_name when in "Search & add to category" mode
            // This ensures we only call the add-to-category endpoint when explicitly requested
            if (isAddMode) {
                params.set("category_name", searchCategoryName.trim())
            }
            
            if (typeof topkNumber === "number") {
                params.set("topk", topkNumber.toString())
            }

            // Add filter parameters
            const filters = getCurrentFilters()
            if (filters.username) {
                params.set("username", filters.username)
            }
            if (filters.title) {
                params.set("title", filters.title)
            }
            if (filters.chatType) {
                params.set("chat_type", filters.chatType)
            }
            // Note: Search endpoint uses platform_id (number), not platform (string)
            // So we skip platform filter for search
            if (filters.minParticipants) {
                params.set("min_participants", filters.minParticipants)
            }
            if (filters.maxParticipants) {
                params.set("max_participants", filters.maxParticipants)
            }
            if (filters.linkedChatUsername) {
                params.set("linked_chat_username", filters.linkedChatUsername)
            }
            // Use has_category for filtering by category (works in both search modes)
            // This is different from category_name which is only used to ADD chats to a category
            if (filters.categoryName) {
                params.set("has_category", filters.categoryName)
            }

            // Add cache-busting parameter to ensure fresh results for different queries
            params.set("_t", Date.now().toString())

            const response = await fetch(`/api/orchestrator/chats/search?${params.toString()}`, {
                cache: 'no-store',
            })
            const rawPayload = await response.json().catch(() => [])

            if (!response.ok) {
                const errorMessage =
                    (rawPayload as { error?: string })?.error || "Failed to search chats"
                throw new Error(errorMessage)
            }

            const payload = (rawPayload ?? []) as (ChatView | ChatRead)[]
            const normalizedResults = payload.map((chat) => convertToChatView(chat))
            
            setChatData(normalizedResults)
            setIsSearchMode(true)
            setSearchResultCount(normalizedResults.length)
            setHasNextPage(false)
            if (isAddMode) {
                toast.success(
                    `Added ${normalizedResults.length} chat${normalizedResults.length === 1 ? "" : "s"} to ${searchCategoryName.trim()}.`,
                )
            }
        } catch (error) {
            console.error("Search chats failed:", error)
            toast.error(
                `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
        } finally {
            setIsSearchingChats(false)
        }
    }

    const handleClearSearch = () => {
        setSearchQuery("")
        setIsSearchMode(false)
        setSearchResultCount(null)
        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
        void fetchChatsPage(0, paginationState.pageSize, activeCategory)
    }

    const handleDeleteChat = async (chatId: string, label?: string) => {
        setDeletingChatId(chatId)
        try {
            const response = await fetch(`/api/orchestrator/chats/${chatId}`, {
                method: "DELETE",
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || "Failed to delete chat")
            }
            removeChatFromState(chatId)
            toast.success(`Deleted chat ${label || chatId}.`)
        } catch (error) {
            toast.error(
                `Failed to delete chat: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
        } finally {
            setDeletingChatId(null)
        }
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

    // Function to map ChatView to ChatRow
    const mapChatViewToRow = (chat: ChatView): ChatRow => {
        const chatWithExtras = chat as ChatView & {
            linked_chat_id?: number | null
            text_summary?: string | null
        }
        return {
            title: chat.title || "",
            about: chat.about || "",
            username: chat.username || undefined,
            platform_id: chat.platform_id || undefined,
            type: chat.chat_type || "Unknown",
            platform: "",
            participants_count: chat.participants_count || 0,
            linked_chat_username: chat.linked_chat_username || undefined,
            text_summary: extractTopTopics(chatWithExtras.text_summary) ?? undefined,
            linked_chat_id: chatWithExtras.linked_chat_id ?? undefined,
            system_chat_members: chat.system_chat_members,
            categories: chat.categories || [],
            id: chat.id,
            original: chat as any, // Cast since ChatView doesn't have created_at/updated_at
        }
    }

    const exportCurrentChatsToCsv = useCallback(async () => {
        try {
            if (filteredChats.length === 0) {
                toast.info("No chats to export for the current view")
                return
            }

            const headers = [
                "ID",
                "Username",
                "Platform ID",
                "Title",
                "Chat Type",
                "Participants Count",
                "Categories",
                "Linked Chat Username",
                "Linked Chat ID",
                "Summary",
            ]

            const toCsvValue = (value: string | number | null | undefined) => {
                if (value === null || value === undefined) {
                    return `""`
                }
                const normalizedValue = typeof value === "string" ? value : String(value)
                const sanitizedValue = normalizedValue.replace(/"/g, '""').replace(/\r?\n|\r/g, " ").trim()
                return `"${sanitizedValue}"`
            }

            const rows = filteredChats.map((chat) => {
                const categories = (chat.categories ?? []).join("; ")
                const summary = chat.text_summary ?? ""
                return [
                    chat.id,
                    chat.username ?? "",
                    chat.platform_id ?? "",
                    chat.title ?? "",
                    chat.chat_type ?? "Unknown",
                    chat.participants_count ?? "",
                    categories,
                    chat.linked_chat_username ?? "",
                    chat.linked_chat_id ?? "",
                    summary,
                ]
                    .map(toCsvValue)
                    .join(",")
            })

            const headerRow = headers.map(toCsvValue).join(",")
            const csvContent = [headerRow, ...rows].join("\n")
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const normalizedQuery = searchQuery.trim().replace(/[^\w.-]+/g, "_")
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
            const filenameParts = ["chats"]
            if (normalizedQuery) {
                filenameParts.push(`query-${normalizedQuery}`)
            }
            filenameParts.push(`count-${filteredChats.length}`, timestamp)
            const link = document.createElement("a")
            link.href = url
            link.download = `${filenameParts.join("-")}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            toast.success(
                `Exported ${filteredChats.length} chat${filteredChats.length === 1 ? "" : "s"}`,
            )
        } catch (error) {
            console.error("Export chats failed:", error)
            toast.error(
                `Failed to export chats: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
        }
    }, [filteredChats, searchQuery])

    useImperativeHandle(
        ref,
        () => ({
            exportCurrentChatsToCsv,
        }),
        [exportCurrentChatsToCsv],
    )

    const columnsWithCategorySelector: ColumnDef<ChatRow>[] = [
        ...chatColumns.slice(0, 4), // Include first 4 columns (username, title, type, participants_count)
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
                const chat = row.original
                const chatCategories = categories.filter((cat) =>
                    chat.categories?.some((chatCat) => chatCat === cat.name || chatCat === cat.id),
                )

                return (
                    <div
                        className="py-2"
                        onClick={(e) => {
                            // Prevent row click when interacting with category selector
                            e.stopPropagation()
                        }}
                    >
                        <CategorySelector
                            existingCategories={chatCategories}
                            categories={categories}
                            allowCreate
                            onCreateCategory={handleCreateCategoryForSelector}
                            onChangeValue={async (
                                selectedCategories: { id: string; label: string }[],
                            ) => {
                                const client = serviceClientRef.current
                                const newCategories = selectedCategories.filter(
                                    (c: { id: string; label: string }) =>
                                        !chatCategories.some(
                                            (cat: CategoryRead) => cat.id === c.id,
                                        ),
                                )
                                const removedCategories = chatCategories.filter(
                                    (c: CategoryRead) =>
                                        !selectedCategories.some(
                                            (cat: { id: string; label: string }) => cat.id === c.id,
                                        ),
                                )

                                try {
                                    for (const newCategory of newCategories) {
                                        try {
                                        await client.updateChatCategories(
                                                chat.id,
                                                [newCategory.id],
                                                [],
                                            )
                                        } catch (error) {
                                            console.error(
                                                `Failed to add category ${newCategory.id} to chat ${chat.id}:`,
                                                error,
                                            )
                                            throw error
                                        }
                                    }

                                    // Remove categories - check if they exist using the category ID
                                    for (const removedCategory of removedCategories) {
                                        // Only remove if the category is actually associated with the chat
                                        if (
                                            chatCategories.some(
                                                (cat) => cat.id === removedCategory.id,
                                            )
                                        ) {
                                            try {
                                            await client.updateChatCategories(
                                                    chat.id,
                                                    [],
                                                    [removedCategory.id],
                                                )
                                            } catch (error) {
                                                console.error(
                                                    `Failed to remove category ${removedCategory.id} from chat ${chat.id}:`,
                                                    error,
                                                )
                                                // Don't throw here - continue with other operations
                                                toast.error(
                                                    `Failed to remove category ${removedCategory.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
                                                )
                                            }
                                        } else {
                                            console.log(
                                                `Skipping removal of category ${removedCategory.id} as it's not associated with chat ${chat.id}`,
                                            )
                                        }
                                    }

                                    const updatedCategoryNames = selectedCategories.map(
                                        (c: { id: string; label: string }) => c.label,
                                    )

                                    // Update local state
                                    syncChatCategoryState(chat.id, updatedCategoryNames)

                                    toast.success(
                                        `Updated categories for chat '${chat.title || chat.id}': ${updatedCategoryNames.join(", ")}`,
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
        ...chatColumns.slice(5), 
        {
            id: "actions",
            header: "Actions",
            size: 50,
            enableSorting: false,
            cell: ({ row }) => {
                const chat = row.original
                const chatLabel = chat.title || chat.username || chat.id
                return (
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className="flex justify-center"
                    >
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    disabled={deletingChatId === chat.id}
                                >
                                    {deletingChatId === chat.id ? (
                                        <>
                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                            Deleting
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete {chatLabel}. This action cannot
                                        be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteChat(chat.id, chatLabel)}
                                        disabled={deletingChatId === chat.id}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )
            },
        },
    ]

    const manualPaginationEnabled = !isSearchMode
    const tablePageSize = manualPaginationEnabled ? paginationState.pageSize : 10

    const computedPageCount = manualPaginationEnabled
        ? typeof totalCount === "number"
            ? Math.max(1, Math.ceil(totalCount / paginationState.pageSize))
            : hasNextPage
                ? paginationState.pageIndex + 2 // Current page + at least one more
                : paginationState.pageIndex + 1 // Only current page
        : undefined

    const actualDataLength = filteredChats.length
    const estimatedTotal = manualPaginationEnabled && hasNextPage
        ? paginationState.pageIndex * paginationState.pageSize + actualDataLength
        : actualDataLength
    const displayTotalItems = manualPaginationEnabled
        ? totalCount ?? estimatedTotal
        : chatData.length
    
    if (process.env.NODE_ENV === 'development') {
        console.log('[Pagination Display]', {
            manualPaginationEnabled,
            hasNextPage,
            pageIndex: paginationState.pageIndex,
            pageSize: paginationState.pageSize,
            actualDataLength,
            estimatedTotal,
            isSearchMode,
        })
    }

    const selectedIds = useMemo(() => Array.from(persistentSelectedIds), [persistentSelectedIds])

    return (
        <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-4">
                <DataTable
                    columns={columnsWithCategorySelector}
                    data={filteredChats.map(mapChatViewToRow)}
                    isRefreshing={isPageLoading || isSearchingChats}
                    pageSize={tablePageSize}
                    manualPagination={manualPaginationEnabled}
                    externalPagination={manualPaginationEnabled ? paginationState : undefined}
                    onExternalPaginationChange={
                        manualPaginationEnabled ? handlePaginationChange : undefined
                    }
                    pageCount={computedPageCount}
                    totalItems={displayTotalItems}
                    enableRowSelection
                    paginationPosition="top"
                    getRowId={(row) => row.id}
                    externalRowSelection={rowSelection}
                    onRowSelectionChange={handleRowSelectionChange}
                    header={({ table }) => {
                        const selectedRows = table.getFilteredSelectedRowModel().rows
                        return (
                            <div className="flex w-full flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Input
                                        placeholder="Search chats by keywords..."
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault()
                                                handleSearchChats()
                                            }
                                        }}
                                        className="w-64"
                                    />
                                    <Select
                                        value={searchMode}
                                        onValueChange={(value) =>
                                            setSearchMode(
                                                value as "topics" | "topicsAddToCategory",
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="Search mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="topics">Search only</SelectItem>
                                            <SelectItem value="topicsAddToCategory">
                                                Search & add to category
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {searchMode === "topicsAddToCategory" && (
                                        <Input
                                            placeholder="Category to add"
                                            value={searchCategoryName}
                                            onChange={(event) =>
                                                setSearchCategoryName(event.target.value)
                                            }
                                            className="w-56"
                                        />
                                    )}
                                    <Input
                                        placeholder="Top k results"
                                        value={searchTopK}
                                        onChange={(event) => setSearchTopK(event.target.value)}
                                        className="w-32"
                                        inputMode="numeric"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSearchChats}
                                        disabled={isSearchingChats}
                                    >
                                        {isSearchingChats ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Searching
                                            </>
                                        ) : (
                                            "Search"
                                        )}
                                    </Button>
                                    {(isSearchMode || searchResultCount !== null) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearSearch}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    {isSearchMode && (
                                        <Badge variant="outline">
                                            Showing {chatData.length} result
                                            {chatData.length === 1 ? "" : "s"}
                                        </Badge>
                                    )}
                                </div>

                                {/* Filter Section */}
                                <div className="rounded-md border bg-blue-50/40">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="w-full justify-between p-3 h-auto"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span className="text-sm font-medium">Advanced Filters</span>
                                        </div>
                                        {showFilters ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                    {showFilters && (
                                        <div className="p-3 pt-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Input
                                                    placeholder="Username"
                                                    value={filterUsername}
                                                    onChange={(event) => setFilterUsername(event.target.value)}
                                                    className="w-32"
                                                />
                                                <Input
                                                    placeholder="Title contains"
                                                    value={filterTitle}
                                                    onChange={(event) => setFilterTitle(event.target.value)}
                                                    className="w-36"
                                                />
                                    <Select
                                        value={filterChatType}
                                        onValueChange={(value) => setFilterChatType(value === "all" ? "" : value)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Chat type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            <SelectItem value="User">User</SelectItem>
                                            <SelectItem value="Group">Group</SelectItem>
                                            <SelectItem value="Channel">Channel</SelectItem>
                                            <SelectItem value="Bot">Bot</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                                <Input
                                                    placeholder="Platform"
                                                    value={filterPlatform}
                                                    onChange={(event) => setFilterPlatform(event.target.value)}
                                                    className="w-28"
                                                />
                                                <Input
                                                    placeholder="Min participants"
                                                    value={filterMinParticipants}
                                                    onChange={(event) => setFilterMinParticipants(event.target.value)}
                                                    className="w-32"
                                                    inputMode="numeric"
                                                />
                                                <Input
                                                    placeholder="Max participants"
                                                    value={filterMaxParticipants}
                                                    onChange={(event) => setFilterMaxParticipants(event.target.value)}
                                                    className="w-32"
                                                    inputMode="numeric"
                                                />
                                                <Input
                                                    placeholder="Linked chat username"
                                                    value={filterLinkedChatUsername}
                                                    onChange={(event) => setFilterLinkedChatUsername(event.target.value)}
                                                    className="w-44"
                                                />
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Category name (optional)"
                                                        value={filterCategoryName}
                                                        onChange={(event) => setFilterCategoryName(event.target.value)}
                                                        list={filterCategoryOptionsId}
                                                        className="w-44"
                                                    />
                                                    <datalist id={filterCategoryOptionsId}>
                                                        {categories
                                                            .filter((category) => !!category.name)
                                                            .map((category) => (
                                                                <option key={category.id} value={category.name ?? ""} />
                                                            ))}
                                                    </datalist>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setFilterUsername("")
                                                        setFilterTitle("")
                                                        setFilterChatType("")
                                                        setFilterPlatform("")
                                                        setFilterMinParticipants("")
                                                        setFilterMaxParticipants("")
                                                        setFilterLinkedChatUsername("")
                                                        setFilterCategoryName("")
                                                        // Reset to first page with cleared filters
                                                        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
                                                        void fetchChatsPage(0, paginationState.pageSize, activeCategory)
                                                    }}
                                                >
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedIds.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 p-3">
                                        <Badge variant="secondary">
                                            {selectedIds.length} selected
                                        </Badge>
                                        <Input
                                            placeholder="Category name"
                                            value={bulkCategoryInput}
                                            onChange={(event) => setBulkCategoryInput(event.target.value)}
                                            list={bulkCategoryOptionsId}
                                            className="w-64"
                                        />
                                        <datalist id={bulkCategoryOptionsId}>
                                            {categories
                                                .filter((category) => !!category.name)
                                                .map((category) => (
                                                    <option key={category.id} value={category.name ?? ""} />
                                                ))}
                                        </datalist>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleBulkApplyCategory(selectedIds, () => {
                                                    // Clear persistent selection after applying
                                                    setPersistentSelectedIds(new Set())
                                                    table.resetRowSelection()
                                                })
                                            }
                                            disabled={
                                                !bulkCategoryInput.trim() ||
                                                isAddingBulkCategory ||
                                                isRemovingBulkCategory
                                            }
                                        >
                                            {isAddingBulkCategory ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Applying
                                                </>
                                            ) : (
                                                "Apply category"
                                            )}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                handleBulkRemoveCategory(selectedIds, () => {
                                                    // Clear persistent selection after removing
                                                    setPersistentSelectedIds(new Set())
                                                    table.resetRowSelection()
                                                })
                                            }
                                            disabled={
                                                !bulkCategoryInput.trim() ||
                                                isRemovingBulkCategory ||
                                                isAddingBulkCategory
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
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                // Select all chats matching current filters across all pages
                                                // This requires fetching all matching chats
                                                setIsSelectingAllFiltered(true)
                                                try {
                                                    const allMatchingIds = new Set<string>()
                                                    
                                                    // Start from page 0 and fetch all pages
                                                    let currentPage = 0
                                                    let hasMore = true
                                                    
                                                    while (hasMore) {
                                                        const filters = getCurrentFilters()
                                                        const effectiveCategoryName = filters.categoryName || activeCategory || undefined
                                                        const { categoryName: _, ...filtersWithoutCategory } = filters
                                                        
                                                        const { chats: pageChats, hasMore: pageHasMore } =
                                                            await serviceClientRef.current.getOrchestratorChatsPage({
                                                                pageIndex: currentPage,
                                                                pageSize: 100, // Use larger page size for efficiency
                                                                categoryName: effectiveCategoryName,
                                                                ...filtersWithoutCategory,
                                                            })
                                                        
                                                        pageChats.forEach((chat) => {
                                                            allMatchingIds.add(chat.id)
                                                        })
                                                        
                                                        hasMore = pageHasMore ?? false
                                                        currentPage++
                                                        
                                                        // Safety limit to prevent infinite loops
                                                        if (currentPage > 1000) {
                                                            break
                                                        }
                                                    }
                                                    
                                                    // Update persistent selection with all matching IDs
                                                    setPersistentSelectedIds((prev) => {
                                                        const newSet = new Set(prev)
                                                        allMatchingIds.forEach((id) => newSet.add(id))
                                                        return newSet
                                                    })
                                                    
                                                    toast.success(`Selected ${allMatchingIds.size} chat${allMatchingIds.size === 1 ? "" : "s"} matching current filters`)
                                                    
                                                    // Reload current page to show updated selection
                                                    await fetchChatsPage(paginationState.pageIndex, paginationState.pageSize, activeCategory)
                                                } catch (error) {
                                                    console.error("Failed to select all filtered chats:", error)
                                                    toast.error("Failed to select all filtered chats")
                                                } finally {
                                                    setIsSelectingAllFiltered(false)
                                                }
                                            }}
                                            disabled={isSelectingAllFiltered}
                                        >
                                            {isSelectingAllFiltered ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Selecting...
                                                </>
                                            ) : (
                                                "Select all filtered"
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // Clear all persistent selections
                                                setPersistentSelectedIds(new Set())
                                                table.resetRowSelection()
                                            }}
                                        >
                                            Clear selection
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )
                    }}
                    tableContainerClassName="max-h-[800px]"
                    rowClassName="min-h-[40px]"
                    onClickRow={(row) => {
                        router.push(`/orchestrator/chats/${row.id}`)
                    }}
                />
            </div>
        </div>
    )
})
