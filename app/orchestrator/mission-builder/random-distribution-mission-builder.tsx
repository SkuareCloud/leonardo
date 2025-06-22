"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { CategoryRead, ChatRead, RandomDistributionMissionInput } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { cn } from "@lib/utils"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel } from "./mission-builder-utils"

export function RandomDistributionMissionBuilder({
  categories,
  chats,
}: {
  categories: CategoryRead[]
  chats: ChatRead[]
}) {
  const [maximumRetries, setMaximumRetries] = useState(0)
  const [messagesAmount, setMessagesAmount] = useState(1)
  const [messagesAmountPerCharacter, setMessagesAmountPerCharacter] = useState(1)
  const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
  const [shouldFilterChatCategoriesWithCount, setShouldFilterChatCategoriesWithCount] = useState(true)
  const [shouldFilterProfileCategoriesWithCount, setShouldFilterProfileCategoriesWithCount] = useState(true)
  const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
  const [startTime, setStartTime] = useState<Date | undefined>(undefined)
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

  useEffect(() => {
    const payload: Partial<RandomDistributionMissionInput> = {}

    if (maximumRetries >= 0) {
      payload.max_retries = maximumRetries
    }

    payload.start_time = startTime?.toISOString()

    payload.messages = messages.map(message => ({
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

  const activeChatCategories = categories.filter(category =>
    shouldFilterChatCategoriesWithCount ? category.chat_count && category.chat_count > 0 : true,
  )
  const activeProfileCategories = categories.filter(category =>
    shouldFilterProfileCategoriesWithCount ? category.character_count && category.character_count > 0 : true,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-8 p-2">
        <MessageBuilder onUpdateMessages={messages => setMessages(messages)} />
        <InputWithLabel
          label="Global messages amount"
          type="number"
          value={messagesAmount}
          onBlur={e => {
            if (Number(e.target.value) <= 0) {
              e.target.value = "1"
            }
          }}
          onChange={e => setMessagesAmount(Number(e.target.value))}
          className="w-28 max-w-28"
        />
        <InputWithLabel
          label="Messages amount per character"
          type="number"
          value={messagesAmountPerCharacter}
          onBlur={e => {
            if (Number(e.target.value) <= 0) {
              e.target.value = "1"
            }
          }}
          onChange={e => setMessagesAmountPerCharacter(Number(e.target.value))}
          className="w-28 max-w-28"
        />
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
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col gap-4">
            <CategorySelector
              categories={activeChatCategories}
              label="Chat categories"
              onChangeValue={value => setChatCategories(value)}
              header={
                <div className="relative flex flex-row items-center gap-2">
                  <Checkbox
                    checked={shouldFilterChatCategoriesWithCount}
                    onCheckedChange={checked => {
                      return setShouldFilterChatCategoriesWithCount(checked === "indeterminate" ? false : checked)
                    }}
                  />
                  <Label className="text-sm">Filter chat categories with count</Label>
                </div>
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <CategorySelector
            categories={activeProfileCategories}
            label="Profile categores"
            onChangeValue={value => setProfileCategories(value)}
            header={
              <div className="relative flex flex-row items-center gap-2">
                <Checkbox
                  checked={shouldFilterProfileCategoriesWithCount}
                  onCheckedChange={checked => {
                    return setShouldFilterProfileCategoriesWithCount(checked === "indeterminate" ? false : checked)
                  }}
                />
                <Label className="text-sm">Filter chat categories with count</Label>
              </div>
            }
          />
        </div>
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
