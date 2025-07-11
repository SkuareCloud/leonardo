"use client"

import { Combobox } from "@/components/combobox"
import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { CategoryRead, ChatRead, EchoMissionInput, ScenarioRead } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { useContext, useEffect, useState } from "react"
import { CategorySelector } from "./category-selector"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel, InputWithLabel, ModeButtonSelector } from "./mission-builder-utils"

export type EchoMissionMode = "message-plain" | "message-reference" | "scenario-id"

export function EchoMissionBuilder({
  scenarios,
  categories,
  chats,
}: {
  scenarios: ScenarioRead[]
  categories: CategoryRead[]
  chats: ChatRead[]
}) {
  const [maximumRetries, setMaximumRetries] = useState(0)
  const [messagePlain, setMessagePlain] = useState<MessageWithMedia | null>(null)
  const [mode, setMode] = useState<EchoMissionMode>("message-plain")
  const [scenarioId, setScenarioId] = useState("")
  const [chatId, setChatId] = useState("")
  const [chatCategories, setChatCategories] = useState<{ id: string; label: string }[]>([])
  const [profileCategories, setProfileCategories] = useState<{ id: string; label: string }[]>([])
  const [sendAtTriggerTime, setSendAtTriggerTime] = useState(false)
  const [triggerTime, setTriggerTime] = useState<Date | undefined>(undefined)
  const [messageReferencePlatformChatId, setMessageReferencePlatformChatId] = useState<number | undefined>(undefined)
  const [messageReferencePlatformChatName, setMessageReferencePlatformChatName] = useState<string | undefined>(
    undefined,
  )
  const [messageReferenceTimestamp, setMessageReferenceTimestamp] = useState<string | undefined>(undefined)
  const [messageReferenceMessageId, setMessageReferenceMessageId] = useState<number | undefined>(undefined)
  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

  // TODO: filter by chats with avatars
  const activeChats = chats.filter(chat => chat.chat_type === "Group")
  const activeChatCategories = categories.filter(category => category.chat_count && category.chat_count > 0)
  const activeProfileCategories = categories.filter(
    category => category.character_count && category.character_count > 0,
  )

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

    if (mode === "message-plain") {
      if (messagePlain) {
        payload.message = {
          message_content: {
            text: messagePlain?.text,
            attachments: messagePlain?.media
              ? [
                  {
                    url: messagePlain.media.s3Uri,
                    mime_type: messagePlain.media.mimeType,
                    name: messagePlain.media.name,
                  },
                ]
              : [],
          },
        }
      }
    } else if (mode === "message-reference") {
      payload.message = {
        message_info: {
          platform_chat_id: messageReferencePlatformChatId || undefined,
          platform_chat_name: messageReferencePlatformChatName || undefined,
          timestamp: messageReferenceTimestamp || undefined,
          message_id: messageReferenceMessageId || undefined,
        },
        message_content: {
          text: messagePlain?.text,
          attachments: messagePlain?.media
            ? [
                {
                  url: messagePlain.media.s3Uri,
                  mime_type: messagePlain.media.mimeType,
                  name: messagePlain.media.name,
                },
              ]
            : [],
        },
      }
    } else {
      payload.message = undefined
    }

    if (mode === "scenario-id") {
      if (scenarioId) {
        payload.scenario_external_id = scenarioId
      } else {
        payload.scenario_external_id = undefined
      }
    }

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
    messageReferencePlatformChatId,
    messageReferencePlatformChatName,
    messageReferenceTimestamp,
    messageReferenceMessageId,
    mode,
  ])

  const triggerTimeFromNow =
    triggerTime && triggerTime.getTime() > Date.now()
      ? new Intl.RelativeTimeFormat("en", { style: "long" }).format(
          Math.round((triggerTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          "day",
        )
      : undefined

  return (
    <div className="flex flex-col">
      <div className="flex flex-row flex-wrap w-fit gap-8">
        <ModeButtonSelector
          active={mode === "message-plain"}
          title="Plain Message"
          subtitle="Enter the message you wish to echo"
          onClick={() => setMode("message-plain")}
        />
        <ModeButtonSelector
          active={mode === "message-reference"}
          title="Message Reference"
          subtitle="Select a message by reference"
          onClick={() => setMode("message-reference")}
        />
        <ModeButtonSelector
          active={mode === "scenario-id"}
          unsupported={true}
          title="External Scenario"
          subtitle="Select a scenario from the list of scenarios"
          onClick={() => setMode("scenario-id")}
        />
      </div>
      <div className="flex flex-col gap-8 p-2">
        <FieldWithLabel required label="Select source chat">
          <Combobox
            options={activeChats
              .map(chat => {
                const value = chat.id
                let label = chat.username?.toString() || chat.platform_id?.toString()
                if (chat.title) {
                  label = `${label} (${chat.title})`
                }
                return {
                  value,
                  label: label || value,
                }
              })
              .filter(c => c.label)}
            value={chatId}
            onValueChange={value => setChatId(value)}
          />
        </FieldWithLabel>
        {mode === "message-plain" ||
          (mode === "message-reference" && (
            <MessageBuilder singleMessage onUpdateMessages={messages => setMessagePlain(messages[0] ?? null)} />
          ))}
        {mode === "message-reference" && (
          <div className="flex flex-col gap-2">
            <InputWithLabel
              label="Platform chat ID"
              type="number"
              value={messageReferencePlatformChatId}
              onChange={e => setMessageReferencePlatformChatId(e.target.value)}
            />
            <InputWithLabel
              label="Platform chat name"
              value={messageReferencePlatformChatName}
              onChange={e => setMessageReferencePlatformChatName(e.target.value)}
            />
            <InputWithLabel
              label="Timestamp"
              value={messageReferenceTimestamp}
              onChange={e => setMessageReferenceTimestamp(e.target.value)}
            />
            <InputWithLabel
              label="Message ID"
              value={messageReferenceMessageId}
              onChange={e => setMessageReferenceMessageId(e.target.value)}
            />
          </div>
        )}
        {mode === "scenario-id" && (
          <Combobox
            options={scenarios
              .filter(s => s.external_id)
              .map(scenario => ({
                value: scenario.external_id!,
                label: scenario.external_id!,
              }))}
            label="Select external scenario"
            value={scenarioId}
            onValueChange={value => setScenarioId(value)}
          />
        )}
        <FieldWithLabel label="Trigger time">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row gap-2">
              <DateTimePicker
                disabled={!sendAtTriggerTime}
                onSelectDate={value => {
                  logger.info("Changing trigger time", value)
                  value.setMilliseconds(0)
                  setTriggerTime(value)
                }}
              />
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
        {activeChatCategories.length > 0 && (
          <CategorySelector
            categories={activeChatCategories}
            label="Chat categories"
            onChangeValue={value => setChatCategories(value)}
          />
        )}
        {activeProfileCategories.length > 0 && (
          <CategorySelector
            categories={activeProfileCategories}
            label="Profile categories"
            onChangeValue={value => setProfileCategories(value)}
          />
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
