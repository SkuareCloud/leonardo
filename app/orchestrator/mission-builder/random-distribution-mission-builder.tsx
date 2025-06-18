import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Slider } from "@/components/ui/slider"
import { MissionInput } from "@lib/api/models"
import {
  CategoryRead,
  ChatRead,
  InputMessage,
  RandomDistributionMissionInput,
  ScenarioRead,
} from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
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
  const [messagesAmount, setMessagesAmount] = useState(1)
  const [messagesAmountPerCharacter, setMessagesAmountPerCharacter] = useState(1)
  const [scenarioId, setScenarioId] = useState("")
  const [chatId, setChatId] = useState("")
  const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
  const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
  const [startTime, setStartTime] = useState<Date | undefined>(undefined)
  const [messages, setMessages] = useState<InputMessage[]>([])
  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

  useEffect(() => {
    const payload: Partial<RandomDistributionMissionInput> = {}

    if (maximumRetries >= 0) {
      payload.max_retries = maximumRetries
    }

    payload.start_time = startTime?.toISOString()

    payload.messages = messages.map(message => ({
      text: message.text,
      attachments: [],
    }))

    payload.messages_amount = messagesAmount
    payload.messages_amount_per_character = messagesAmountPerCharacter

    payload.chat_categories = chatCategories.length > 0 ? chatCategories.map(c => c.label) : []
    payload.characters_categories = profileCategories.length > 0 ? profileCategories.map(c => c.label) : []

    onChangeMissionPayload(payload as MissionInput<RandomDistributionMissionInput>)
  }, [
    messages,
    maximumRetries,
    messagesAmount,
    messagesAmountPerCharacter,
    chatCategories,
    profileCategories,
    startTime,
  ])

  const triggerTimeFromNow =
    startTime && startTime.getTime() > Date.now()
      ? new Intl.RelativeTimeFormat("en", { style: "long" }).format(
          Math.round((startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          "day",
        )
      : undefined

  const activeChats = chats.filter(chat => chat.chat_type === "Group")
  const activeChatCategories = categories.filter(category => category.chat_count && category.chat_count > 0)
  const activeProfileCategories = categories.filter(
    category => category.character_count && category.character_count > 0,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-8 p-2">
        <MessageBuilder onUpdateMessages={messages => setMessages(messages)} />
        <FieldWithLabel label="Messages amount">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[messagesAmount]}
            onValueChange={value => setMessagesAmount(value[0])}
            className="w-96"
          />
        </FieldWithLabel>
        <FieldWithLabel label="Messages amount per character">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[messagesAmountPerCharacter]}
            onValueChange={value => setMessagesAmountPerCharacter(value[0])}
            className="w-96"
          />
        </FieldWithLabel>
        <FieldWithLabel required label="Start time">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row gap-2">
              <DateTimePicker
                onSelectDate={value => {
                  logger.info("Changing trigger time", value)
                  value.setMilliseconds(0)
                  setStartTime(value)
                }}
              />
              <div className={cn("flex flex-row self-start relative top-9 ml-2 text-sm")}>
                <div>UTC</div>
              </div>
            </div>
            <div className="text-sm pl-2">{triggerTimeFromNow}</div>
          </div>
        </FieldWithLabel>
        {activeChatCategories.length > 0 && (
          <div className="flex flex-col gap-4">
            <CategorySelector
              categories={activeChats}
              label="Chat categories"
              onChangeValue={value => setChatCategories(value)}
            />
          </div>
        )}
        {activeProfileCategories.length > 0 && (
          <div className="flex flex-col gap-4">
            <CategorySelector
              categories={activeProfileCategories}
              label="Profile categores"
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
