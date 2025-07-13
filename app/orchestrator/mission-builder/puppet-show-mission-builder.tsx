"use client"

import { DateTimePicker } from "@/components/date-time-picker"
import { MessageBuilder } from "@/components/message-builder"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { MessageWithMedia, MissionInput } from "@lib/api/models"
import { FirstPuppetShowMessage, PuppetShowInput } from "@lib/api/orchestrator"
import { logger } from "@lib/logger"
import { PlusIcon, TrashIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { MissionBuilderContext } from "./mission-builder-context"
import { FieldWithLabel } from "./mission-builder-utils"

interface PuppetShowMessageState {
  id: string
  message: MessageWithMedia | null
  startTime: Date | undefined
}

export function PuppetShowMissionBuilder() {
  const [messages, setMessages] = useState<PuppetShowMessageState[]>([
    { id: crypto.randomUUID(), message: null, startTime: undefined }
  ])
  const [maxRetries, setMaxRetries] = useState(0)
  const { onChangeMissionPayload } = useContext(MissionBuilderContext)

  useEffect(() => {
    const payload: Partial<PuppetShowInput> = {}

    // Convert messages to FirstPuppetShowMessage format
    const firstMessages: FirstPuppetShowMessage[] = messages
      .filter(msg => msg.message && (msg.message.text || msg.message.media))
      .map(msg => ({
        message: {
          message_content: {
            text: msg.message?.text || undefined,
            attachments: msg.message?.media ? [
              {
                name: msg.message.media.name,
                url: msg.message.media.s3Uri,
                mime_type: msg.message.media.mimeType,
              }
            ] : [],
          },
        },
        start_time: msg.startTime ? msg.startTime.toISOString() : undefined,
      }))

    payload.first_messages = firstMessages
    
    if (maxRetries > 0) {
      payload.max_retries = maxRetries
    }

    onChangeMissionPayload(payload as MissionInput<PuppetShowInput>)
  }, [messages, maxRetries])

  const addMessage = () => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), message: null, startTime: undefined }])
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const updateMessage = (id: string, message: MessageWithMedia | null) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, message } : msg
    ))
  }

  const updateStartTime = (id: string, startTime: Date | undefined) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, startTime } : msg
    ))
  }

  const getTimeFromNow = (time: Date | undefined) => {
    if (!time || time.getTime() <= Date.now()) return undefined
    return new Intl.RelativeTimeFormat("en", { style: "long" }).format(
      Math.round((time.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-medium">First Messages</h3>
          <Button
            onClick={addMessage}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Message
          </Button>
        </div>
        
        <p className="text-sm text-gray-600">
          Configure the first messages that will be sent to start the puppet show. Each message can have an optional start time.
        </p>
        
        <div className="flex flex-col gap-4">
          {messages.map((messageState, index) => (
            <Card key={messageState.id} className="p-4">
              <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
                <CardTitle className="text-base">Message {index + 1}</CardTitle>
                {messages.length > 1 && (
                  <Button
                    onClick={() => removeMessage(messageState.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">Message Content</Label>
                    <MessageBuilder
                      singleMessage
                      onUpdateMessages={messages => updateMessage(messageState.id, messages[0] || null)}
                    />
                  </div>
                  
                  <div>
                    <FieldWithLabel label="Start Time (Optional)">
                      <div className="flex flex-col gap-2">
                        <DateTimePicker
                          onSelectDate={value => {
                            logger.info("Changing start time", value)
                            value.setMilliseconds(0)
                            updateStartTime(messageState.id, value)
                          }}
                        />
                        {messageState.startTime && (
                          <div className="text-sm text-gray-600">
                            {getTimeFromNow(messageState.startTime)}
                          </div>
                        )}
                      </div>
                    </FieldWithLabel>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Configuration</h3>
        
        <FieldWithLabel label="Maximum Retries">
          <div className="flex flex-col gap-2">
            <Slider
              min={0} 
              max={10}
              step={1}
              value={[maxRetries]}
              onValueChange={value => setMaxRetries(value[0])}
              className="w-96"
            />
            <div className="text-sm text-gray-600">
              Current: {maxRetries} {maxRetries === 1 ? 'retry' : 'retries'}
            </div>
          </div>
        </FieldWithLabel>
      </div>
    </div>
  )
} 