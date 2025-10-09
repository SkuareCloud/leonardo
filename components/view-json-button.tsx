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
import { Editor } from "@monaco-editor/react"
import { CodeIcon } from "lucide-react"
import { useState } from "react"

export function ViewJsonButton({
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
                    <CodeIcon className="mr-2 h-4 w-4" />
                    View JSON
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] !w-[40vw] !max-w-none">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{subtitle}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 h-[70vh]">
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        value={JSON.stringify(content, null, 2)}
                        options={{
                            readOnly: true,
                            fontSize: 14,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            folding: true,
                            lineNumbers: "on",
                            renderWhitespace: "selection",
                        }}
                        theme="vs-dark"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
