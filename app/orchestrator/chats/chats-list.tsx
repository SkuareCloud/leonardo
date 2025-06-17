"use client"

import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CategoryWithChatCount, ChatWithCategory } from "@lib/api/models"
import { ChatRead, ChatType } from "@lib/api/orchestrator/types.gen"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"

const chatColumns: ColumnDef<ChatRead>[] = [
  {
    accessorKey: "title",
    header: "Title",
    size: 200,
    cell: ({ row }) => {
      const chat = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium">{chat.title || "Untitled"}</span>
          {chat.username && <span className="text-sm text-gray-500">@{chat.username}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "chat_type",
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
      const colors = typeColors[chat.chat_type || "Unknown"]
      return (
        <span>
          <Badge className={cn(colors.bg, colors.text)}>{chat.chat_type || "Unknown"}</Badge>
        </span>
      )
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original
      return <span>{chat.platform || "Unknown"}</span>
    },
  },
  {
    accessorKey: "platform_participants_count",
    header: "Participants",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original
      return (
        <div className="flex flex-col">
          <span>{chat.platform_participants_count?.toLocaleString() || "0"}</span>
          {chat.active_participants_count && (
            <span className="text-sm text-gray-500">{chat.active_participants_count.toLocaleString()} active</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "messages_count_last_month",
    header: "Activity",
    size: 150,
    cell: ({ row }) => {
      const chat = row.original
      return (
        <div className="flex flex-col">
          <span>{chat.messages_count_last_month?.toLocaleString() || "0"} messages</span>
          <span>{chat.replies_count_last_month?.toLocaleString() || "0"} replies</span>
          <span>{chat.forwards_count_last_month?.toLocaleString() || "0"} forwards</span>
        </div>
      )
    },
  },
  {
    accessorKey: "median_views",
    header: "Engagement",
    size: 150,
    cell: ({ row }) => {
      const chat = row.original
      return (
        <div className="flex flex-col">
          <span>{chat.median_views?.toLocaleString() || "0"} views/msg</span>
          <span>{chat.average_reactions?.toLocaleString() || "0"} reactions/msg</span>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original
      return <Badge variant="outline">{chat.category_id || "Uncategorized"}</Badge>
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    size: 200,
    cell: ({ row }) => {
      const chat = row.original
      return <span className="font-mono text-sm">{chat.id}</span>
    },
  },
]

export function ChatsList({
  chatsWithCategory,
  categoriesWithChatCount,
  category,
}: {
  chatsWithCategory: ChatWithCategory[]
  categoriesWithChatCount: CategoryWithChatCount[]
  category: string | null
  onChangeTab: (tab: string) => void
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(category || null)
  const data = useMemo(() => {
    if (!activeCategoryId || activeCategoryId === "all") {
      return chatsWithCategory
    }
    return chatsWithCategory
      .filter(chatWithCategory => chatWithCategory.category.id === activeCategoryId)
      .map(
        cat =>
          ({
            ...cat.chat,
            // patch the category name to appear as the name
            categoryName: cat.category.name,
          } as ChatRead),
      )
  }, [chatsWithCategory, activeCategoryId])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row">
        {data && (
          <div className="flex flex-row gap-2">
            <Label>Category</Label>
            <Select
              value={activeCategoryId ?? undefined}
              onValueChange={value => {
                const url = new URL(window.location.href)
                url.searchParams.set("category", value)
                setActiveCategoryId(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categoriesWithChatCount.map(chatWithCategory => (
                  <SelectItem key={chatWithCategory.category.id} value={chatWithCategory.category.id}>
                    {chatWithCategory.category.name} ({chatWithCategory.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={chatColumns}
          data={data as ChatRead[]}
          header={({ table }) => {
            return (
              <div>
                <Input
                  placeholder="Filter by title..."
                  value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                  onChange={event => table.getColumn("title")?.setFilterValue(event.target.value)}
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
