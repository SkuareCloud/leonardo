"use client"

import TelegramIcon from "@/assets/telegram.svg"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { ActivationStatus } from "@lib/api/operator"
import { logger } from "@lib/logger"
import { getSocialNetworkStatus } from "@lib/profile-utils"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import debounce from "debounce"
import { Loader2, Settings } from "lucide-react"
import Image from "next/image"
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
            logger.error(`Failed to update field: ${err}`)
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
  const [activationStatus, setActivationStatus] = useState<ActivationStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{(avatar.data?.eliza_character as any)?.name || "Unnamed Avatar"}</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="size-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Avatar Settings</DialogTitle>
                <DialogDescription>
                  Configure additional settings for this avatar. Make changes and click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nickname" className="text-right">
                    Nickname
                  </Label>
                  <Input
                    id="nickname"
                    defaultValue={(avatar.data?.eliza_character as any)?.name || ""}
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
        </div>
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
            <BasicFieldSection label="Social Networks">
              {(() => {
                const socialStatus = getSocialNetworkStatus(avatar)
                const networks = Object.entries(socialStatus)

                if (networks.length === 0) {
                  return <span className="text-muted-foreground text-sm">No social networks configured</span>
                }

                return (
                  <div className="flex flex-col gap-1">
                    {networks.map(([network, isActive]) => (
                      <div key={network} className="flex items-center gap-2">
                        {network === "telegram" && (
                          <div className={cn("size-5", !isActive && "opacity-50 grayscale")}>
                            <Image src={TelegramIcon} alt="Telegram" width={20} height={20} className="size-5" />
                          </div>
                        )}
                        <span className="capitalize font-medium">{network}</span>
                        <span className={`text-sm ${isActive ? "text-green-600" : "text-red-600"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        {!isActive && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="ml-2">
                                Activate
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Activate {network.charAt(0).toUpperCase() + network.slice(1)}</DialogTitle>
                                <DialogDescription>
                                  Activate the {network} account for this avatar. This will start the activation
                                  process.
                                </DialogDescription>
                              </DialogHeader>
                              {!isPolling ? (
                                <div className="py-4">
                                  <p className="text-sm text-muted-foreground mb-4">The activation process will:</p>
                                  <ul className="text-sm space-y-2 mb-4">
                                    <li>• Start the browser session</li>
                                    <li>• Navigate to {network} login page</li>
                                    <li>• Enter credentials and complete verification</li>
                                    <li>• Verify successful activation</li>
                                  </ul>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    This process may take a few minutes and may require manual intervention for
                                    verification steps.
                                  </p>
                                  <div className="space-y-4">
                                    <div className="flex flex-col gap-2">
                                      <Label htmlFor="activation-type" className="text-sm font-medium">
                                        Activation Type
                                      </Label>
                                      <Select
                                        defaultValue="otp"
                                        onValueChange={value => {
                                          const textArea = document.getElementById("session-data")
                                          if (textArea) {
                                            textArea.style.display = value === "session" ? "block" : "none"
                                          }
                                        }}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select activation type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="otp">OTP Verification</SelectItem>
                                          <SelectItem value="session">Session Data Submission</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                     <textarea
                                       id="session-data"
                                       className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                       placeholder="Enter session data here..."
                                       style={{ display: "none" }}
                                       onClick={e => e.stopPropagation()}
                                     />
                                    </div>
                                    <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                      <Checkbox id="should-override" />
                                      <Label htmlFor="should-override" className="text-sm">
                                        Override existing activation (force re-activation)
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-4">
                                  <div className="flex flex-col items-center gap-4">
                                    {activationError ? (
                                      <div className="text-center">
                                        <div className="text-red-500 text-lg font-semibold mb-2">Activation Failed</div>
                                        <div className="text-sm text-muted-foreground">{activationError}</div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="size-6 animate-spin" />
                                          <span className="text-lg font-semibold">Activation in Progress</span>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-sm font-medium mb-1">Current Status:</div>
                                          <div className="text-sm text-muted-foreground capitalize">
                                            {activationStatus?.toLowerCase().replace(/_/g, ' ')}
                                          </div>
                                        </div>
                                        {activationStatus === "SUCCESS" && (
                                          <div className="text-center">
                                            <div className="text-green-500 text-lg font-semibold mb-2">✅ Activation Successful!</div>
                                            <div className="text-sm text-muted-foreground">
                                              The {network} account has been successfully activated.
                                            </div>
                                          </div>
                                        )}
                                        {activationStatus === "FAILED" && (
                                          <div className="text-center">
                                            <div className="text-red-500 text-lg font-semibold mb-2">❌ Activation Failed</div>
                                            <div className="text-sm text-muted-foreground">
                                              The activation process failed. Please try again.
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                {!isPolling ? (
                                  <>
                                    <Button variant="outline">Cancel</Button>
                                    <Button 
                                      onClick={async () => {
                                        try {
                                          const shouldOverride = (
                                            document.getElementById("should-override") as HTMLInputElement
                                          )?.checked
                                          const activationType =
                                            (
                                              document.querySelector("[data-radix-select-trigger]") as HTMLElement
                                            )?.getAttribute("data-value") || "otp"
                                          const sessionData = (document.getElementById("session-data") as HTMLTextAreaElement)?.value
                                          
                                          logger.info(
                                            `Starting activation for ${network} on profile ${avatar.id} with override: ${shouldOverride}, type: ${activationType}...`,
                                          )
                                          
                                          // Start activation
                                          await new ServiceBrowserClient().activate(
                                            avatar.id,
                                            activationType,
                                            shouldOverride,
                                            sessionData,
                                          )
                                          
                                          // Start polling for status
                                          setIsPolling(true)
                                          setActivationStatus("STARTED")
                                          setActivationError(null)
                                          
                                          const pollStatus = async () => {
                                            try {
                                              const status = await new ServiceBrowserClient().getActivationStatus(avatar.id)
                                              setActivationStatus(status)
                                              
                                              if (status === "SUCCESS" || status === "FAILED") {
                                                setIsPolling(false)
                                                if (status === "SUCCESS") {
                                                  // Refresh avatar data to show updated status
                                                  await refreshAvatar()
                                                }
                                              } else {
                                                // Continue polling
                                                setTimeout(pollStatus, 2000) // Poll every 2 seconds
                                              }
                                            } catch (error) {
                                              setActivationError(`Failed to get activation status: ${error}`)
                                              setIsPolling(false)
                                            }
                                          }
                                          
                                          // Start polling
                                          setTimeout(pollStatus, 1000)
                                          
                                        } catch (error) {
                                          logger.error(`Failed to activate ${network}: ${error}`)
                                          setActivationError(`Failed to start activation: ${error}`)
                                        }
                                      }}
                                    >
                                      Start Activation
                                    </Button>
                                  </>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setIsPolling(false)
                                      setActivationStatus(null)
                                      setActivationError(null)
                                    }}
                                  >
                                    Close
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </BasicFieldSection>
          </div>
        </div>
      </div>
    </div>
  )
}
