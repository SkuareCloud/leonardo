"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MissionInput } from "@lib/api/models"
import { CategoryRead, FluffMissionInput } from "@lib/api/orchestrator"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { CharacterSelector } from "./character-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { InputWithLabel } from "./mission-builder-utils"

export function FluffMissionBuilder({ categories }: { categories: CategoryRead[] }) {
    const [characterIds, setCharacterIds] = useState<{ id: string; label: string }[]>([])
    const [characterCategories, setCharacterCategories] = useState<{ id: string; label: string }[]>(
        [],
    )

    const [isRoutine, setIsRoutine] = useState(false)
    const [batchSize, setBatchSize] = useState<number | string>(20)
    const [batchInterval, setBatchInterval] = useState<number | string>(10)
    const [getChats, setGetChats] = useState(false)
    const [syncPersonalDetails, setSyncPersonalDetails] = useState(false)
    const [disableAutoDownloadMedia, setDisableAutoDownloadMedia] = useState(false)
    const [deleteAllActiveSessions, setDeleteAllActiveSessions] = useState(false)
    const { onChangeMissionPayload } = useContext(MissionBuilderContext)

    const activeCharacterCategories = categories.filter(
        (category) => category.character_count && category.character_count > 0,
    )

    useEffect(() => {
        const payload: Partial<FluffMissionInput> = {}
        payload.characters_categories =
            characterCategories.length > 0 ? characterCategories.map((c) => c.label) : []
        payload.character_ids = characterIds.length > 0 ? characterIds.map((c) => c.id) : []

        payload.is_routine = isRoutine
        payload.batch_size = typeof batchSize === "string" ? Number(batchSize) || 20 : batchSize
        payload.batch_interval =
            typeof batchInterval === "string" ? Number(batchInterval) || 10 : batchInterval
        payload.get_chats = getChats
        payload.sync_personal_details = syncPersonalDetails
        payload.disable_auto_download_media = disableAutoDownloadMedia
        payload.delete_all_active_sessions = deleteAllActiveSessions

        onChangeMissionPayload(payload as MissionInput<FluffMissionInput>)
    }, [
        characterIds,
        characterCategories,
        isRoutine,
        batchSize,
        batchInterval,
        getChats,
        syncPersonalDetails,
        disableAutoDownloadMedia,
        deleteAllActiveSessions,
    ])

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium">Avatar Selection</h3>
                    <p className="text-sm text-gray-600"></p>

                    <div className="flex flex-col gap-12">
                        <CategorySelector
                            categories={activeCharacterCategories}
                            label="Avatar categories"
                            onChangeValue={(value) => setCharacterCategories(value)}
                        />
                        <CharacterSelector
                            label="Avatars by Name/ID"
                            onChangeValue={(value) => setCharacterIds(value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500"></div>
                </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
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

            <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/50 px-4 py-3 text-gray-900 shadow-sm">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium">Options</h3>

                    <div className="grid grid-cols-3 gap-4 md:grid-cols-1">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="get-chats"
                                checked={getChats}
                                onCheckedChange={(checked) => {
                                    setGetChats(checked === "indeterminate" ? false : checked)
                                }}
                            />
                            <Label htmlFor="sync-chats" className="text-sm">
                                Get chats
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sync-personal-details"
                                checked={syncPersonalDetails}
                                onCheckedChange={(checked) => {
                                    setSyncPersonalDetails(
                                        checked === "indeterminate" ? false : checked,
                                    )
                                }}
                            />
                            <Label htmlFor="sync-personal-details" className="text-sm">
                                Sync personal details
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="disable-auto-download-media"
                                checked={disableAutoDownloadMedia}
                                onCheckedChange={(checked) => {
                                    setDisableAutoDownloadMedia(
                                        checked === "indeterminate" ? false : checked,
                                    )
                                }}
                            />
                            <Label htmlFor="disable-auto-download-media" className="text-sm">
                                Disable auto download media
                            </Label>
                        </div>

                        {/* <div className="flex items-center space-x-2">
              <Checkbox
                id="delete-all-active-sessions"
                checked={deleteAllActiveSessions}
                onCheckedChange={checked => {
                  setDeleteAllActiveSessions(checked === "indeterminate" ? false : checked)
                }}
              />
              <Label htmlFor="delete-all-active-sessions" className="text-sm">
                Delete all active sessions
              </Label>
            </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}
