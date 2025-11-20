"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { CategoryRead, ChatRead, EchoMissionInput, ScenarioRead } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel } from "./mission-builder-utils"

export function EchoMissionBuilder({
    scenarios,
    categories,
    chats,
}: {
    scenarios: ScenarioRead[]
    categories: CategoryRead[]
    chats: ChatRead[]
}) {
    const [maximumRetries, setMaximumRetries] = useState(0)
    const [messageLink, setMessageLink] = useState("")
    const [messageLinkError, setMessageLinkError] = useState<string | null>(null)
    const [messageContent, setMessageContent] = useState<MessageWithMedia | null>(null)
    const [chatId, setChatId] = useState("")
    const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
    const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
    const [sendAtTriggerTime, setSendAtTriggerTime] = useState(false)
    const [triggerTime, setTriggerTime] = useState<Date | undefined>(undefined)
    const { onChangeMissionPayload } = useContext(MissionBuilderContext)

    // TODO: filter by chats with avatars
    const activeChats = chats.filter((chat) => chat.chat_type === "Group")
    const activeChatCategories = categories.filter(
        (category) => category.chat_count && category.chat_count > 0,
    )
    const activeProfileCategories = categories.filter(
        (category) => category.character_count && category.character_count > 0,
    )

    const validateMessageLink = (link: string): boolean => {
        if (!link.trim()) {
            setMessageLinkError("Message link is required")
            return false
        }

        // Pattern for private group/channel: https://t.me/c/[numbers]/[numbers]
        const privateGroupPattern = /^https:\/\/t\.me\/c\/\d+\/\d+$/

        // Pattern for public channel: https://t.me/[username]/[numbers]
        const publicChannelPattern = /^https:\/\/t\.me\/[a-zA-Z0-9_]+\/\d+$/

        if (privateGroupPattern.test(link) || publicChannelPattern.test(link)) {
            setMessageLinkError(null)
            return true
        } else {
            setMessageLinkError(
                "Invalid message link format. Expected formats: https://t.me/c/[group_id]/[message_id] or https://t.me/[username]/[message_id]",
            )
            return false
        }
    }

    const handleMessageLinkChange = (value: string) => {
        setMessageLink(value)
        if (value.trim()) {
            validateMessageLink(value)
        } else {
            setMessageLinkError(null)
        }
    }

    useEffect(() => {
        const payload: Partial<EchoMissionInput> = {}

        if (maximumRetries >= 0) {
            payload.max_retries = maximumRetries
        }

        if (chatId) {
            payload.target_group_id = chatId
        }

        if (sendAtTriggerTime) {
            payload.trigger_time = triggerTime?.toISOString()
        }

        payload.chats_categories =
            chatCategories.length > 0 ? chatCategories.map((c) => c.label) : []
        payload.characters_categories =
            profileCategories.length > 0 ? profileCategories.map((c) => c.label) : []

        if (messageLink || messageContent) {
            payload.message = {
                message_link: messageLink || undefined,
                message_content: messageContent
                    ? {
                          text: messageContent.text,
                          attachments: messageContent.media
                              ? [
                                    {
                                        url: messageContent.media.s3Uri,
                                        mime_type: messageContent.media.mimeType,
                                        name: messageContent.media.name,
                                    },
                                ]
                              : [],
                      }
                    : undefined,
            }
        }

        onChangeMissionPayload(payload as MissionInput<EchoMissionInput>)
    }, [
        messageLink,
        messageContent,
        maximumRetries,
        chatId,
        chatCategories,
        profileCategories,
        triggerTime,
        sendAtTriggerTime,
    ])

    const triggerTimeFromNow =
        triggerTime && triggerTime.getTime() > Date.now()
            ? new Intl.RelativeTimeFormat("en", { style: "long" }).format(
                  Math.round((triggerTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                  "day",
              )
            : undefined

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-8 p-2">
                <FieldWithLabel required label="Message link">
                    <div className="flex flex-col gap-2">
                        <InputWithLabel
                            placeholder="Enter the message link to echo (e.g., https://t.me/c/2066434601/182605)"
                            value={messageLink}
                            onChange={(e) => handleMessageLinkChange(e.target.value)}
                            className={messageLinkError ? "border-red-500" : ""}
                        />
                        {messageLinkError && (
                            <div className="text-sm text-red-500">{messageLinkError}</div>
                        )}
                        <div className="text-xs text-gray-500">
                            Supported formats:
                            <br />
                            • Private: https://t.me/c/[group_id]/[message_id]
                            <br />• Public: https://t.me/[username]/[message_id]
                        </div>
                    </div>
                </FieldWithLabel>

                <FieldWithLabel label="Message content (optional)">
                    <MessageBuilder
                        singleMessage
                        onUpdateMessages={(messages) => setMessageContent(messages[0] ?? null)}
                    />
                </FieldWithLabel>

                <FieldWithLabel label="Trigger time">
                    <div className="flex w-full flex-col gap-3">
                        <div className="flex flex-row gap-2">
                            <DateTimePicker
                                disabled={!sendAtTriggerTime}
                                onSelectDate={(value) => {
                                    logger.info("Changing trigger time", value)
                                    value.setMilliseconds(0)
                                    setTriggerTime(value)
                                }}
                            />
                            <div className="relative -top-1.5 ml-4 flex flex-row items-center gap-2 self-end">
                                <Checkbox
                                    checked={sendAtTriggerTime}
                                    onCheckedChange={(checked) =>
                                        setSendAtTriggerTime(
                                            checked === "indeterminate" ? false : checked,
                                        )
                                    }
                                />
                                <Label className="text-sm">Send at trigger time</Label>
                            </div>
                        </div>
                        <div className="pl-2 text-sm">{triggerTimeFromNow}</div>
                    </div>
                </FieldWithLabel>

                {activeChatCategories.length > 0 && (
                    <CategorySelector
                        categories={activeChatCategories}
                        label="Chat categories"
                        onChangeValue={(value) => setChatCategories(value)}
                    />
                )}

                <CategorySelector
                    categories={activeProfileCategories}
                    label="Avatar categories"
                    onChangeValue={(value) => setProfileCategories(value)}
                />

                <FieldWithLabel label="Maximum retries">
                    <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[maximumRetries]}
                        onValueChange={(value) => setMaximumRetries(value[0])}
                        className="w-96"
                    />
                </FieldWithLabel>
            </div>
        </div>
    )
}
