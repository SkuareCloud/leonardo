"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { ChartPieIcon, ListIcon } from "lucide-react"
import { AvatarsList } from "./avatars-list"
import { AvatarsStats } from "./avatars-stats"

export function AvatarsView({ avatars }: { avatars: AvatarModelWithProxy[] }) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <Tabs defaultValue="list" className="">
        <TabsList>
          <TabsTrigger value="list" className="px-4 min-w-24 flex flex-row items-center">
            <ListIcon className="size-4 mr-2" />
            List
          </TabsTrigger>
          <TabsTrigger value="stats" className="px-4 min-w-24 flex flex-row items-center">
            <ChartPieIcon className="size-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="pt-6">
          <AvatarsList avatars={avatars} />
        </TabsContent>
        <TabsContent value="stats" className="pt-6">
          <AvatarsStats avatars={avatars} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
