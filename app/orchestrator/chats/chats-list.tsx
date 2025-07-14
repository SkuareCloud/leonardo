"use client"

import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CategoryRead, ChatRead, ChatType, ChatView } from "@lib/api/orchestrator/types.gen"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useState } from "react"

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

export function ChatsList({ chats, allCategories }: { chats: ChatView[]; allCategories: CategoryRead[] }) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row">
        {chats && (
          <div className="flex flex-row gap-2">
            <Label>Category</Label>
            <Select
              value={activeCategory ?? undefined}
              onValueChange={value => {
                const url = new URL(window.location.href)
                url.searchParams.set("category", value)
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
                {allCategories.map(category => (
                  <SelectItem key={category.name} value={category.name ?? ""}>
                    {category.name}
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
          data={
            chats.filter(chat => {
              if (!activeCategory) {
                return true
              }
              if (!chat.categories) {
                return false
              }
              return chat.categories.some(category => category === activeCategory)
            }) satisfies ChatRow[]
          }
          header={({ table }) => {
            return (
              <div className="flex flex-row gap-2">
                <div>
                  <Input
                    placeholder="Filter by title..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={event => table.getColumn("title")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Filter by ID..."
                    value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
                    onChange={event => table.getColumn("id")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            )
          }}
          tableContainerClassName="max-h-[600px]"
          rowClassName="max-h-[40px]"
          onClickRow={row => {
            router.push(`/orchestrator/chats/${row.id}`)
          }}
        />
      </div>
    </div>
  )
}
