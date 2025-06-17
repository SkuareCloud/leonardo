import { Combobox } from "@/components/combobox"
import { DateTimePicker } from "@/components/date-time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MissionInput } from "@lib/api/models"
import { CategoryRead, ChatRead, EchoMissionInput, ScenarioRead } from "@lib/api/orchestrator"
import { cn } from "@lib/utils"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel } from "./mission-builder-utils"

export function RandomDistributionMissionBuilder({
  scenarios,
  categories,
  chats,
}: {
  scenarios: ScenarioRead[]
  categories: CategoryRead[]
  chats: ChatRead[]
}) {
  const [maximumRetries, setMaximumRetries] = useState(3)
  const [messagePlain, setMessagePlain] = useState("")
  const [scenarioId, setScenarioId] = useState("")
  const [chatId, setChatId] = useState("")
  const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
  const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
  const [sendAtTriggerTime, setSendAtTriggerTime] = useState(false)
  const [triggerTime, setTriggerTime] = useState<Date | undefined>(undefined)
  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

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

    payload.chats_categories = chatCategories.length > 0 ? chatCategories.map(c => c.label) : []
    payload.characters_categories = profileCategories.length > 0 ? profileCategories.map(c => c.label) : []

    onChangeMissionPayload(payload as MissionInput<EchoMissionInput>)
  }, [
    messagePlain,
    maximumRetries,
    scenarioId,
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-8 p-2">
        <FieldWithLabel required label="Select chat">
          <Combobox
            options={chats.map(chat => ({
              value: chat.id,
              label: chat.username ? `${chat.username} (${chat.id})` : chat.id,
            }))}
            value={chatId}
            onValueChange={value => setChatId(value)}
          />
        </FieldWithLabel>
        <FieldWithLabel label="Start time">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row gap-2">
              <DateTimePicker
                disabled={!sendAtTriggerTime}
                onSelectDate={value => {
                  console.log("Changing trigger time", value)
                  value.setMilliseconds(0)
                  setTriggerTime(value)
                }}
              />
              <div
                className={cn(
                  "flex flex-row self-start relative top-9 ml-2 text-sm",
                  !sendAtTriggerTime && "text-gray-500",
                )}
              >
                <div>UTC</div>
              </div>
              <div className="relative ml-4 -top-1.5 self-end flex flex-row items-center gap-2">
                <Checkbox
                  checked={sendAtTriggerTime}
                  onCheckedChange={checked => setSendAtTriggerTime(checked === "indeterminate" ? false : checked)}
                />
                <Label className="text-sm">Send at trigger time</Label>
              </div>
            </div>
            <div className="text-sm pl-2">{triggerTimeFromNow}</div>
          </div>
        </FieldWithLabel>
        {categories.length > 0 && (
          <div className="flex flex-col gap-4">
            <CategorySelector
              categories={categories}
              label="Chat categories"
              onChangeValue={value => setChatCategories(value)}
            />
            <CategorySelector
              categories={categories}
              label="Profile categories"
              onChangeValue={value => setProfileCategories(value)}
            />
          </div>
        )}
        <FieldWithLabel label="Maximum retries">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[maximumRetries]}
            onValueChange={value => setMaximumRetries(value[0])}
            className="w-96"
          />
        </FieldWithLabel>
      </div>
    </div>
  )
}
