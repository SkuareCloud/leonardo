"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { CategoryRead, ChatRead, RandomDistributionMissionInput } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { ChevronDown } from "lucide-react"
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
  const [messagesAmount, setMessagesAmount] = useState<number | string>(200)
  const [messagesAmountPerCharacter, setMessagesAmountPerCharacter] = useState<number | string>(5)
  const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
  const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
  const [startTime, setStartTime] = useState<Date | undefined>(() => {
    const now = new Date()
    // Create a new Date in UTC
    const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
    utcNow.setMilliseconds(0)
    return utcNow
  })
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const [isAdvancedOptionsOpen, setIsAdvancedOptionsOpen] = useState(false)
  const [maxMessagesPerChat, setMaxMessagesPerChat] = useState<number | string>(1)
  const [batchSize, setBatchSize] = useState<number | string>(10)
  const [batchInterval, setBatchInterval] = useState<number | string>(5)
  const [randomChoice, setRandomChoice] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

  // Initialize start time to current time and trigger DateTimePicker
  useEffect(() => {
    if (startTime) {
      // This will make the DateTimePicker show the current time
      const initialTime = new Date(startTime)
      initialTime.setMilliseconds(0)
      setStartTime(initialTime)
    }
  }, [])

  useEffect(() => {
    const payload: Partial<RandomDistributionMissionInput> = {}

    payload.max_retries = Math.max(0, maximumRetries)

    payload.start_time = startTime ? new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000).toISOString() : new Date().toISOString()

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

    payload.messages_amount = typeof messagesAmount === 'string' ? Number(messagesAmount) || 1000 : messagesAmount
    payload.messages_amount_per_character = typeof messagesAmountPerCharacter === 'string' ? Number(messagesAmountPerCharacter) || 5 : messagesAmountPerCharacter
    payload.max_messages_per_chat = typeof maxMessagesPerChat === 'string' ? Number(maxMessagesPerChat) || 1 : maxMessagesPerChat
    payload.batch_size = typeof batchSize === 'string' ? Number(batchSize) || 10 : batchSize
    payload.batch_interval = typeof batchInterval === 'string' ? Number(batchInterval) || 5 : batchInterval
    payload.random_choice = randomChoice

    payload.chat_categories = chatCategories.length > 0 ? chatCategories.map(c => c.label) : []
    payload.characters_categories = profileCategories.length > 0 ? profileCategories.map(c => c.label) : []

    onChangeMissionPayload(payload as MissionInput<RandomDistributionMissionInput>)
  }, [
    messages,
    maximumRetries,
    messagesAmount,
    messagesAmountPerCharacter,
    maxMessagesPerChat,
    batchSize,
    batchInterval,
    randomChoice,
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

  const activeChatCategories = categories
  const activeProfileCategories = categories

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-8 p-2">
        <MessageBuilder onUpdateMessages={messages => setMessages(messages)} />
        
        <Collapsible open={isAdvancedOptionsOpen} onOpenChange={setIsAdvancedOptionsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer hover:opacity-80">
            <Label>Advanced Settings</Label>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isAdvancedOptionsOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-8 p-6 border-2 border-dashed border-blue-200 rounded-lg bg-gradient-to-br from-blue-50/50 to-purple-50/50 backdrop-blur-sm dark:from-blue-950/30 dark:to-purple-950/30 dark:border-blue-800">
              <InputWithLabel
                label="Global messages amount"
                type="number"
                min="1"
                value={messagesAmount}
                onBlur={e => {
                  const value = Number(e.target.value)
                  if (e.target.value === "" || value <= 0 || isNaN(value)) {
                    setMessagesAmount(1000)
                  }
                }}
                onChange={e => setMessagesAmount(e.target.value)}
                className="w-28 max-w-28"
              />
              <InputWithLabel
                label="Messages amount per character"
                type="number"
                min="1"
                value={messagesAmountPerCharacter}
                onBlur={e => {
                  const value = Number(e.target.value)
                  if (e.target.value === "" || value <= 0 || isNaN(value)) {
                    setMessagesAmountPerCharacter(5)
                  }
                }}
                onChange={e => setMessagesAmountPerCharacter(e.target.value)}
                className="w-28 max-w-28"
              />
              <InputWithLabel
                label="Max messages per chat"
                type="number"
                min="1"
                value={maxMessagesPerChat}
                onBlur={e => {
                  const value = Number(e.target.value)
                  if (e.target.value === "" || value <= 0 || isNaN(value)) {
                    setMaxMessagesPerChat(1)
                  }
                }}
                onChange={e => setMaxMessagesPerChat(e.target.value)}
                className="w-28 max-w-28"
              />
              <InputWithLabel
                label="Batch size"
                type="number"
                min="1"
                value={batchSize}
                onBlur={e => {
                  const value = Number(e.target.value)
                  if (e.target.value === "" || value <= 0 || isNaN(value)) {
                    setBatchSize(10)
                  }
                }}
                onChange={e => setBatchSize(e.target.value)}
                className="w-28 max-w-28"
              />
              <InputWithLabel
                label="Batch interval (minutes)"
                type="number"
                min="1"
                value={batchInterval}
                onBlur={e => {
                  const value = Number(e.target.value)
                  if (e.target.value === "" || value <= 0 || isNaN(value)) {
                    setBatchInterval(5)
                  }
                }}
                onChange={e => setBatchInterval(e.target.value)}
                className="w-28 max-w-28"
              />
              <FieldWithLabel label="Random choice">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="random-choice"
                    checked={randomChoice}
                    onCheckedChange={checked => {
                      setRandomChoice(checked === "indeterminate" ? false : checked)
                    }}
                  />
                  <Label htmlFor="random-choice" className="text-sm">
                    Enable random character selection
                  </Label>
                </div>
              </FieldWithLabel>
              <FieldWithLabel required label="Start time">
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex flex-row gap-2 items-center">
                    <DateTimePicker
                      key={resetKey}
                      resetable
                      onSelectDate={value => {
                        logger.info("Changing trigger time", value)
                        value.setMilliseconds(0)
                        setStartTime(value)
                      }}
                    />
                  </div>
                  {triggerTimeFromNow && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 pl-2">
                      {triggerTimeFromNow}
                    </div>
                  )}
                </div>
              </FieldWithLabel>
              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-col gap-4">
                  <CategorySelector
                    categories={activeChatCategories}
                    label="Chat categories"
                    onChangeValue={value => setChatCategories(value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <CategorySelector
                  categories={activeProfileCategories}
                  label="Profile categories"
                  onChangeValue={value => setProfileCategories(value)}
                />
              </div>
              <FieldWithLabel label="Maximum retries">
                <Slider
                  min={0} 
                  max={10}
                  step={1}
                  value={[maximumRetries]}
                  onValueChange={value => setMaximumRetries(value[0])}
                  className="w-96"
                />
              </FieldWithLabel>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
