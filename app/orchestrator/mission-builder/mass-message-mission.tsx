"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { Dropzone } from "@/components/dropzone"
import { MessageBuilder } from "@/components/message-builder"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { CategoryRead } from "@lib/api/orchestrator"
import { MassDmMissionInput } from "@lib/api/orchestrator/types.gen"
import { ChevronDown } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel } from "./mission-builder-utils"

export function MassMessageMissionBuilder({ categories }: { categories: CategoryRead[] }) {
    const [contactsRaw, setContactsRaw] = useState("")
    const [charactersCategories, setCharactersCategories] = useState<
        { id: string; label: string }[]
    >([])
    const [message, setMessage] = useState<MessageWithMedia | null>(null)
    // advanced
    const [contactsPerCharacter, setContactsPerCharacter] = useState<number | string>(100)
    const [contactsPerSession, setContactsPerSession] = useState<number | string>(100)
    const [batchSize, setBatchSize] = useState<number | string>(20)
    const [batchInterval, setBatchInterval] = useState<number | string>(10)
    const [startTime, setStartTime] = useState<Date | undefined>(() => {
        const now = new Date()
        const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
        utcNow.setMilliseconds(0)
        return utcNow
    })
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
    const { onChangeMissionPayload } = useContext(MissionBuilderContext)

    const activeCharacterCategories = categories.filter((c) => (c.character_count ?? 0) > 0)

    const contacts: string[] = contactsRaw
        .split(/\r?\n|,/) // split by lines or commas
        .map((s) => s.trim())
        .filter(Boolean)

    const onUploadCsv = async (files: File[]) => {
        if (!files || files.length === 0) return
        const file = files[0]
        const text = await file.text()
        const rows = text.split(/\r?\n/)
        const tokens: string[] = []
        for (const row of rows) {
            const cols = row
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            for (const col of cols) {
                if (col) tokens.push(col)
            }
        }
        const merged = Array.from(new Set([...contacts, ...tokens]))
        setContactsRaw(merged.join("\n"))
    }

    useEffect(() => {
        const payload: Partial<MassDmMissionInput> = {}

        payload.characters_categories =
            charactersCategories.length > 0 ? charactersCategories.map((c) => c.label) : []
        payload.contacts = contacts

        if (message && (message.text || message.media)) {
            payload.message = {
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
            }
        }

        payload.contacts_per_character =
            typeof contactsPerCharacter === "string"
                ? Number(contactsPerCharacter) || 100
                : contactsPerCharacter
        payload.contacts_per_session =
            typeof contactsPerSession === "string"
                ? Number(contactsPerSession) || 100
                : contactsPerSession
        payload.batch_size = typeof batchSize === "string" ? Number(batchSize) || 20 : batchSize
        payload.batch_interval =
            typeof batchInterval === "string" ? Number(batchInterval) || 10 : batchInterval
        payload.start_time = startTime
            ? new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000).toISOString()
            : new Date().toISOString()

        onChangeMissionPayload(payload as MissionInput<MassDmMissionInput>)
    }, [
        charactersCategories,
        contactsRaw,
        message,
        contactsPerCharacter,
        contactsPerSession,
        batchSize,
        batchInterval,
        startTime,
    ])

    return (
        <div className="flex flex-col gap-6 p-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex max-w-lg flex-col gap-6">
                    <FieldWithLabel label="Upload CSV" required>
                        <div className="w-64">
                            <Dropzone
                                onUpload={onUploadCsv}
                                accept={{ "text/csv": [".csv"] }}
                                size="tiny"
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            CSV must contain contacts (username / phone number / platform id).
                        </div>
                    </FieldWithLabel>

                    <FieldWithLabel label="Contacts (one per line or comma-separated)">
                        <textarea
                            className="h-40 w-full rounded border bg-white p-2 text-sm"
                            placeholder="username / phone_number / platform_id per line"
                            value={contactsRaw}
                            onChange={(e) => setContactsRaw(e.target.value)}
                        />
                        <div className="mt-1 text-xs text-gray-500">
                            Uploading a CSV will merge and de-duplicate with the list above.
                        </div>
                    </FieldWithLabel>
                </div>

                <div className="flex max-w-lg flex-col gap-6">
                    <FieldWithLabel label="Message content" required>
                        <MessageBuilder
                            singleMessage
                            onUpdateMessages={(messages) => setMessage(messages[0] ?? null)}
                        />
                    </FieldWithLabel>

                    <FieldWithLabel label="Avatar categories" required>
                        <CategorySelector
                            categories={activeCharacterCategories}
                            label="Avatar Categories"
                            onChangeValue={(value) => setCharactersCategories(value)}
                        />
                    </FieldWithLabel>
                </div>
            </div>
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger className="flex cursor-pointer items-center gap-2 hover:opacity-80">
                    <Label className="text-base font-semibold">Advanced Settings</Label>
                    <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOpen ? "rotate-180" : ""}`}
                    />
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-in slide-in-from-top-2 mt-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <InputWithLabel
                            label="Contacts per avatar"
                            type="number"
                            min="1"
                            value={contactsPerCharacter}
                            onBlur={(e) => {
                                const value = Number(e.target.value)
                                if (e.target.value === "" || value <= 0 || isNaN(value))
                                    setContactsPerCharacter(100)
                            }}
                            onChange={(e) => setContactsPerCharacter(e.target.value)}
                            className="w-32"
                        />
                        <InputWithLabel
                            label="Contacts per session"
                            type="number"
                            min="1"
                            value={contactsPerSession}
                            onBlur={(e) => {
                                const value = Number(e.target.value)
                                if (e.target.value === "" || value <= 0 || isNaN(value))
                                    setContactsPerSession(100)
                            }}
                            onChange={(e) => setContactsPerSession(e.target.value)}
                            className="w-32"
                        />
                        <InputWithLabel
                            label="Batch size"
                            type="number"
                            min="1"
                            value={batchSize}
                            onBlur={(e) => {
                                const value = Number(e.target.value)
                                if (e.target.value === "" || value <= 0 || isNaN(value))
                                    setBatchSize(20)
                            }}
                            onChange={(e) => setBatchSize(e.target.value)}
                            className="w-32"
                        />
                        <InputWithLabel
                            label="Batch interval (minutes)"
                            type="number"
                            min="1"
                            value={batchInterval}
                            onBlur={(e) => {
                                const value = Number(e.target.value)
                                if (e.target.value === "" || value <= 0 || isNaN(value))
                                    setBatchInterval(10)
                            }}
                            onChange={(e) => setBatchInterval(e.target.value)}
                            className="w-32"
                        />
                        <div className="col-span-2">
                            <FieldWithLabel label="Start time" required>
                                <div className="flex w-full flex-col gap-3">
                                    <div className="flex flex-row items-center gap-2">
                                        <DateTimePicker
                                            resetable
                                            onSelectDate={(value) => {
                                                value.setMilliseconds(0)
                                                setStartTime(value)
                                            }}
                                        />
                                    </div>
                                </div>
                            </FieldWithLabel>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
