"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvatarRead } from "@lib/api/avatars"
import { CategoryRead } from "@lib/api/orchestrator"
import { ListIcon } from "lucide-react"
import { AvatarsList } from "./avatars-list"

export function AvatarsView({
    avatars,
    allCategories,
}: {
    avatars: AvatarRead[]
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
                </TabsList>
                <TabsContent value="list" className="pt-6">
                    <AvatarsList avatars={avatars} allCategories={allCategories} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
