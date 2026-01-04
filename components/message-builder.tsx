"use client"

import { MediaItem, MessageWithMedia } from "@lib/api/models"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import EmojiPicker, { Theme } from "emoji-picker-react"
import { PlusIcon, SmileIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { ChatBubble } from "./chat-bubble"
import { Dropzone } from "./dropzone"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
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
            <ChatBubble className="w-fit max-w-[280px]">
                <div className="flex flex-col gap-3">
                    <div className="flex min-w-0 flex-row items-start justify-between gap-3">
                        <div className="flex-1 text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {message.text}
                        </div>
                        <XIcon
                            className="h-8 w-8 flex-shrink-0 scale-100 cursor-pointer rounded-full p-2 text-gray-500 transition-colors duration-200 hover:scale-110 hover:bg-gray-200 hover:text-gray-700 active:scale-90"
                            onClick={() => onRemove()}
                        />
                    </div>
                    {message.media && (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <img
                                src={message.media.uri}
                                alt="media"
                                className="h-auto w-32 object-cover transition-transform duration-200 hover:scale-105"
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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

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
            const newText =
                currentText.substring(0, start) + emojiData.emoji + currentText.substring(end)

            setActiveMessageText(newText)

            // Set cursor position after the emoji
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(
                    start + emojiData.emoji.length,
                    start + emojiData.emoji.length,
                )
            }, 0)
        }
        setShowEmojiPicker(false)
    }

    const showNewMessage = singleMessage ? messages.length === 0 : true

    return (
        <div>
            {/* preview */}
            {messages.map((message, index) => (
                <div key={index} className="flex w-fit flex-row items-center gap-2">
                    <MessagePreview message={message} onRemove={() => removeMessage(index)} />
                </div>
            ))}

            {/* new message */}
            {showNewMessage && (
                <div className="flex flex-row items-center gap-20">
                    <ChatBubble className="flex w-[300px] flex-col gap-2 border-1 bg-transparent">
                        <div className="relative">
                            <Textarea
                                ref={textareaRef}
                                id="message"
                                value={activeMessageText ?? ""}
                                onChange={(e) => {
                                    setActiveMessageText(e.currentTarget.value || null)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (!activeMessageText || !activeMessageMedia) {
                                            return
                                        }
                                        addMessage()
                                    }
                                }}
                                className="focus-0 w-[300px] border-0 bg-transparent pr-10 shadow-none ring-0 outline-0 placeholder:text-gray-700"
                                placeholder="Type a message..."
                            />
                            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1.5 right-10 h-5 w-5 rounded-full p-0 hover:bg-gray-100"
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
                                            showPreview: false,
                                        }}
                                        skinTonesDisabled={true}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeMessageMedia ? (
                                <div className="flex items-center gap-2">
                                    <img
                                        src={activeMessageMedia.uri}
                                        alt="media"
                                        className="h-12 w-12 rounded-lg object-cover"
                                    />
                                    <span className="max-w-[120px] truncate text-sm">
                                        {activeMessageMedia.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveMessageMedia(null)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <XIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Dialog
                                    open={isUploadDialogOpen}
                                    onOpenChange={setIsUploadDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
                                        >
                                            <PlusIcon className="mr-1 h-4 w-4" />
                                            Upload Media
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Upload media</DialogTitle>
                                            <DialogDescription asChild>
                                                <div>
                                                    <Dropzone
                                                        onUpload={async (files) => {
                                                            if (files.length === 0) {
                                                                console.log(
                                                                    "[MessageBuilder] No files to upload",
                                                                )
                                                                return
                                                            }
                                                            console.log(
                                                                "[MessageBuilder] Uploading files:",
                                                                files.map((f) => f.name),
                                                            )
                                                            try {
                                                                console.log(
                                                                    "[MessageBuilder] Calling uploadMedia...",
                                                                )
                                                                await new ServiceBrowserClient().uploadMedia(
                                                                    files,
                                                                )
                                                                console.log(
                                                                    "[MessageBuilder] Upload complete, fetching media list...",
                                                                )
                                                                // Fetch the uploaded media to get its URI
                                                                const allMedia =
                                                                    await new ServiceBrowserClient().getMedia()
                                                                console.log(
                                                                    "[MessageBuilder] All media:",
                                                                    allMedia.map((m) => m.name),
                                                                )
                                                                // Find the just-uploaded file by name
                                                                const uploadedFile = allMedia.find(
                                                                    (m) =>
                                                                        m.name === files[0].name ||
                                                                        m.name.endsWith(
                                                                            files[0].name,
                                                                        ),
                                                                )
                                                                console.log(
                                                                    "[MessageBuilder] Found uploaded file:",
                                                                    uploadedFile,
                                                                )
                                                                if (uploadedFile) {
                                                                    setActiveMessageMedia(
                                                                        uploadedFile,
                                                                    )
                                                                }
                                                                setIsUploadDialogOpen(false)
                                                                toast.success("Media uploaded")
                                                            } catch (error) {
                                                                console.error(
                                                                    "[MessageBuilder] Upload failed:",
                                                                    error,
                                                                )
                                                                toast.error(
                                                                    `Failed to upload media: ${error instanceof Error ? error.message : "Unknown error"}`,
                                                                )
                                                            }
                                                        }}
                                                        size="compact"
                                                    />
                                                </div>
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
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
                        {
                            text: activeMessageText ?? undefined,
                            media: activeMessageMedia ?? undefined,
                        },
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
