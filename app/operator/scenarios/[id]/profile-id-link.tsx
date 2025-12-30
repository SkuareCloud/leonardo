"use client"

import { AvatarRead } from "@lib/api/avatars/types.gen"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { SquareArrowUpRightIcon } from "lucide-react"
import { useState } from "react"
import ReactDOM from "react-dom"
import { AvatarDrawer } from "../../../avatars/avatars/avatar-drawer"

interface ProfileIdLinkProps {
    profileId: string
    avatars: AvatarRead[]
}

export function ProfileIdLink({ profileId, avatars }: ProfileIdLinkProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedAvatar, setSelectedAvatar] = useState<AvatarRead | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = async () => {
        setIsLoading(true)
        try {
            // First try to find the avatar in the existing list
            let avatar = avatars.find((av) => av.id === profileId)

            // If not found, fetch it from the API
            if (!avatar) {
                const serviceClient = new ServiceBrowserClient()
                avatar = await serviceClient.getProfile(profileId)
            }

            if (avatar) {
                setSelectedAvatar(avatar)
                setIsDrawerOpen(true)
            }
        } catch (error) {
            console.error("Failed to fetch avatar:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const updateField = async (path: string, value: unknown) => {
        if (!selectedAvatar) return

        const serviceClient = new ServiceBrowserClient()
        await serviceClient.updateProfile(selectedAvatar.id, path, value)
    }

    const refreshAvatar = async () => {
        if (!selectedAvatar) throw new Error("No avatar selected")

        const serviceClient = new ServiceBrowserClient()
        const avatar = await serviceClient.getProfile(selectedAvatar.id)
        setSelectedAvatar(avatar)
        return avatar
    }

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="my-2 flex flex-row gap-2 text-sm text-gray-600 transition-colors hover:text-gray-800"
            >
                <b>Avatar ID:</b> <span className="underline">{profileId}</span>{" "}
                <SquareArrowUpRightIcon className="size-4" />
            </button>

            {isDrawerOpen &&
                selectedAvatar &&
                typeof window !== "undefined" &&
                ReactDOM.createPortal(
                    <AvatarDrawer
                        avatar={selectedAvatar}
                        avatarsList={avatars}
                        updateField={updateField}
                        refreshAvatar={refreshAvatar}
                        onClose={() => {
                            setIsDrawerOpen(false)
                            setSelectedAvatar(null)
                        }}
                    />,
                    document.body,
                )}
        </>
    )
}
