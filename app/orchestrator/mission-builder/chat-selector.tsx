"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChatRead } from "@lib/api/orchestrator"
import { Loader2, PlusCircleIcon, Search, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
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

  useEffect(() => {
    onChangeValue?.(selected)
  }, [selected, onChangeValue])

  const performSearch = async (term: string) => {
    if (term.trim() === "") {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      let url = `/api/orchestrator/chats/search/?q=${encodeURIComponent(term)}`
      if (writable) {
        url += "&writable=true"
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const results: ChatRead[] = await response.json()
        setSearchResults(results)
      } else {
        console.error("Search failed:", response.status, response.statusText)
        setSearchResults([])
      }
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

  const handleChatSelect = (chatId: string) => {
    const chat = searchResults.find(c => c.id === chatId)
    
    if (chat) {
      const chatIdentifier = chat.id
      const displayName = chat.username || `Chat ${chat.platform_id}`
      
      setSelected(prev => [
        ...prev,
        { id: chatIdentifier, label: displayName }
      ])
    }
    setIsAdding(false)
    setSearchTerm("")
    setSearchResults([])
  }

  const availableChoices = searchResults
    .filter(chat => {
      const chatId = chat.id
      return !selected.some(s => s.id === chatId)
    })
    .map(chat => {
      const chatId = chat.id
      const displayName = chat.username || chat.platform_id
      return {
        value: chatId,
        label: displayName,
        chat: chat
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
              onClick={() => setIsAdding(true)}
            >
              <PlusCircleIcon className="h-4 w-4" />
            </div>
          )}
          
          {isAdding && (
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              
              {!loading && searchTerm.trim() !== "" && availableChoices.length === 0 && (
                <div className="text-sm text-gray-500 italic p-4 text-center">
                  No chats found for "{searchTerm}"
                  <div className="text-xs mt-1">
                    Try searching by username or platform ID
                  </div>
                </div>
              )}
              
              {!loading && searchTerm.trim() === "" && (
                <div className="text-sm text-gray-500 italic p-4 text-center">
                  <Search className="h-4 w-4 mx-auto mb-2" />
                  Start typing to search for chats
                  <div className="text-xs mt-1">
                    Search by username or platform ID
                  </div>
                </div>
              )}
              
              {availableChoices.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {availableChoices.map(choice => (
                    <div
                      key={choice.value}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleChatSelect(choice.value)}
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{choice.label}</div>
                        <div className="text-xs text-gray-500">
                          ID: {choice.chat.platform_id} | Username: {choice.chat.username || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {availableChoices.length > 0 && (
                <div className="text-xs text-gray-500 text-center p-1">
                  {availableChoices.length} result{availableChoices.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FieldWithLabel>
  )
} 