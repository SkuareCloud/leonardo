"use client"

import { MediaItem, MessageWithMedia } from "@lib/api/models"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { SmileIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ChatBubble } from "./chat-bubble"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"

function MessagePreview({
  message,
  onRemove,
  className,
}: {
  message: MessageWithMedia
  onRemove: () => any
  className?: string
}) {
  return (
    <div className={cn("flex flex-row items-center gap-20", className)}>
      <ChatBubble className="max-w-[280px] w-fit">
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-start justify-between gap-3 min-w-0">
            <div className="text-sm leading-relaxed break-words flex-1">{message.text}</div>
            <XIcon
              className="w-8 h-8 text-gray-500 hover:text-gray-700 flex-shrink-0 p-2 cursor-pointer hover:bg-gray-200 hover:scale-110 scale-100 active:scale-90 rounded-full transition-colors duration-200"
              onClick={() => onRemove()}
            />
          </div>
          {message.media && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img
                src={message.media.uri}
                alt="media"
                className="w-32 h-auto object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
        </div>
      </ChatBubble>
    </div>
  )
}

export function MessageBuilder({
  singleMessage,
  onUpdateMessages,
}: {
  singleMessage?: boolean
  onUpdateMessages: (messages: MessageWithMedia[]) => void
}) {
  const [messages, setMessages] = useState<MessageWithMedia[]>([])
  const [activeMessageText, setActiveMessageText] = useState<string | null>(null)
  const [activeMessageMedia, setActiveMessageMedia] = useState<MediaItem | null>(null)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeMessageMediaKey = activeMessageMedia?.name ? activeMessageMedia.name.split("/").pop() : null

  useEffect(() => {
    setIsLoadingMedia(true)
    new ServiceBrowserClient()
      .getMedia()
      .then(media => {
        setMedia(media)
      })
      .finally(() => setIsLoadingMedia(false))
  }, [])

  function addMessage() {
    const newMessages: MessageWithMedia[] = [
      ...messages,
      { text: activeMessageText || undefined, media: activeMessageMedia || undefined },
    ]
    onUpdateMessages(newMessages)
    setActiveMessageText(null)
    setMessages(newMessages)
  }

  function removeMessage(index: number) {
    const newMessages = messages.slice(0, index).concat(messages.slice(index + 1))
    onUpdateMessages(newMessages)
    setMessages(newMessages)
  }

  function handleEmojiClick(emojiData: any) {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentText = activeMessageText || ""
      const newText = currentText.substring(0, start) + emojiData.emoji + currentText.substring(end)
      
      setActiveMessageText(newText)
      
      // Set cursor position after the emoji
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length)
      }, 0)
    }
    setShowEmojiPicker(false)
  }

  const showNewMessage = singleMessage ? messages.length === 0 : true

  return (
    <div>
      {/* preview */}
      {messages.map((message, index) => (
        <div key={index} className="flex flex-row items-center gap-2 w-fit">
          <MessagePreview message={message} onRemove={() => removeMessage(index)} />
        </div>
      ))}

      {/* new message */}
      {showNewMessage && (
        <div className="flex flex-row items-center gap-20">
          <ChatBubble className="flex flex-col gap-2 bg-transparent border-1 w-[300px]">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="message"
                value={activeMessageText ?? ""}
                onChange={e => {
                  setActiveMessageText(e.currentTarget.value || null)
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (!activeMessageText || !activeMessageMedia) {
                      return
                    }
                    addMessage()
                  }
                }}
                className="w-[300px] bg-transparent placeholder:text-gray-700 border-0 outline-0 focus-0 ring-0 shadow-none pr-10"
                placeholder="Type a message..."
              />
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-10 top-1.5 h-5 w-5 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <SmileIcon className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-auto p-0">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={300}
                    height={350}
                    theme={Theme.LIGHT}
                    lazyLoadEmojis={true}
                    previewConfig={{
                      showPreview: false
                    }}
                    skinTonesDisabled={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={activeMessageMediaKey ?? undefined}
              onOpenChange={async () => {
                if (!media) {
                  const fetchedMedia = await new ServiceBrowserClient().getMedia()
                  setMedia(fetchedMedia)
                }
              }}
              onValueChange={item => {
                const mediaItems = media.filter(currItem => currItem.key.endsWith(item))
                if (!mediaItems || mediaItems.length <= 0) {
                  return
                }
                const mediaItem = mediaItems[0]
                setActiveMessageMedia(mediaItem)
              }}
            >
              <SelectTrigger className="min-h-12 w-[80%]">
                <SelectValue placeholder="Select media">
                  {activeMessageMediaKey}
                  {activeMessageMedia?.uri && (
                    <img src={activeMessageMedia?.uri} alt="media" className="w-8 h-8 rounded-lg object-cover" />
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {isLoadingMedia && <SelectItem value="loading">Loading...</SelectItem>}
                {!isLoadingMedia &&
                  media.map(item => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                      <img src={item.uri} alt="media" className="w-8 h-8 rounded-lg object-cover" />
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </ChatBubble>
        </div>
      )}

      <Button
        onClick={() => {
          if (!activeMessageText && !activeMessageMedia) {
            return
          }
          const newMessages = [
            ...messages,
            { text: activeMessageText ?? undefined, media: activeMessageMedia ?? undefined },
          ]
          onUpdateMessages(newMessages)
          setMessages(newMessages)
          setActiveMessageText(null)
          setActiveMessageMedia(null)
        }}
      >
        Add
      </Button>
    </div>
  )
}
