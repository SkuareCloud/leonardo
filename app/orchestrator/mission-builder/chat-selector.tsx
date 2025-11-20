"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChatRead } from "@lib/api/orchestrator"
import { Loader2, PlusCircleIcon, Search, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FieldWithLabel } from "./mission-builder-utils"

export function ChatSelector({
    header,
    label,
    required,
    writable,
    onChangeValue,
}: {
    header?: React.ReactNode
    label: string
    required?: boolean
    writable?: boolean
    onChangeValue?: (selected: { id: string; label: string }[]) => void
}) {
    const [selected, setSelected] = useState<{ id: string; label: string }[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [searchResults, setSearchResults] = useState<ChatRead[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isImporting, setIsImporting] = useState(false)
    const [cachedChats, setCachedChats] = useState<ChatRead[] | null>(null)

    useEffect(() => {
        onChangeValue?.(selected)
    }, [selected, onChangeValue])

    const loadChats = async (): Promise<ChatRead[]> => {
        if (cachedChats) {
            return cachedChats
        }
        const params = new URLSearchParams()
        params.set("limit", "0")
        if (writable) {
            params.set("writable", "true")
        }
        const response = await fetch(`/api/orchestrator/chats?${params.toString()}`)
        if (!response.ok) {
            throw new Error("Failed to fetch chats")
        }
        const data: ChatRead[] = await response.json()
        setCachedChats(data)
        return data
    }

    const performSearch = async (term: string) => {
        if (term.trim() === "") {
            setSearchResults([])
            return
        }

        setLoading(true)
        try {
            const chats = await loadChats()
            const normalized = term.toLowerCase()
            const filtered = chats.filter((chat) => {
                const fields = [
                    chat.username,
                    chat.title,
                    chat.about,
                    chat.id,
                    chat.platform_id ? chat.platform_id.toString() : "",
                ]
                return fields.some((field) => field?.toLowerCase().includes(normalized))
            })
            setSearchResults(filtered)
        } catch (error) {
            console.error("Search failed:", error)
            setSearchResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        performSearch(value)
    }

    const handleImportChat = async () => {
        const identifier = searchTerm.trim()
        if (!identifier) {
            toast.error("Enter a username or platform ID to import.")
            return
        }
        setIsImporting(true)
        try {
            const response = await fetch("/api/orchestrator/chats/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier }),
            })
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || "Failed to import chat")
            }
            const createdChat = (await response.json()) as ChatRead
            setSearchResults((prev) => {
                const filtered = prev.filter((chat) => chat.id !== createdChat.id)
                return [createdChat, ...filtered]
            })
            setCachedChats((prev) => {
                if (!prev) return [createdChat]
                const filtered = prev.filter((chat) => chat.id !== createdChat.id)
                return [createdChat, ...filtered]
            })
            toast.success(
                `Imported chat ${createdChat.username || createdChat.title || createdChat.id}`,
            )
        } catch (error) {
            toast.error(
                `Failed to import chat: ${error instanceof Error ? error.message : "Unknown error"}`,
            )
        } finally {
            setIsImporting(false)
        }
    }

    const handleChatSelect = (chatId: string) => {
        const chat = searchResults.find((c) => c.id === chatId)

        if (chat) {
            const chatIdentifier = chat.id
            const displayName = chat.username || `Chat ${chat.platform_id}`

            setSelected((prev) => [...prev, { id: chatIdentifier, label: displayName }])
        }
        setIsAdding(false)
        setSearchTerm("")
        setSearchResults([])
    }

    const availableChoices = searchResults
        .filter((chat) => {
            const chatId = chat.id
            return !selected.some((s) => s.id === chatId)
        })
        .map((chat) => {
            const chatId = chat.id
            const displayName = chat.username || chat.platform_id
            return {
                value: chatId,
                label: displayName,
                chat: chat,
            }
        })

    return (
        <FieldWithLabel label={label} required={required}>
            {header}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-4 select-none">
                    {selected.map((choice) => (
                        <TooltipProvider key={choice.id}>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="secondary"
                                        className="group flex scale-100 items-center gap-1 bg-teal-50 px-4 py-1 text-[16px] text-teal-950 transition-transform duration-300 hover:scale-105"
                                    >
                                        {choice.label}
                                        <div
                                            className="cursor-pointer px-2 pr-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
                                            onClick={() => {
                                                setSelected(selected.filter((c) => c !== choice))
                                            }}
                                        >
                                            <XIcon className="hover:text-destructive h-3 w-3" />
                                        </div>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    sideOffset={10}
                                    className="text-foreground z-20 rounded-md bg-gray-50 px-6 py-2"
                                >
                                    {choice.id}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}

                    {!isAdding && (
                        <div
                            className="hover:text-primary text-muted-foreground flex cursor-pointer items-center justify-center p-2"
                            onClick={() => setIsAdding(true)}
                        >
                            <PlusCircleIcon className="h-4 w-4" />
                        </div>
                    )}

                    {isAdding && (
                        <div className="flex w-full max-w-md flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Search by username or platform ID..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsAdding(false)
                                        setSearchTerm("")
                                        setSearchResults([])
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>

                            {loading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="ml-2">Searching...</span>
                                </div>
                            )}

                            {!loading &&
                                searchTerm.trim() !== "" &&
                                availableChoices.length === 0 && (
                                    <div className="p-4 text-center text-sm text-gray-500 italic">
                                        No chats found for "{searchTerm}"
                                        <div className="mt-1 text-xs">
                                            Try searching by username or platform ID
                                        </div>
                                        <Button
                                            size="sm"
                                            className="mt-3"
                                            onClick={handleImportChat}
                                            disabled={isImporting}
                                        >
                                            {isImporting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                "Find via Mystique"
                                            )}
                                        </Button>
                                        <div className="mt-1 text-[11px] text-gray-400">
                                            Automatically imports the chat into the orchestrator if
                                            found.
                                        </div>
                                    </div>
                                )}

                            {!loading && searchTerm.trim() === "" && (
                                <div className="p-4 text-center text-sm text-gray-500 italic">
                                    <Search className="mx-auto mb-2 h-4 w-4" />
                                    Start typing to search for chats
                                    <div className="mt-1 text-xs">
                                        Search by username or platform ID
                                    </div>
                                </div>
                            )}

                            {availableChoices.length > 0 && (
                                <div className="max-h-48 overflow-y-auto rounded-md border">
                                    {availableChoices.map((choice) => (
                                        <div
                                            key={choice.value}
                                            className="cursor-pointer border-b px-3 py-2 last:border-b-0 hover:bg-gray-50"
                                            onClick={() => handleChatSelect(choice.value)}
                                        >
                                            <div className="flex flex-col">
                                                <div className="font-medium">{choice.label}</div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {choice.chat.platform_id} | Username:{" "}
                                                    {choice.chat.username || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {availableChoices.length > 0 && (
                                <div className="p-1 text-center text-xs text-gray-500">
                                    {availableChoices.length} result
                                    {availableChoices.length !== 1 ? "s" : ""} found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </FieldWithLabel>
    )
}
