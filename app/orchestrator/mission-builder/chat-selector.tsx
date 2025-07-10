"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChatRead } from "@lib/api/orchestrator"
import { Loader2, PlusCircleIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { FieldWithLabel } from "./mission-builder-utils"

export function ChatSelector({
  header,
  label,
  required,
  onChangeValue,
}: {
  header?: React.ReactNode
  label: string
  required?: boolean
  onChangeValue?: (selected: { id: string; label: string }[]) => void
}) {
  const [selected, setSelected] = useState<{ id: string; label: string }[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [availableChats, setAvailableChats] = useState<ChatRead[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 50

  useEffect(() => {
    onChangeValue?.(selected)
  }, [selected, onChangeValue])

  const loadChats = async (page: number = 0, search: string = "", append: boolean = false) => {
    setLoading(true)
    try {
      const skip = page * pageSize
      const response = await fetch(`/api/orchestrator/chats?skip=${skip}&limit=${pageSize}`)
      if (!response.ok) {
        throw new Error(`Failed to load chats: ${response.statusText}`)
      }
      const chats: ChatRead[] = await response.json()
      
      // Filter chats based on search term
      const filteredChats = chats.filter((chat: ChatRead) => {
        const searchLower = search.toLowerCase()
        return (
          chat.username?.toLowerCase().includes(searchLower) ||
          chat.title?.toLowerCase().includes(searchLower) ||
          chat.platform_id?.toString().includes(searchLower)
        )
      })

      if (append) {
        setAvailableChats(prev => [...prev, ...filteredChats])
      } else {
        setAvailableChats(filteredChats)
      }
      
      setHasMore(chats.length === pageSize)
      setCurrentPage(page)
    } catch (error) {
      console.error("Failed to load chats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setIsAdding(true)
    if (availableChats.length === 0) {
      loadChats(0, searchTerm)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(0)
    loadChats(0, value)
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadChats(currentPage + 1, searchTerm, true)
    }
  }

  const handleChatSelect = (chatId: string) => {
    const chat = availableChats.find(c => {
      const id = c.username || c.platform_id?.toString() || c.id
      return id === chatId
    })
    
    if (chat) {
      const chatIdentifier = chat.username || chat.platform_id?.toString() || chat.id
      const displayName = chat.username || `Chat ${chat.platform_id}` || chat.id
      
      setSelected(prev => [
        ...prev,
        { id: chatIdentifier, label: displayName }
      ])
    }
    setIsAdding(false)
  }

  const availableChoices = availableChats
    .filter(chat => {
      const chatId = chat.username || chat.platform_id?.toString() || chat.id
      return !selected.some(s => s.id === chatId)
    })
    .map(chat => {
      const chatId = chat.username || chat.platform_id?.toString() || chat.id
      const displayName = chat.username || `Chat ${chat.platform_id}` || chat.id
      return {
        value: chatId,
        label: displayName,
      }
    })

  return (
    <FieldWithLabel label={label} required={required}>
      {header}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-4 select-none items-center">
          {selected.map(choice => (
            <TooltipProvider key={choice.id}>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="group bg-teal-50 text-teal-950 flex scale-100 hover:scale-105 transition-transform duration-300 items-center gap-1 px-4 py-1 text-[16px]"
                  >
                    {choice.label}
                    <div
                      className="px-2 pr-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => {
                        setSelected(selected.filter(c => c !== choice))
                      }}
                    >
                      <XIcon className="h-3 w-3 hover:text-destructive" />
                    </div>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10} className="z-20 bg-gray-50 px-6 py-2 rounded-md text-foreground">
                  {choice.id}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {!isAdding && (
            <div
              className="flex items-center justify-center p-2 cursor-pointer hover:text-primary text-muted-foreground"
              onClick={handleAddClick}
            >
              <PlusCircleIcon className="h-4 w-4" />
            </div>
          )}
          
          {isAdding && (
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
              </div>
              
              {loading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading chats...</span>
                </div>
              )}
              
              {!loading && availableChoices.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {availableChoices.map(choice => (
                    <div
                      key={choice.value}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleChatSelect(choice.value)}
                    >
                      {choice.label}
                    </div>
                  ))}
                  
                  {hasMore && (
                    <div className="p-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {!loading && availableChoices.length === 0 && availableChats.length === 0 && (
                <div className="text-sm text-gray-500 italic p-4 text-center">
                  No chats found. Try adjusting your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FieldWithLabel>
  )
} 