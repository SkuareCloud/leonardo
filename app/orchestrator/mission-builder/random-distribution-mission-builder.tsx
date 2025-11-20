"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { CategoryRead, ChatRead, RandomDistributionMissionInput } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { ChevronDown } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { ChatSelector } from "./chat-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel } from "./mission-builder-utils"

type ChatSelectionMode = "all" | "select"

export function RandomDistributionMissionBuilder({
    categories,
    chats,
}: {
    categories: CategoryRead[]
    chats: ChatRead[]
}) {
    const [maximumRetries, setMaximumRetries] = useState(0)
    const [messagesAmount, setMessagesAmount] = useState<number | string>(200)
    const [messagesAmountPerCharacter, setMessagesAmountPerCharacter] = useState<number | string>(5)
    const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
    const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
    const [additionalChats, setAdditionalChats] = useState<{ id: string; label: string }[]>([])
    const [chatSelectionMode, setChatSelectionMode] = useState<ChatSelectionMode>("all")

    const [startTime, setStartTime] = useState<Date | undefined>(() => {
        const now = new Date()
        const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
        utcNow.setMilliseconds(0)
        return utcNow
    })
    const [messages, setMessages] = useState<MessageWithMedia[]>([])
    const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false)
    const [maxMessagesPerChat, setMaxMessagesPerChat] = useState<number | string>(1)
    const [batchSize, setBatchSize] = useState<number | string>(10)
    const [batchInterval, setBatchInterval] = useState<number | string>(5)
    const [randomChoice, setRandomChoice] = useState(false)
    const [resetKey, setResetKey] = useState(0)
    const { onChangeMissionPayload } = useContext(MissionBuilderContext)

    // Initialize start time to current time and trigger DateTimePicker
    useEffect(() => {
        if (startTime) {
            // This will make the DateTimePicker show the current time
            const initialTime = new Date(startTime)
            initialTime.setMilliseconds(0)
            setStartTime(initialTime)
        }
    }, [])

    useEffect(() => {
        const payload: Partial<RandomDistributionMissionInput> = {}

        payload.max_retries = Math.max(0, maximumRetries)

        payload.start_time = startTime
            ? new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000).toISOString()
            : new Date().toISOString()

        payload.messages = messages.map((message) => ({
            text: message.text,
            attachments: message.media
                ? [
                      {
                          name: message.media.name,
                          url: message.media.s3Uri,
                          mime_type: message.media.mimeType,
                      },
                  ]
                : [],
        }))

        payload.messages_amount =
            typeof messagesAmount === "string" ? Number(messagesAmount) || 1000 : messagesAmount
        payload.messages_amount_per_character =
            typeof messagesAmountPerCharacter === "string"
                ? Number(messagesAmountPerCharacter) || 5
                : messagesAmountPerCharacter
        payload.max_messages_per_chat =
            typeof maxMessagesPerChat === "string"
                ? Number(maxMessagesPerChat) || 1
                : maxMessagesPerChat
        payload.batch_size = typeof batchSize === "string" ? Number(batchSize) || 10 : batchSize
        payload.batch_interval =
            typeof batchInterval === "string" ? Number(batchInterval) || 5 : batchInterval
        payload.random_choice = randomChoice

        if (chatSelectionMode === "all") {
            payload.chat_categories = []
            payload.additional_chats = []
        } else if (chatSelectionMode === "select") {
            payload.chat_categories =
                chatCategories.length > 0 ? chatCategories.map((c) => c.label) : []
            payload.additional_chats =
                additionalChats.length > 0 ? additionalChats.map((c) => c.id) : []
        }
        payload.characters_categories =
            profileCategories.length > 0 ? profileCategories.map((c) => c.label) : []

        onChangeMissionPayload(payload as MissionInput<RandomDistributionMissionInput>)
    }, [
        messages,
        maximumRetries,
        messagesAmount,
        messagesAmountPerCharacter,
        maxMessagesPerChat,
        batchSize,
        batchInterval,
        randomChoice,
        chatCategories,
        profileCategories,
        additionalChats,
        chatSelectionMode,
        startTime,
    ])

    const triggerTimeFromNow =
        startTime && startTime.getTime() > Date.now()
            ? new Intl.RelativeTimeFormat("en", { style: "long" }).format(
                  Math.round((startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                  "day",
              )
            : undefined

    const activeChatCategories = categories
    const activeProfileCategories = categories

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-8 p-2">
                {/* Messages and Chat Selection Side by Side */}
                <div className="flex flex-row gap-4">
                    {/* Messages Section */}
                    <div className="flex-1">
                        <MessageBuilder onUpdateMessages={(messages) => setMessages(messages)} />
                    </div>

                    {/* Chat Selection Section */}
                    <div className="flex-1">
                        <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
                            <div className="flex flex-col gap-3">
                                <div className="flex w-full justify-center">
                                    <Label className="text-base text-gray-700 md:text-sm">
                                        Chat Selection
                                    </Label>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="all-chats"
                                            name="chat-selection"
                                            value="all"
                                            checked={chatSelectionMode === "all"}
                                            onChange={() => setChatSelectionMode("all")}
                                            className="h-4 w-4"
                                        />
                                        <Label
                                            htmlFor="all-chats"
                                            className="text-base text-gray-700 md:text-sm"
                                        >
                                            Write to all chats
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="select-chats"
                                            name="chat-selection"
                                            value="select"
                                            checked={chatSelectionMode === "select"}
                                            onChange={() => setChatSelectionMode("select")}
                                            className="h-4 w-4"
                                        />
                                        <Label
                                            htmlFor="select-chats"
                                            className="text-base text-gray-700 md:text-sm"
                                        >
                                            Select chats
                                        </Label>
                                    </div>
                                </div>

                                {/* Conditional selectors based on mode */}
                                {chatSelectionMode === "select" && (
                                    <div className="mt-4 flex w-full flex-row gap-4">
                                        <div className="flex-1">
                                            <CategorySelector
                                                categories={activeChatCategories}
                                                label="Chat categories"
                                                onChangeValue={(value) => setChatCategories(value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <ChatSelector
                                                label="Target chats"
                                                writable
                                                onChangeValue={(value) => setAdditionalChats(value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Collapsible open={isAdvancedOptionsOpen} onOpenChange={setIsAdvancedOptionsOpen}>
                    <CollapsibleTrigger className="flex cursor-pointer items-center gap-2 hover:opacity-80">
                        <Label className="text-base font-semibold">Advanced Settings</Label>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOptionsOpen ? "rotate-180" : ""}`}
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-in slide-in-from-top-2 mt-4 duration-300">
                        <div className="flex flex-col gap-8 rounded-lg border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-6 backdrop-blur-sm dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30">
                            {/* Avatar Categories Section */}
                            <div className="flex flex-col gap-4">
                                <CategorySelector
                                    categories={activeProfileCategories}
                                    label="Avatar categories"
                                    onChangeValue={(value) => setProfileCategories(value)}
                                />
                            </div>

                            <InputWithLabel
                                label="Global messages amount"
                                type="number"
                                min="1"
                                value={messagesAmount}
                                onBlur={(e) => {
                                    const value = Number(e.target.value)
                                    if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                        setMessagesAmount(1000)
                                    }
                                }}
                                onChange={(e) => setMessagesAmount(e.target.value)}
                                className="w-28 max-w-28"
                            />
                            <InputWithLabel
                                label="Messages amount per avatar"
                                type="number"
                                min="1"
                                value={messagesAmountPerCharacter}
                                onBlur={(e) => {
                                    const value = Number(e.target.value)
                                    if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                        setMessagesAmountPerCharacter(5)
                                    }
                                }}
                                onChange={(e) => setMessagesAmountPerCharacter(e.target.value)}
                                className="w-28 max-w-28"
                            />
                            <InputWithLabel
                                label="Max messages per chat"
                                type="number"
                                min="1"
                                value={maxMessagesPerChat}
                                onBlur={(e) => {
                                    const value = Number(e.target.value)
                                    if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                        setMaxMessagesPerChat(1)
                                    }
                                }}
                                onChange={(e) => setMaxMessagesPerChat(e.target.value)}
                                className="w-28 max-w-28"
                            />
                            <InputWithLabel
                                label="Batch size"
                                type="number"
                                min="1"
                                value={batchSize}
                                onBlur={(e) => {
                                    const value = Number(e.target.value)
                                    if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                        setBatchSize(10)
                                    }
                                }}
                                onChange={(e) => setBatchSize(e.target.value)}
                                className="w-28 max-w-28"
                            />
                            <InputWithLabel
                                label="Batch interval (minutes)"
                                type="number"
                                min="1"
                                value={batchInterval}
                                onBlur={(e) => {
                                    const value = Number(e.target.value)
                                    if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                        setBatchInterval(5)
                                    }
                                }}
                                onChange={(e) => setBatchInterval(e.target.value)}
                                className="w-28 max-w-28"
                            />
                            <FieldWithLabel label="Random choice">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="random-choice"
                                        checked={randomChoice}
                                        onCheckedChange={(checked) => {
                                            setRandomChoice(
                                                checked === "indeterminate" ? false : checked,
                                            )
                                        }}
                                    />
                                    <Label htmlFor="random-choice" className="text-sm font-medium">
                                        Enable random character selection
                                    </Label>
                                </div>
                            </FieldWithLabel>
                            <FieldWithLabel required label="Start time">
                                <div className="flex w-full flex-col gap-3">
                                    <div className="flex flex-row items-center gap-2">
                                        <DateTimePicker
                                            key={resetKey}
                                            resetable
                                            onSelectDate={(value) => {
                                                logger.info("Changing trigger time", value)
                                                value.setMilliseconds(0)
                                                setStartTime(value)
                                            }}
                                        />
                                    </div>
                                    {triggerTimeFromNow && (
                                        <div className="pl-2 text-xs text-gray-600 dark:text-gray-400">
                                            {triggerTimeFromNow}
                                        </div>
                                    )}
                                </div>
                            </FieldWithLabel>
                            <FieldWithLabel label="Maximum retries">
                                <Slider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[maximumRetries]}
                                    onValueChange={(value) => setMaximumRetries(value[0])}
                                    className="w-96"
                                />
                            </FieldWithLabel>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    )
}
