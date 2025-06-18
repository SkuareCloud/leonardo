"use client"

import { InputMessage } from "@lib/api/orchestrator"
import { cn } from "@lib/utils"
import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

function ChatBubble({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-fit max-w-[80%] mb-4 flex items-start gap-2", className)}>
      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex-1">{children}</div>
    </div>
  )
}

export function MessageBuilder({ onUpdateMessages }: { onUpdateMessages: (messages: InputMessage[]) => void }) {
  const [messages, setMessages] = useState<InputMessage[]>([])
  const [activeMessage, setActiveMessage] = useState<InputMessage | null>(null)

  function addMessage(text: string) {
    const newMessages = [...messages, { text }]
    onUpdateMessages(newMessages)
    setActiveMessage(null)
    setMessages(newMessages)
  }

  function removeMessage(text: string) {
    const newMessages = messages.filter(message => message.text !== text)
    onUpdateMessages(newMessages)
    setMessages(newMessages)
  }

  return (
    <div>
      {messages.map(message => (
        <ChatBubble key={message.text}>
          <div className="flex flex-row items-center gap-2 w-fit">
            <div>{message.text}</div>
            <XIcon className="w-4 h-4 cursor-pointer" onClick={() => removeMessage(message.text ?? "")} />
          </div>
        </ChatBubble>
      ))}

      {/* new message */}
      <ChatBubble className="flex flex-col gap-2 bg-transparent border-1 w-[300px]">
        <Textarea
          value={activeMessage?.text ?? ""}
          onChange={e => setActiveMessage({ ...activeMessage, text: e.currentTarget.value })}
          onKeyDown={e => {
            if (e.key === "Enter") {
              const text = e.currentTarget.value
              addMessage(text)
            }
          }}
          className="w-[300px] bg-transparent placeholder:text-gray-700 border-0 outline-0 ring-0 shadow-none"
          placeholder="Type a message..."
        />
      </ChatBubble>

      <Button onClick={() => addMessage(activeMessage?.text ?? "")}>Add</Button>
    </div>
  )
}
