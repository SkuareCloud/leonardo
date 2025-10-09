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
                <Button
                    variant="outline"
                    className="scale-100 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    View attachments
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] !w-[40vw] !max-w-none">
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
