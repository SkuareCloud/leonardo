"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryRead, CharacterRead, ChatRead } from "@lib/api/orchestrator"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { useState } from "react"
import { toast } from "sonner"
import { CharactersList } from "../../characters/characters-list"
import { CategorySelector } from "../../mission-builder/category-selector"

export function ChatView({
  chat,
  chatCategories,
  allCategories,
  characters,
}: {
  chat: ChatRead
  allCategories: CategoryRead[]
  chatCategories: CategoryRead[]
  characters: CharacterRead[]
}) {
  const [categories, setCategories] = useState<CategoryRead[]>(chatCategories)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-sm">{chat.title || "Untitled"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-sm">{chat.username || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Chat ID</label>
              <p className="text-sm font-mono">{chat.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Categories</label>
              <div>
                <CategorySelector
                  existingCategories={categories || []}
                  categories={allCategories}
                  onChangeValue={async selectedCategories => {
                    const newCategories = selectedCategories.filter(c => !categories.some(cat => cat.id === c.id))
                    const removedCategories = categories.filter(c => !selectedCategories.some(cat => cat.id === c.id))
                    console.log(
                      `Updating categories for chat ${chat.id}: new categories - ${newCategories
                        .map(c => c.id)
                        .join(", ")}; removed categories - ${removedCategories.map(c => c.id).join(", ")}`,
                    )
                    await new ServiceBrowserClient().updateChatCategories(
                      chat.id,
                      newCategories.map(c => c.id),
                      removedCategories.map(c => c.id),
                    )
                    const newSelectedCategories = allCategories.filter(cat =>
                      selectedCategories.some(c => c.id === cat.id),
                    )
                    setCategories(newSelectedCategories)
                    toast.success(
                      `Updated categories for chat '${chat.id}': ${newSelectedCategories
                        .map(c => c.name ?? c.description ?? c.id)
                        .join(", ")}`,
                    )
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type & Platform Card */}
        <Card>
          <CardHeader>
            <CardTitle>Type & Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Chat Type</label>
              <div className="mt-1">
                <Badge variant="secondary">{chat.chat_type || "Unknown"}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Platform</label>
              <p className="text-sm">{chat.platform || "Unknown"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Participants</label>
              <p className="text-sm">{chat.participants_count || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <CharactersList characters={characters} />
    </div>
  )
}
