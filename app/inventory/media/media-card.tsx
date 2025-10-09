"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { MediaItem } from "@lib/api/models"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import { SquareArrowUpRightIcon, TrashIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export function MediaCard({
    mediaItem,
    onDelete,
    className,
}: {
    mediaItem: MediaItem
    onDelete: () => void
    className?: string
}) {
    return (
        <Card className={cn("w-full bg-gradient-to-b from-white to-gray-100", className)}>
            <CardHeader>
                <CardDescription>{mediaItem.key}</CardDescription>
                <CardTitle className="flex flex-row justify-between gap-2 text-2xl font-semibold">
                    <div className="flex flex-col">
                        {mediaItem.name}
                        <Link
                            href={mediaItem.uri}
                            target="_blank"
                            className="flex flex-row items-center gap-2 text-xs uppercase"
                        >
                            <SquareArrowUpRightIcon className="-mr-1 size-4" /> <span>Open</span>
                        </Link>
                    </div>
                    <div className="text-muted-foreground text-sm">
                        <Button
                            className="cursor-pointer transition-all duration-300 hover:scale-[102%] active:scale-[98%]"
                            variant="destructive"
                            onClick={async () => {
                                await new ServiceBrowserClient().deleteMedia(mediaItem.key)
                                onDelete()
                                toast.success("Media deleted")
                            }}
                        >
                            <TrashIcon className="size-4" />
                            Delete
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <img
                    src={mediaItem.uri}
                    alt={mediaItem.name}
                    width={100}
                    height={100}
                    className="h-full w-fit rounded-md shadow-lg/10"
                />
            </CardContent>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="flex flex-1" />
                <div className="text-muted-foreground">
                    Last updated: {mediaItem.lastUpdated.toLocaleDateString()}
                </div>
            </CardFooter>
        </Card>
    )
}
