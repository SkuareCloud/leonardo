"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { CategoryRead, ChatRead } from "@lib/api/orchestrator"
import { useState } from "react"
import { AvatarsList } from "../../../avatars/avatars/avatars-list"

export function ChatView({
    chat,
    chatCategories,
    allCategories,
    avatars,
}: {
    chat: ChatRead
    allCategories: CategoryRead[]
    chatCategories: CategoryRead[]
    avatars: AvatarModelWithProxy[]
}) {
    const [categories, setCategories] = useState<CategoryRead[]>(chatCategories)
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Basic Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Username
                            </label>
                            <p className="text-sm">{chat.username || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Platform id
                            </label>
                            <p className="text-sm">{chat.platform_id || "N/A"}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Title
                            </label>
                            <p className="text-sm">{chat.title || "Untitled"}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                About
                            </label>
                            <p className="text-sm">{chat.about || "Untitled"}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Chat ID
                            </label>
                            <p className="font-mono text-sm">{chat.id}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Categories
                            </label>
                            <div className="mt-1 flex flex-wrap gap-1">
                                {categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {category.name || category.description || category.id}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm">
                                        No categories assigned
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Categories can be managed from the chat list.
                            </p>
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
                            <label className="text-muted-foreground text-sm font-medium">
                                Chat Type
                            </label>
                            <div className="mt-1">
                                <Badge variant="secondary">{chat.chat_type || "Unknown"}</Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Participants
                            </label>
                            <p className="text-sm">{chat.participants_count || 0}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Messages last month
                            </label>
                            <p className="text-sm">{chat.messages_count_last_month || 0}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Forwarded from this chat last month
                            </label>
                            <p className="text-sm">{chat.forward_from_count_last_month || 0}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Forwarded to this chat last month
                            </label>
                            <p className="text-sm">{chat.forward_to_count_last_month || 0}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Can Forward from
                            </label>
                            <p className="text-sm">{chat.noforwards ? "No" : "Yes"}</p>
                        </div>
                        <div>
                            <label className="text-muted-foreground text-sm font-medium">
                                Linked chat
                            </label>
                            <p className="text-sm">{chat.linked_chat_username || "N/A"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <AvatarsList avatars={avatars} allCategories={allCategories} />
        </div>
    )
}
