"use client"

import TelegramIcon from "@/assets/telegram.svg"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { logger } from "@lib/logger"
import { getSocialNetworkStatus } from "@lib/profile-utils"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { Loader2, Settings, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ActivationDialog } from "./activation-dialog"
import { getBadgeClassNamesByActivationSource } from "./avatars-utils"
import { Proxy } from "./proxy"

function LoadingInputField({
    id,
    label,
    value: initialValue,
    updateField,
}: {
    id: string
    label: string
    value: string
    isLoading: boolean
    error: string | null
    updateField: (value: string) => Promise<void>
}) {
    const [value, setValue] = useState(initialValue)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const handleBlur = async () => {
        if (value !== initialValue) {
            setError(null)
            setIsLoading(true)
            try {
                await updateField(value)
            } catch (err) {
                logger.error(`Failed to update field: ${err}`)
                setError("Failed to update field")
                setValue(initialValue) // Revert to original value on error
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id} className="font-bold">
                {label}
            </Label>
            <div className="flex flex-col gap-2">
                <div className="relative flex w-full flex-row items-center gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <Input
                            id={id}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onBlur={handleBlur}
                            disabled={isLoading}
                            className="w-[30ch]"
                        />
                        {isLoading && <Loader2 className="size-4 animate-spin" />}
                    </div>
                </div>
                {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
        </div>
    )
}

export function LoadingSelectField({
    id,
    value,
    label,
    choices,
    choiceRenderer,
    updateField,
}: {
    id: string
    value: string
    label: string
    choices: string[]
    choiceRenderer: (choice: string) => React.ReactNode
    updateField: (value: string) => Promise<void>
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id} className="font-bold">
                {label}
            </Label>
            <div className="flex flex-row items-center gap-2">
                <Select
                    value={value}
                    disabled={isLoading}
                    onValueChange={(value) => {
                        setError(null)
                        setIsLoading(true)
                        updateField(value)
                            .catch((err) => {
                                logger.error(`Failed to update field: ${err}`)
                                setError("Failed to update field")
                            })
                            .finally(() => {
                                setIsLoading(false)
                            })
                    }}
                >
                    <SelectTrigger className="w-[40ch]">
                        <SelectValue placeholder="Select Geocode" />
                    </SelectTrigger>
                    <SelectContent id="selectGeocode" className="w-[40ch]">
                        {choices.map((choice) => (
                            <SelectItem key={choice} value={choice}>
                                {choiceRenderer(choice)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isLoading && <Loader2 className="size-4 animate-spin" />}
            </div>
        </div>
    )
}

function BasicFieldSection({
    label,
    oneline,
    children,
}: {
    label: string
    oneline?: boolean
    children?: React.ReactNode
}) {
    if (!children) {
        return null
    }
    return (
        <div className={cn("flex flex-col gap-1", oneline && "flex-row items-center gap-2")}>
            <div className="text-sm font-bold">{label}</div>
            <div className="text-sm">{children}</div>
        </div>
    )
}

export function AvatarDrawer({
    avatar,
    avatarsList,
    updateField,
    refreshAvatar,
    onClose,
}: {
    avatar: AvatarModelWithProxy
    avatarsList: AvatarModelWithProxy[]
    updateField: (path: string, value: any) => Promise<void>
    refreshAvatar: () => Promise<AvatarModelWithProxy>
    onClose: () => void
}) {
    // Unique geodata models
    const allGeocodes: string[] = avatarsList
        .map((av) => ({
            home_city: av.home_city,
            iso_3166_1_alpha_2_code: av.home_iso_3166_1_alpha_2_code,
            iso_3166_2_subdivision_code: av.home_iso_3166_2_subdivision_code,
            continent_code: av.home_continent_code,
            key: `${av.home_city}, ${av.home_iso_3166_1_alpha_2_code} (${av.home_iso_3166_2_subdivision_code})`,
        }))
        // unique
        .filter((geocode, index, self) => index === self.findIndex((g) => g.key === geocode.key))
        .sort((a, b) => a.iso_3166_1_alpha_2_code.localeCompare(b.iso_3166_1_alpha_2_code))
        .map(
            (geoCode) =>
                `${geoCode.home_city}|${geoCode.iso_3166_1_alpha_2_code}|${geoCode.iso_3166_2_subdivision_code}|${geoCode.continent_code}`,
        )

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="bg-background relative ml-auto h-full w-full max-w-md border-l shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <span className="text-primary text-lg font-semibold">
                                {(avatar.data?.eliza_character as any)?.name?.charAt(0) || "A"}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                {(avatar.data?.eliza_character as any)?.name || "Unnamed Avatar"}
                            </h1>
                            <p className="text-muted-foreground text-sm">Avatar Details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings className="size-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Avatar Settings</DialogTitle>
                                    <DialogDescription>
                                        Configure additional settings for this avatar. Make changes
                                        and click save when you're done.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="nickname" className="text-right">
                                            Nickname
                                        </Label>
                                        <Input
                                            id="nickname"
                                            defaultValue={
                                                (avatar.data?.eliza_character as any)?.name || ""
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="description" className="text-right">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            defaultValue=""
                                            placeholder="Enter avatar description"
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Save changes</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="h-full overflow-y-auto">
                    <div className="space-y-6 p-6">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h2 className="text-foreground text-lg font-semibold">
                                Basic Information
                            </h2>
                            <div className="space-y-3">
                                <BasicFieldSection label="ID" oneline>
                                    <code className="bg-muted rounded px-2 py-1 text-sm">
                                        {avatar.id}
                                    </code>
                                </BasicFieldSection>
                                <BasicFieldSection label="PIR ID" oneline>
                                    <code className="bg-muted rounded px-2 py-1 text-sm">
                                        {avatar.pir_id}
                                    </code>
                                </BasicFieldSection>
                            </div>
                        </div>

                        <Separator />

                        {/* Editable Fields Section */}
                        <div className="space-y-6">
                            <h2 className="text-foreground text-lg font-semibold">
                                Avatar Details
                            </h2>

                            <LoadingInputField
                                id="name"
                                label="Name"
                                isLoading={false}
                                error={null}
                                value={(avatar.data.eliza_character as any)?.name || ""}
                                updateField={(value) => updateField("eliza_character.name", value)}
                            />

                            <LoadingSelectField
                                id="geocode"
                                value={`${avatar.home_city}|${avatar.home_iso_3166_1_alpha_2_code}|${avatar.home_iso_3166_2_subdivision_code}|${avatar.home_continent_code}`}
                                label="Geocode"
                                choices={allGeocodes}
                                updateField={async (value) => {
                                    const parts = value.split("|")
                                    const [homeCity, geocode, subdivision, continent] = parts
                                    logger.info(
                                        `Updating home address to city: ${homeCity}, ISO: ${geocode}, subdivision: ${subdivision}...`,
                                    )
                                    await updateField("addresses.home", {
                                        city: homeCity,
                                        iso_3166_1_alpha_2_code: geocode,
                                        iso_3166_2_subdivision_code: subdivision,
                                        continent_code: continent,
                                    })
                                    logger.info("Successfully updated address.")
                                    logger.info(`Assigning proxy to profile ID: ${avatar.id}...`)
                                    await new ServiceBrowserClient().assignProxy(avatar.id)
                                    logger.info(`Successfully assigned proxy.`)
                                    await refreshAvatar()
                                }}
                                choiceRenderer={(choice) => {
                                    const parts = choice.split("|")
                                    const [homeCity, geocode] = parts
                                    const flag = geocode && getUnicodeFlagIcon(geocode)
                                    return (
                                        <span>
                                            {flag} {homeCity} ({geocode})
                                        </span>
                                    )
                                }}
                            />

                            <BasicFieldSection label="Proxy">
                                {avatar.proxy && <Proxy proxy={avatar.proxy} />}
                            </BasicFieldSection>

                            <BasicFieldSection label="Date of Birth">
                                <span className="bg-muted rounded px-2 py-1 text-sm">
                                    {new Date(avatar.data?.date_of_birth as string).toDateString()}
                                </span>
                            </BasicFieldSection>

                            <LoadingInputField
                                id="phone_number"
                                label="Phone Number"
                                isLoading={false}
                                error={null}
                                value={(avatar.data?.phone_number as string) || ""}
                                updateField={(value) => updateField("phone_number", value)}
                            />

                            <LoadingSelectField
                                id="activation_source"
                                value={
                                    (
                                        avatar.data?.social_network_accounts as any
                                    )?.telegram?.activation_source?.toUpperCase() || "NONE"
                                }
                                label="Activation Source"
                                choices={["WEB1", "WEB2", "UNKNOWN"]}
                                updateField={(value) =>
                                    updateField(
                                        "social_network_accounts.telegram.activation_source",
                                        value.toLowerCase(),
                                    )
                                }
                                choiceRenderer={(choice) => (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-bold tracking-wide",
                                            getBadgeClassNamesByActivationSource(choice),
                                        )}
                                    >
                                        {choice}
                                    </Badge>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Social Networks Section */}
                        <div className="space-y-4">
                            <h2 className="text-foreground text-lg font-semibold">
                                Social Networks
                            </h2>
                            {(() => {
                                const socialStatus = getSocialNetworkStatus(avatar)
                                const networks = Object.entries(socialStatus)

                                if (networks.length === 0) {
                                    return (
                                        <div className="py-8 text-center">
                                            <div className="text-muted-foreground text-sm">
                                                No social networks configured
                                            </div>
                                        </div>
                                    )
                                }

                                return (
                                    <div className="space-y-3">
                                        {networks.map(([network, isActive]) => (
                                            <div
                                                key={network}
                                                className="bg-card flex items-center justify-between rounded-lg border p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {network === "telegram" && (
                                                        <div
                                                            className={cn(
                                                                "flex size-8 items-center justify-center",
                                                                !isActive && "opacity-50 grayscale",
                                                            )}
                                                        >
                                                            <Image
                                                                src={TelegramIcon}
                                                                alt="Telegram"
                                                                width={24}
                                                                height={24}
                                                                className="size-6"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium capitalize">
                                                            {network}
                                                        </span>
                                                        <span
                                                            className={`text-sm ${isActive ? "text-green-600" : "text-red-600"}`}
                                                        >
                                                            {isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isActive}
                                                        onCheckedChange={async (checked) => {
                                                            const newStatus = checked
                                                                ? "active"
                                                                : "inactive"
                                                            await updateField(
                                                                `social_network_accounts.${network}.active`,
                                                                checked,
                                                            )
                                                        }}
                                                    />
                                                    {!isActive && (
                                                        <ActivationDialog
                                                            network={network}
                                                            avatarId={avatar.id}
                                                            onActivationComplete={async () => {
                                                                await refreshAvatar()
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
