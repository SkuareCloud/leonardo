"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ImageIcon } from "lucide-react"
import { useState } from "react"
import { ChatBubble } from "./chat-bubble"

export function ViewAttachmentsButton({
  content,
  title,
  subtitle,
}: {
  content: Record<string, any>
  title: string
  subtitle: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer scale-100 hover:scale-105 active:scale-95 transition-all">
          <ImageIcon className="h-4 w-4 mr-2" />
          View attachments
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-[40vw] !max-w-none max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 h-[70vh]">
          {content.map((attachment: any) => (
            <ChatBubble key={attachment.id}>
              <img src={attachment.url} alt={attachment.name} />
            </ChatBubble>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
