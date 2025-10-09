"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { CategoryRead } from "@lib/api/orchestrator"
import { ChartPieIcon, ListIcon } from "lucide-react"
import { AvatarsList } from "./avatars-list"
import { AvatarsStats } from "./avatars-stats"

export function AvatarsView({
    avatars,
    allCategories,
}: {
    avatars: AvatarModelWithProxy[]
    allCategories: CategoryRead[]
}) {
    return (
        <div className="flex w-full flex-col gap-6">
            <Tabs defaultValue="list" className="">
                <TabsList>
                    <TabsTrigger value="list" className="flex min-w-24 flex-row items-center px-4">
                        <ListIcon className="mr-2 size-4" />
                        List
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex min-w-24 flex-row items-center px-4">
                        <ChartPieIcon className="mr-2 size-4" />
                        Statistics
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="pt-6">
                    <AvatarsList avatars={avatars} allCategories={allCategories} />
                </TabsContent>
                <TabsContent value="stats" className="pt-6">
                    <AvatarsStats avatars={avatars} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
