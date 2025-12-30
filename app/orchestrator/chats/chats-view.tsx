"use client"

import { TreeNode } from "@/components/tree"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CategoryRead, CategoryWithChatCount, ChatView } from "@lib/api/models"
import { Handle, Position } from "@xyflow/react"
import { FileDown, Loader2 } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { ChatsList, ChatsListHandle } from "./chats-list"

type ChatNodeData = {
    category: CategoryRead
    count: number
}

function ChatNode({ data }: { data: ChatNodeData }) {
    return (
        <div className="flex min-h-4 min-w-16 scale-100 items-center justify-center rounded-xl border-1 bg-white px-5 py-3 shadow-xl/5 transition-all hover:scale-105 hover:bg-gray-100/50 active:scale-95">
            <div className="flex items-center gap-2">
                <span className="mr-1 font-bold">{data.category.name}</span>{" "}
                <Badge variant="default">{data.count}</Badge>
            </div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

function generateTree(categoriesWithChatCount: CategoryWithChatCount[]): TreeNode<ChatNodeData> {
    const buildNode = (category: CategoryWithChatCount): TreeNode<ChatNodeData> | null => {
        const children = categoriesWithChatCount.filter(
            ({ category: c }) => c.parent_id === category.category.id,
        )
        return {
            id: category.category.id,
            type: "chatCategory",
            data: { category: category.category, count: category.count },
            children: children
                .map((child) => buildNode(child))
                .filter(Boolean) as TreeNode<ChatNodeData>[],
        }
    }

    // Find root category (the one without a parent)
    const rootCategory = categoriesWithChatCount.find((cat) => !cat.category.parent_id)
    if (!rootCategory) {
        throw new Error("No root category found")
    }

    return buildNode(rootCategory) as TreeNode<ChatNodeData>
}

type ChatsStats = {
    totalCount: number
    isSearchMode: boolean
}

export function ChatsView({
    initialChats,
    allCategories,
    initialPageSize,
    initialTotalCount,
}: {
    initialChats: ChatView[]
    allCategories: CategoryRead[]
    initialPageSize: number
    initialTotalCount?: number
}) {
    const chatsListRef = useRef<ChatsListHandle>(null)
    const [isExporting, setIsExporting] = useState(false)
    const [stats, setStats] = useState<ChatsStats>({
        totalCount: initialTotalCount ?? initialChats.length,
        isSearchMode: false,
    })

    const handleExport = async () => {
        if (!chatsListRef.current) {
            toast.error("Chats are still loading. Please try again.")
            return
        }
        setIsExporting(true)
        try {
            await chatsListRef.current.exportCurrentChatsToCsv()
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const handleStatsChange = useCallback((nextStats: ChatsStats) => {
        setStats(nextStats)
    }, [])

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    {stats.isSearchMode
                        ? `Showing ${stats.totalCount} search result${stats.totalCount === 1 ? "" : "s"}`
                        : `Showing ${stats.totalCount} total chat${stats.totalCount === 1 ? "" : "s"}`}
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export CSV
                        </>
                    )}
                </Button>
            </div>
            <ChatsList
                ref={chatsListRef}
                chats={initialChats}
                allCategories={allCategories}
                initialPageSize={initialPageSize}
                initialTotalCount={initialTotalCount}
                onStatsChange={handleStatsChange}
            />
        </div>
    )
}
