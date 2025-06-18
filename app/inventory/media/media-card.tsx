"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MediaItem } from "@lib/api/models"
import { cn } from "@lib/utils"
import { SquareArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

export function MediaCard({ mediaItem, className }: { mediaItem: MediaItem; className?: string }) {
  return (
    <Card className={cn("w-full bg-gradient-to-b from-white to-gray-100", className)}>
      <CardHeader>
        <CardDescription>{mediaItem.key}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex flex-col gap-2">
          {mediaItem.name}
          <Link
            href={mediaItem.previewS3Url}
            target="_blank"
            className="flex flex-row items-center gap-2 text-xs uppercase"
          >
            <SquareArrowUpRightIcon className="size-4 -mr-1" /> <span>Open</span>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={mediaItem.previewS3Url}
          alt={mediaItem.name}
          width={100}
          height={100}
          className="h-full w-fit rounded-md shadow-lg/10"
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex flex-1" />
        <div className="text-muted-foreground">Last updated: {mediaItem.lastUpdated.toLocaleDateString()}</div>
      </CardFooter>
    </Card>
  )
}
