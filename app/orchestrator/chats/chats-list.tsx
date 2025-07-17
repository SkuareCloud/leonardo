"use client"

import { CreateCategoryDialog } from "@/components/create-category-dialog"
import { DataTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CategoryRead, ChatRead, ChatType, ChatView } from "@lib/api/orchestrator/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
  system_chat_members?: string[]
  categories: string[]
  id: string
  original: ChatRead
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
      const username = chat.username?.toLowerCase() || ''
      const platformId = chat.platform_id?.toString().toLowerCase() || ''
      
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
          {chat.username && <span className="text-sm text-gray-500">@{chat.username}</span>}
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
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {chat.categories &&
            chat.categories.map(category => (
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
          <span className="font-medium">{chat.linked_chat_username || "None"}</span>
        </div>
      )
    },
  }
]

export function ChatsList({ chats, allCategories }: { chats: ChatView[]; allCategories: CategoryRead[] }) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [chatData, setChatData] = useState<ChatView[]>(chats)
  const [categories, setCategories] = useState<CategoryRead[]>(allCategories)

  const handleCategoryCreated = (newCategory: CategoryRead) => {
    setCategories(prev => [...prev, newCategory])
    toast.success(`Created category: ${newCategory.name}`)
  }

  const handleCategoryDeleted = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    // If the deleted category was the active filter, clear it
    if (activeCategory) {
      const deletedCategory = categories.find(cat => cat.id === categoryId)
      if (deletedCategory && deletedCategory.name === activeCategory) {
        setActiveCategory(null)
      }
    }
    toast.success(`Category deleted successfully`)
  }

  // Function to map ChatView to ChatRow
  const mapChatViewToRow = (chat: ChatView): ChatRow => ({
    title: chat.title || '',
    about: chat.about || '',
    username: chat.username || undefined,
    platform_id: chat.platform_id || undefined,
    type: chat.chat_type || 'Unknown',
    platform: '', // ChatView doesn't have platform property
    participants_count: chat.participants_count || undefined,
    linked_chat_username: chat.linked_chat_username || undefined,
    system_chat_members: chat.system_chat_members,
    categories: chat.categories || [],
    id: chat.id,
    original: chat as any // Cast since ChatView doesn't have created_at/updated_at
  })

  // Create columns with access to allCategories
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
        const chatCategories = categories.filter(cat => 
          chat.categories?.some(chatCat => chatCat === cat.name || chatCat === cat.id)
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
              onChangeValue={async (selectedCategories: { id: string; label: string }[]) => {
                const newCategories = selectedCategories.filter((c: { id: string; label: string }) => 
                  !chatCategories.some((cat: CategoryRead) => cat.id === c.id)
                )
                const removedCategories = chatCategories.filter((c: CategoryRead) => 
                  !selectedCategories.some((cat: { id: string; label: string }) => cat.id === c.id)
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
                      console.error(`Failed to add category ${newCategory.id} to chat ${chat.id}:`, error)
                      throw error
                    }
                  }
                  
                  // Remove categories - check if they exist using the category ID
                  for (const removedCategory of removedCategories) {
                    // Only remove if the category is actually associated with the chat
                    if (chatCategories.some(cat => cat.id === removedCategory.id)) {
                      try {
                        await new ServiceBrowserClient().updateChatCategories(
                          chat.id,
                          [],
                          [removedCategory.id],
                        )
                      } catch (error) {
                        console.error(`Failed to remove category ${removedCategory.id} from chat ${chat.id}:`, error)
                        // Don't throw here - continue with other operations
                        toast.error(`Failed to remove category ${removedCategory.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                      }
                    } else {
                      console.log(`Skipping removal of category ${removedCategory.id} as it's not associated with chat ${chat.id}`)
                    }
                  }
                  
                  const updatedCategoryNames = selectedCategories.map((c: { id: string; label: string }) => c.label)
                  
                  // Update local state
                  setChatData(prevChats => 
                    prevChats.map(prevChat => 
                      prevChat.id === chat.id 
                        ? { ...prevChat, categories: updatedCategoryNames }
                        : prevChat
                    )
                  )
                  
                  toast.success(
                    `Updated categories for chat '${chat.title || chat.id}': ${updatedCategoryNames.join(", ")}`,
                  )
                } catch (error) {
                  console.error('Category update error:', error)
                  toast.error(`Failed to update categories: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
              }}
            />
          </div>
        )
      },
    },
    ...chatColumns.slice(5), // Include remaining columns (system_chat_members, linked_chat_username, id)
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
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
              {categories.map(category => (
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
      <div className="flex flex-col gap-4">
        <DataTable
          columns={columnsWithCategorySelector}
          data={
            chatData.filter(chat => {
              if (!activeCategory) {
                return true
              }
              if (!chat.categories) {
                return false
              }
              return chat.categories.some(category => category === activeCategory)
            }).map(mapChatViewToRow)
          }
          header={({ table }) => {
            return (
              <div className="flex flex-row gap-2">
                <div>
                  <Input
                    placeholder="Filter by username or platform ID..."
                    value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
                    onChange={event => table.getColumn("username")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Search title: key words"
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={event => table.getColumn("title")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Select
                    value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
                    onValueChange={value => table.getColumn("type")?.setFilterValue(value === "All" ? "" : value)}
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
            )
          }}
          tableContainerClassName="max-h-[800px]"
          rowClassName="min-h-[40px]"
          onClickRow={row => {
            router.push(`/orchestrator/chats/${row.id}`)
          }}
        />
      </div>
    </div>
  )
}
