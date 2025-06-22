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
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

interface ChatRow {
  title: string
  username: string
  type: ChatType
  platform: string
  participants: number
  categories: string[]
  id: string
  original: ChatRead
}

const chatColumns: ColumnDef<ChatRow>[] = [
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
    accessorKey: "category",
    header: "Category",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original
      return (
        <ul>
          {chat.categories &&
            chat.categories.map(category => (
              <li key={category}>
                <Badge variant="outline">{category}</Badge>
              </li>
            ))}
        </ul>
      )
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
  const router = useRouter()
  const [activeCategoryId, setActiveCategoryId] = useState(category || null)
  const data = useMemo(() => {
    if (!activeCategoryId || activeCategoryId === "all") {
      return chatsWithCategory.map(cat => {
        const categories = categoriesWithChatCount
          .filter(c => c.category.id === cat.category.id)
          .map(cat => cat.category.name)
        return {
          ...cat.chat,
          // patch the category name to appear as the name
          categories: categories,
        } as ChatRead
      })
    }
    const categories = categoriesWithChatCount
      .filter(c => c.category.id === activeCategoryId)
      .map(cat => cat.category.name)
    return chatsWithCategory
      .filter(chatWithCategory => chatWithCategory.category.id === activeCategoryId)
      .map(
        cat =>
          ({
            ...cat.chat,
            // patch the category name to appear as the name
            categories: categories,
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
          onClickRow={row => {
            router.push(`/orchestrator/chats/${row.id}`)
          }}
        />
      </div>
    </div>
  )
}
