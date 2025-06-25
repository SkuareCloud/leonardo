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
      <DialogContent className="!w-[95vw] !max-w-none max-h-[95vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Screenshot Preview - Action {image.metadata?.actionId} Run {image.metadata?.runningIndex}
          </DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-full">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Image info header */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-2 rounded-md">
            <div className="text-sm font-medium">
              Action {image.metadata?.actionId} - Run {image.metadata?.runningIndex}
            </div>
            <div className="text-xs opacity-75">
              {(image.size / 1024).toFixed(1)} KB
            </div>
          </div>
          
          {/* Full-size image */}
          <div className="w-full h-full flex items-center justify-center bg-black">
            <img
              src={image.uri}
              alt={image.name}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(95vh - 2rem)' }}
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
  const groupedImages = images.reduce((groups, image) => {
    const actionId = image.metadata?.actionId || "Unknown"
    if (!groups[actionId]) {
      groups[actionId] = []
    }
    groups[actionId].push(image)
    return groups
  }, {} as Record<string, MediaItem[]>)

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ImageIcon className="h-4 w-4 mr-2" />
            Action Screenshots
          </Button>
        </DialogTrigger>
        <DialogContent className="!w-[90vw] !max-w-none max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Action Screenshots</DialogTitle>
            <DialogDescription>
              Screenshots from scenario {scenarioId} organized by action and run
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-4">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button onClick={loadImages} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                Refresh Screenshots
              </Button>
            </div>

            {/* Images by Action */}
            <div className="border rounded-lg p-4 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading screenshots...</span>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No screenshots found for scenario {scenarioId}
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedImages).map(([actionId, actionImages]) => (
                    <div key={actionId} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="text-sm font-medium">
                          Action {actionId}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          ({actionImages.length} screenshot{actionImages.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {actionImages.map((image) => (
                          <div
                            key={image.key}
                            className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => handleImageClick(image)}
                          >
                            <div className="aspect-square mb-2 overflow-hidden rounded relative">
                              <img
                                src={image.uri}
                                alt={image.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ImageIcon className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium text-center mb-1">
                                <Badge variant="outline" className="text-xs">
                                  Run {image.metadata?.runningIndex}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 text-center">
                                {(image.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Summary */}
            {images.length > 0 && (
              <div className="text-sm text-gray-500 text-center">
                Found {images.length} screenshots across {Object.keys(groupedImages).length} actions
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
