"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { MissionInput } from "@lib/api/models"
import { AllocateProfilesGroupsMissionInput, CategoryRead } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { ChatSelector } from "./chat-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel } from "./mission-builder-utils"

export function AllocateProfilesGroupsMissionBuilder({
    categories,
}: {
    categories: CategoryRead[]
}) {
    const [characterCategories, setCharacterCategories] = useState<{ id: string; label: string }[]>(
        [],
    )
    const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
    const [additionalChats, setAdditionalChats] = useState<{ id: string; label: string }[]>([])
    const [diversifyChats, setDiversifyChats] = useState(false)
    const [startTime, setStartTime] = useState<Date | undefined>(() => {
        const now = new Date()
        const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
        utcNow.setMilliseconds(0)
        return utcNow
    })
    const [endTime, setEndTime] = useState<Date | undefined>(() => {
        const now = new Date()
        const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
        utcNow.setMilliseconds(0)
        return utcNow
    })
    const [planningTimeout, setPlanningTimeout] = useState<number | string>(3600) // 1 hour default
    const [batchSize, setBatchSize] = useState<number | string>(10)
    const [batchInterval, setBatchInterval] = useState<number | string>(15)
    const { onChangeMissionPayload } = useContext(MissionBuilderContext)
    const [resetKey, setResetKey] = useState(0)

    const activeCharacterCategories = categories.filter(
        (category) => category.character_count && category.character_count > 0,
    )
    const activeChatCategories = categories.filter(
        (category) => category.chat_count && category.chat_count > 0,
    )

    useEffect(() => {
        const payload: Partial<AllocateProfilesGroupsMissionInput> = {}

        if (characterCategories.length > 0) {
            payload.characters_categories = characterCategories.map((c) => c.label)
        }

        if (chatCategories.length > 0) {
            payload.chat_categories = chatCategories.map((c) => c.label)
        }

        if (diversifyChats) {
            payload.diversify_chats = diversifyChats
        }

        if (startTime) {
            payload.start_time = startTime.toISOString()
        }

        if (endTime) {
            payload.end_time = endTime.toISOString()
        }

        if (planningTimeout) {
            payload.planning_timeout =
                typeof planningTimeout === "string"
                    ? Number(planningTimeout) || 3600
                    : planningTimeout
        }

        if (additionalChats) {
            payload.additional_chats = additionalChats.map((c) => c.id)
        }

        payload.batch_size = typeof batchSize === "string" ? Number(batchSize) || 10 : batchSize
        payload.batch_interval =
            typeof batchInterval === "string" ? Number(batchInterval) || 15 : batchInterval

        onChangeMissionPayload(payload as MissionInput<AllocateProfilesGroupsMissionInput>)
    }, [
        characterCategories,
        chatCategories,
        additionalChats,
        diversifyChats,
        startTime,
        endTime,
        planningTimeout,
        batchSize,
        batchInterval,
    ])

    const startTimeFromNow =
        startTime && startTime.getTime() > Date.now()
            ? new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000).toISOString()
            : new Date().toISOString()

    const endTimeFromNow =
        endTime && endTime.getTime() > Date.now()
            ? new Date(endTime.getTime() - endTime.getTimezoneOffset() * 60000).toISOString()
            : new Date().toISOString()

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
                <div className="flex flex-col gap-3">
                    <h3 className="text-center text-lg font-medium">Category Selection</h3>
                    <div className="flex flex-row gap-18">
                        <div className="flex-2">
                            <CategorySelector
                                categories={activeCharacterCategories}
                                label="Avatar categories"
                                onChangeValue={(value) => setCharacterCategories(value)}
                            />
                        </div>

                        <div className="flex-2">
                            <CategorySelector
                                categories={activeChatCategories}
                                label="Chat categories"
                                onChangeValue={(value) => setChatCategories(value)}
                            />
                        </div>

                        <div className="flex-2">
                            <ChatSelector
                                label="Target chats"
                                onChangeValue={(value) => setAdditionalChats(value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
                <div className="flex flex-col gap-3">
                    <h3 className="text-center text-lg font-medium">Time Range</h3>

                    <div className="flex flex-row gap-12">
                        <div className="flex-1">
                            <FieldWithLabel label="Start time">
                                <div className="flex flex-col gap-3">
                                    <DateTimePicker
                                        key={resetKey}
                                        resetable
                                        onSelectDate={(value) => {
                                            logger.info("Changing start time", value)
                                            value.setMilliseconds(0)
                                            setStartTime(value)
                                        }}
                                    />
                                    {/* {startTimeFromNow && (
                    <div className="text-sm text-gray-600 pl-2">
                      {startTimeFromNow}
                    </div>
                  )} */}
                                </div>
                            </FieldWithLabel>
                        </div>

                        <div className="flex-1">
                            <FieldWithLabel label="End time">
                                <div className="flex flex-col gap-3">
                                    <DateTimePicker
                                        defaultDate={
                                            new Date(
                                                new Date().getTime() +
                                                    new Date().getTimezoneOffset() * 60000 +
                                                    60 * 60 * 24 * 1000,
                                            )
                                        }
                                        key={resetKey}
                                        resetable
                                        onSelectDate={(value) => {
                                            logger.info("Changing end time", value)
                                            value.setMilliseconds(0)
                                            setEndTime(value)
                                        }}
                                    />
                                    {/* {endTimeFromNow && (
                    <div className="text-sm text-gray-600 pl-2">
                      {endTimeFromNow}
                    </div>
                  )} */}
                                </div>
                            </FieldWithLabel>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-medium">Batch Settings</h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                    <InputWithLabel
                        label="Batch size [Number of avatars running simultaneously]"
                        type="number"
                        min="1"
                        value={batchSize}
                        onBlur={(e) => {
                            const value = Number(e.target.value)
                            if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                setBatchSize(20)
                            }
                        }}
                        onChange={(e) => setBatchSize(e.target.value)}
                        className="w-32"
                    />

                    <InputWithLabel
                        label="Batch interval [minutes]"
                        type="number"
                        min="1"
                        value={batchInterval}
                        onBlur={(e) => {
                            const value = Number(e.target.value)
                            if (e.target.value === "" || value <= 0 || isNaN(value)) {
                                setBatchInterval(10)
                            }
                        }}
                        onChange={(e) => setBatchInterval(e.target.value)}
                        className="w-32"
                    />
                </div>
            </div>
        </div>
    )
}
