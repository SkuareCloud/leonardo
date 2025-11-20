"use client"

import { CreateCategoryDialog } from "@/components/create-category-dialog"
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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CategoryRead, ChatRead, ChatType, ChatView } from "@lib/api/orchestrator/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
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
}

const chatColumns: ColumnDef<ChatRow>[] = [
    {
        accessorKey: "username",
        header: "Username",
        size: 200,
        // Add custom filter function that checks both username and platform_id
        filterFn: (row, columnId, filterValue) => {
            const chat = row.original
            const searchValue = filterValue.toLowerCase()
            const username = chat.username?.toLowerCase() || ""
            const platformId = chat.platform_id?.toString().toLowerCase() || ""

            return username.includes(searchValue) || platformId.includes(searchValue)
        },
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{chat.username || chat.platform_id}</span>
                    {/* {chat.username && <span className="text-sm text-gray-500">@{chat.username}</span>} */}
                </div>
            )
        },
    },
    {
        accessorKey: "title",
        header: "Title",
        size: 200,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{chat.title || "Untitled"}</span>
                    {chat.username && (
                        <span className="text-sm text-gray-500">@{chat.username}</span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        size: 100,
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
                <span>
                    <Badge className={cn(colors.bg, colors.text)}>{chat.type || "Unknown"}</Badge>
                </span>
            )
        },
    },
    {
        accessorKey: "participants_count",
        header: "participants_count",
        size: 200,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col">
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
        size: 200,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{chat.system_chat_members?.length || 0}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "linked_chat_username",
        header: "Linked chat (discussion or channel)",
        size: 200,
        cell: ({ row }) => {
            const chat = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">
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
        size: 100,
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

export const ChatsList = forwardRef<ChatsListHandle, ChatsListProps>(function ChatsList(
    { chats, allCategories },
    ref,
) {
    const router = useRouter()
    const bulkCategoryOptionsId = "chat-bulk-category-options"
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [masterChats, setMasterChats] = useState<ChatView[]>(chats)
    const [chatData, setChatData] = useState<ChatView[]>(chats)
    const [categories, setCategories] = useState<CategoryRead[]>(allCategories)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchMode, setIsSearchMode] = useState(false)
    const [isSearchingChats, setIsSearchingChats] = useState(false)
    const [searchResultCount, setSearchResultCount] = useState<number | null>(null)
    const [searchMode, setSearchMode] = useState<"topics" | "topicsAddToCategory">("topics")
    const [searchCategoryName, setSearchCategoryName] = useState("")
    const [searchTopK, setSearchTopK] = useState("")
    const [bulkCategoryInput, setBulkCategoryInput] = useState("")
    const [isAddingBulkCategory, setIsAddingBulkCategory] = useState(false)
    const [isRemovingBulkCategory, setIsRemovingBulkCategory] = useState(false)
    const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
    const [categorySelectValue, setCategorySelectValue] = useState("All")
    const filteredChats = useMemo(() => {
        return chatData.filter((chat) => {
            if (!activeCategory) {
                return true
            }
            if (!chat.categories) {
                return false
            }
            return chat.categories.some((category) => category === activeCategory)
        })
    }, [activeCategory, chatData])

    useEffect(() => {
        setMasterChats(chats)
        if (!isSearchMode) {
            setChatData(chats)
        }
    }, [chats, isSearchMode])

    useEffect(() => {
        setCategories(allCategories)
    }, [allCategories])

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

    const syncChatCategoryState = (chatId: string, updatedCategoryNames: string[]) => {
        setChatData((prevChats) =>
            prevChats.map((prevChat) =>
                prevChat.id === chatId ? { ...prevChat, categories: updatedCategoryNames } : prevChat,
            ),
        )
        setMasterChats((prevChats) =>
            prevChats.map((prevChat) =>
                prevChat.id === chatId ? { ...prevChat, categories: updatedCategoryNames } : prevChat,
            ),
        )
    }

    const removeChatFromState = (chatId: string) => {
        setChatData((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
        setMasterChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
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
        const match = summary.match(/Top topics:\s*(\[[^\]]*\])/i)
        if (match && match[1]) {
            return match[1]
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
            const client = new ServiceBrowserClient()

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
        const client = new ServiceBrowserClient()
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
                    const updatedCategoryNames = existingCategories.filter((existing) => {
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
            setChatData(masterChats)
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
            if (isAddMode) {
                params.set("category_name", searchCategoryName.trim())
            }
            if (typeof topkNumber === "number") {
                params.set("topk", topkNumber.toString())
            }

            const response = await fetch(`/api/orchestrator/chats/search?${params.toString()}`)
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
        setChatData(masterChats)
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
                                            await new ServiceBrowserClient().updateChatCategories(
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
                                                await new ServiceBrowserClient().updateChatCategories(
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
        ...chatColumns.slice(5), // Include remaining columns (system_chat_members, linked_chat_username, id)
        {
            id: "actions",
            header: "Actions",
            size: 120,
            enableSorting: false,
            cell: ({ row }) => {
                const chat = row.original
                const chatLabel = chat.title || chat.username || chat.id
                return (
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className="flex justify-end"
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row gap-2">
                    <Label>Category</Label>
                    <Select
                        value={categorySelectValue}
                        onValueChange={(value) => {
                            setCategorySelectValue(value)
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
                                <SelectItem key={category.id} value={category.name ?? category.id}>
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
            <div className="flex flex-col gap-4">
                <DataTable
                    columns={columnsWithCategorySelector}
                    data={filteredChats.map(mapChatViewToRow)}
                    enableRowSelection
                    paginationPosition="top"
                    header={({ table }) => {
                        const selectedRows = table.getFilteredSelectedRowModel().rows
                        const selectedIds = selectedRows.map((row) => row.original.id)
                        return (
                            <div className="flex w-full flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    <div>
                                        <Input
                                            placeholder="Filter by username or platform ID..."
                                            value={
                                                (table
                                                    .getColumn("username")
                                                    ?.getFilterValue() as string) ?? ""
                                            }
                                            onChange={(event) =>
                                                table
                                                    .getColumn("username")
                                                    ?.setFilterValue(event.target.value)
                                            }
                                            className="max-w-sm"
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            placeholder="Search title: key words"
                                            value={
                                                (table
                                                    .getColumn("title")
                                                    ?.getFilterValue() as string) ?? ""
                                            }
                                            onChange={(event) =>
                                                table
                                                    .getColumn("title")
                                                    ?.setFilterValue(event.target.value)
                                            }
                                            className="max-w-sm"
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            value={
                                                (table.getColumn("type")?.getFilterValue() as string) ??
                                                ""
                                            }
                                            onValueChange={(value) =>
                                                table
                                                    .getColumn("type")
                                                    ?.setFilterValue(value === "All" ? "" : value)
                                            }
                                        >
                                            <SelectTrigger className="max-w-sm">
                                                <SelectValue placeholder="Filter by Chat type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All</SelectItem>
                                                <SelectItem value="User">User</SelectItem>
                                                <SelectItem value="Group">Group</SelectItem>
                                                <SelectItem value="Channel">Channel</SelectItem>
                                                <SelectItem value="Bot">Bot</SelectItem>
                                                <SelectItem value="Unknown">Unknown</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
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
                                    {searchResultCount !== null && (
                                        <Badge variant="outline">
                                            Showing {searchResultCount} result
                                            {searchResultCount === 1 ? "" : "s"}
                                        </Badge>
                                    )}
                                </div>
                                {selectedRows.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 p-3">
                                        <Badge variant="secondary">
                                            {selectedRows.length} selected
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
                                            onClick={() => table.toggleAllRowsSelected(true)}
                                        >
                                            Select filtered
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
