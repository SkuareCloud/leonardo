"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import debounce from "debounce"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Proxy } from "./proxy"

export function LoadingInputField({
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

  const debouncedOnChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null)
        setIsLoading(true)
        updateField(e.target.value)
          .catch(err => {
            console.error(`Failed to update field: ${err}`)
            setError("Failed to update field")
          })
          .then(() => {
            setValue(e.target.value)
          })
          .finally(() => {
            setIsLoading(false)
          })
      }, 500),
    [updateField],
  )

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 relative w-full items-center">
          <div className="flex flex-row gap-2 items-center">
            <Input
              id={id}
              value={value}
              onChange={e => {
                setValue(e.target.value)
                debouncedOnChange(e)
              }}
              disabled={isLoading}
              className="w-[30ch]"
            />
            {isLoading && <Loader2 className="size-4 animate-spin" />}
          </div>
        </div>
        {error && <span className="text-red-500 text-sm">{error}</span>}
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
      <div className="flex flex-row gap-2 items-center">
        <Select
          value={value}
          disabled={isLoading}
          onValueChange={value => {
            setError(null)
            setIsLoading(true)
            updateField(value)
              .catch(err => {
                console.error(`Failed to update field: ${err}`)
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
            {choices.map(choice => (
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
    <div className={cn("flex flex-col gap-1", oneline && "flex-row gap-2 items-center")}>
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
}: {
  avatar: AvatarModelWithProxy
  avatarsList: AvatarModelWithProxy[]
  updateField: (path: string, value: any) => Promise<void>
  refreshAvatar: () => Promise<AvatarModelWithProxy>
}) {
  // Unique geodata models
  const allGeocodes: string[] = avatarsList
    .map(av => ({
      home_city: av.home_city,
      iso_3166_1_alpha_2_code: av.home_iso_3166_1_alpha_2_code,
      iso_3166_2_subdivision_code: av.home_iso_3166_2_subdivision_code,
      continent_code: av.home_continent_code,
      key: `${av.home_city}, ${av.home_iso_3166_1_alpha_2_code} (${av.home_iso_3166_2_subdivision_code})`,
    }))
    // unique
    .filter((geocode, index, self) => index === self.findIndex(g => g.key === geocode.key))
    .sort((a, b) => a.iso_3166_1_alpha_2_code.localeCompare(b.iso_3166_1_alpha_2_code))
    .map(
      geoCode =>
        `${geoCode.home_city}|${geoCode.iso_3166_1_alpha_2_code}|${geoCode.iso_3166_2_subdivision_code}|${geoCode.continent_code}`,
    )

  return (
    <div className="flex flex-col gap-4 min-w-[400px]">
      <div className="w-full">
        <h1 className="text-2xl font-bold">{avatar.data.eliza_character?.name}</h1>
        <div className="flex flex-col gap-1 pt-8 w-full">
          <BasicFieldSection label="ID" oneline>
            {avatar.id}
          </BasicFieldSection>
          <BasicFieldSection label="PIR ID" oneline>
            {avatar.pir_id}
          </BasicFieldSection>
          <Separator className="w-full my-4" />
          <div className="flex flex-col pt-4 gap-6 w-full">
            <LoadingInputField
              id="name"
              label="Name"
              isLoading={false}
              error={null}
              value={avatar.data.eliza_character?.name}
              updateField={value => updateField("eliza_character.name", value)}
            />
            <LoadingSelectField
              id="geocode"
              value={`${avatar.home_city}|${avatar.home_iso_3166_1_alpha_2_code}|${avatar.home_iso_3166_2_subdivision_code}|${avatar.home_continent_code}`}
              label="Geocode"
              choices={allGeocodes}
              updateField={async value => {
                const parts = value.split("|")
                const [homeCity, geocode, subdivision, continent] = parts
                console.log(
                  `Updating home address to city: ${homeCity}, ISO: ${geocode}, subdivision: ${subdivision}...`,
                )
                await updateField("addresses.home", {
                  city: homeCity,
                  iso_3166_1_alpha_2_code: geocode,
                  iso_3166_2_subdivision_code: subdivision,
                  continent_code: continent,
                })
                console.log("Successfully updated address.")
                console.log(`Assigning proxy to profile ID: ${avatar.id}...`)
                await new ServiceBrowserClient().assignProxy(avatar.id)
                console.log(`Successfully assigned proxy.`)
                await refreshAvatar()
              }}
              choiceRenderer={choice => {
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
            <BasicFieldSection label="Proxy">{avatar.proxy && <Proxy proxy={avatar.proxy} />}</BasicFieldSection>
            <BasicFieldSection label="Date of Birth">
              {new Date(avatar.data?.date_of_birth).toDateString()}
            </BasicFieldSection>
            <BasicFieldSection label="Phone Number">{avatar.data?.phone_number}</BasicFieldSection>
          </div>
        </div>
      </div>
    </div>
  )
}
