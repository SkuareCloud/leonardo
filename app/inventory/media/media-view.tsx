"use client"

import { Dropzone } from "@/components/dropzone"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MediaItem } from "@lib/api/models"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { MediaCard } from "./media-card"

export function MediaView({ media: initialMedia }: { media: MediaItem[] }) {
    const [media, setMedia] = useState(initialMedia)

    async function refreshMedia() {
        const media = await new ServiceBrowserClient().getMedia()
        await new Promise((resolve) => setTimeout(resolve, 1000)) // hack
        setMedia(media)
    }

    return (
        <div className="flex flex-col">
            <PageHeader title="Media" subtitle="Attachments to reuse across missions and scenarios">
                <Dialog>
                    <DialogTrigger>
                        <Button className="scale-100 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
                            <PlusIcon className="h-4 w-4" />
                            Upload
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload media</DialogTitle>
                            <DialogDescription>
                                <Dropzone
                                    onUpload={async (files) => {
                                        new ServiceBrowserClient().uploadMedia(files)
                                        await new Promise((resolve) => setTimeout(resolve, 1000)) // hack
                                        refreshMedia()
                                        toast.success("Media uploaded")
                                    }}
                                />
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                {media &&
                    media.map((item) => (
                        <MediaCard
                            key={item.name}
                            mediaItem={item}
                            onDelete={refreshMedia}
                            className="w-96"
                        />
                    ))}
            </div>
        </div>
    )
}
