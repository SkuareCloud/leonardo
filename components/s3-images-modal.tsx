"use client"

import { Badge } from "@/components/ui/badge"
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
import { ImageIcon, Loader2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface S3ImagesModalProps {
    scenarioId: string
}

interface ImagePreviewModalProps {
    image: MediaItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function ImagePreviewModal({ image, open, onOpenChange }: ImagePreviewModalProps) {
    if (!image) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] !w-[95vw] !max-w-none p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>
                        Screenshot Preview - Action {image.metadata?.actionId} Run{" "}
                        {image.metadata?.runningIndex}
                    </DialogTitle>
                </DialogHeader>
                <div className="relative h-full w-full">
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {/* Image info header */}
                    <div className="absolute top-4 left-4 z-10 rounded-md bg-black/50 px-3 py-2 text-white">
                        <div className="text-sm font-medium">
                            Action {image.metadata?.actionId} - Run {image.metadata?.runningIndex}
                        </div>
                        <div className="text-xs opacity-75">
                            {(image.size / 1024).toFixed(1)} KB
                        </div>
                    </div>

                    {/* Full-size image */}
                    <div className="flex h-full w-full items-center justify-center bg-black">
                        <img
                            src={image.uri}
                            alt={image.name}
                            className="max-h-full max-w-full object-contain"
                            style={{ maxHeight: "calc(95vh - 2rem)" }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function S3ImagesModal({ scenarioId }: S3ImagesModalProps) {
    const [open, setOpen] = useState(false)
    const [images, setImages] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState<MediaItem | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)

    const loadImages = async () => {
        setLoading(true)
        try {
            const path = `${scenarioId}`
            const fetchedImages = await new ServiceBrowserClient().getS3Images(path)
            setImages(fetchedImages)
            toast.success(`Loaded ${fetchedImages.length} screenshots from ${path}`)
        } catch (error) {
            console.error("Failed to load images:", error)
            toast.error("Failed to load images")
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen && images.length === 0) {
            loadImages()
        }
    }

    const handleImageClick = (image: MediaItem) => {
        setPreviewImage(image)
        setPreviewOpen(true)
    }

    // Group images by action ID for better organization
    const groupedImages = images.reduce(
        (groups, image) => {
            const actionId = image.metadata?.actionId || "Unknown"
            if (!groups[actionId]) {
                groups[actionId] = []
            }
            groups[actionId].push(image)
            return groups
        },
        {} as Record<string, MediaItem[]>,
    )

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Action Screenshots
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] !w-[90vw] !max-w-none">
                    <DialogHeader>
                        <DialogTitle>Action Screenshots</DialogTitle>
                        <DialogDescription>
                            Screenshots from scenario {scenarioId} organized by action and run
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex flex-col gap-4">
                        {/* Refresh Button */}
                        <div className="flex justify-end">
                            <Button onClick={loadImages} disabled={loading}>
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                )}
                                Refresh Screenshots
                            </Button>
                        </div>

                        {/* Images by Action */}
                        <div className="max-h-[70vh] overflow-y-auto rounded-lg border p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                                    <span>Loading screenshots...</span>
                                </div>
                            ) : images.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    No screenshots found for scenario {scenarioId}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedImages).map(
                                        ([actionId, actionImages]) => (
                                            <div key={actionId} className="rounded-lg border p-4">
                                                <div className="mb-4 flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-sm font-medium"
                                                    >
                                                        Action {actionId}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        ({actionImages.length} screenshot
                                                        {actionImages.length !== 1 ? "s" : ""})
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                                    {actionImages.map((image) => (
                                                        <div
                                                            key={image.key}
                                                            className="group cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md"
                                                            onClick={() => handleImageClick(image)}
                                                        >
                                                            <div className="relative mb-2 aspect-square overflow-hidden rounded">
                                                                <img
                                                                    src={image.uri}
                                                                    alt={image.name}
                                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                                />
                                                                {/* Hover overlay */}
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                                                                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                                                        <ImageIcon className="h-8 w-8 text-white" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-sm">
                                                                <div className="mb-1 text-center font-medium">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        Run{" "}
                                                                        {
                                                                            image.metadata
                                                                                ?.runningIndex
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-center text-xs text-gray-500">
                                                                    {(image.size / 1024).toFixed(1)}{" "}
                                                                    KB
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        {images.length > 0 && (
                            <div className="text-center text-sm text-gray-500">
                                Found {images.length} screenshots across{" "}
                                {Object.keys(groupedImages).length} actions
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                image={previewImage}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
            />
        </>
    )
}
