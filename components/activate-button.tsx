"use client"

import { CombinedAvatar } from "@lib/api/models"
import { logger } from "@lib/logger"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import { Web1Account } from "@lib/web1/web1-models"
import { CheckCircle2, CircleCheckIcon, CirclePlay, Phone } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

export function StepSection({
  stepIndex,
  title,
  completed,
  description,
  children,
}: React.PropsWithChildren<{ stepIndex: number; title: string; completed: boolean; description: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="flex flex-row items-center gap-2">
        <span
          className={cn(
            "size-4 rounded-full flex items-center justify-center",
            completed ? "bg-green-200" : "bg-gray-100",
          )}
        >
          {completed ? (
            <CircleCheckIcon className="size-6 text-green-500" />
          ) : (
            <div className="bg-gray-100 flex text-xs font-bold min-w-6 min-h-6 justify-center items-center size-6 mr-2 rounded-full">
              {stepIndex}
            </div>
          )}
        </span>
        <div className="text-sm font-medium">{title}</div>
      </div>
      <div className="text-xs text-gray-500 px-6">{description}</div>
      <div className="px-6">{children}</div>
    </div>
  )
}

type State = "insert_credentials" | "start_browser_session" | "complete_activation"
type StateMap = Record<State, string>

export function ActivateButton({ profile: initialProfile }: { profile: CombinedAvatar }) {
  const [profile, setProfile] = useState<CombinedAvatar>(initialProfile)
  const [web1Account, setWeb1Account] = useState<Web1Account | null>()
  const [states, setStates] = useState<StateMap>({
    insert_credentials: "not_started",
    start_browser_session: "not_started",
    complete_activation: "not_started",
  })
  const [otp, setOtp] = useState("")

  const profileId = profile.avatar.id
  const profileName = profile.avatar.data.eliza_character?.name
  const profilePhone = profile.avatar.data.phone_number

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:bg-green-200 bg-green-100 text-green-800 font-medium uppercase text-xs rounded-sm px-2 py-1 flex flex-row items-center transition-all">
          <CirclePlay className="size-3 mr-1" />
          Activate
        </div>
      </DialogTrigger>

      {!web1Account ? (
        <DialogContent>
          <DialogTitle>Profile requires a WEB1 account.</DialogTitle>
          <DialogDescription>Click to assign a WEB1 account to profile {profileName}.</DialogDescription>
          <Button
            onClick={async () => {
              const web1Account = await new ServiceBrowserClient().assignWeb1Account(profileId)
              await new Promise(resolve => setTimeout(resolve, 1000))
              const allProfiles = await new ServiceBrowserClient().listProfiles()
              const profile = allProfiles.find(p => p.avatar.id === profileId)
              if (profile) {
                if (profile.avatar.data.phone_number === "0") {
                  logger.error("Failed to assign WEB1 account to profile", profileId)
                }
                setProfile(profile)
                setWeb1Account(web1Account)
              }
            }}
          >
            Assign
          </Button>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activation flow</DialogTitle>
            <DialogDescription>This will activate the profile and start the activation flow.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-row items-center font-bold">
            <Phone className="size-3 mr-1" /> Phone: {profilePhone}
          </div>
          <Separator className="my-4" />
          <ol className="list-decimal list-inside space-y-4">
            <StepSection
              stepIndex={1}
              title="Start activation"
              completed={states.start_browser_session === "started"}
              description={`This will start a remote browser to activate ${profileName}'s profile.`}
            >
              <div className="w-full flex flex-row items-center justify-start h-12 text-sm font-medium">
                <Button
                  size="sm"
                  disabled={states.start_browser_session === "started"}
                  onClick={async () => {
                    new ServiceBrowserClient().activate(profileId)
                    setStates({
                      ...states,
                      start_browser_session: "started",
                    })
                  }}
                >
                  {states.start_browser_session === "started" ? "Activation started" : "Start activation"}
                </Button>
              </div>
            </StepSection>
            <StepSection
              stepIndex={2}
              title="Enter credentials"
              completed={states.insert_credentials === "started"}
              description={
                <p>
                  <p>Receive OTP from WEB1 and enter it here.</p>
                </p>
              }
            >
              <div className="flex flex-row space-x-2 mt-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 5-digit OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    maxLength={5}
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <Button
                size="sm"
                disabled={states.insert_credentials === "started"}
                onClick={async () => {
                  // TODO: Consolidate into one endpoint.
                  await new ServiceBrowserClient().submitOtp(profileId, otp)
                  await new ServiceBrowserClient().submitPassword(profileId, web1Account.tfa_password)
                  setStates({
                    ...states,
                    insert_credentials: "finished",
                    complete_activation: "started",
                  })

                  // Wait for profile to be activated
                  const allProfiles = await new ServiceBrowserClient().listProfiles()
                  const profile = allProfiles.find(p => p.avatar.id === profileId)
                  if (!profile) {
                    logger.error("Profile not found")
                    return
                  }

                  // TODO: Change to isProfileActive
                  if (profile.avatar.data.phone_number !== "0" && profile.avatar.data.phone_number !== profilePhone) {
                    setStates({
                      ...states,
                      complete_activation: "finished",
                    })
                  }
                }}
                className="mt-4"
              >
                Submit
              </Button>
            </StepSection>
            <StepSection
              stepIndex={3}
              title="Activation validation"
              completed={states.complete_activation === "started"}
              description={`This step will activate once OTP is submitted to validate activation.`}
            >
              <div className="w-full flex flex-row items-center justify-start h-12 text-sm font-medium">
                {states.complete_activation === "started" && (
                  <div className="inline-flex items-center space-x-2">
                    <CircleCheckIcon className="size-2 text-yellow-500 animate-spin" />{" "}
                    <span>Validating activation...</span>
                  </div>
                )}
                {states.complete_activation === "finished" && (
                  <div className="inline-flex items-center space-x-2">
                    <CheckCircle2 className="size-2 text-green-500" /> <span>Activation validated.</span>
                  </div>
                )}
              </div>
            </StepSection>
          </ol>
        </DialogContent>
      )}
    </Dialog>
  )
}
