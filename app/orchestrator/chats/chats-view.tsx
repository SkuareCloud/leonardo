"use client"

import { TreeNode, default as VerticalTree } from "@/components/tree"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryWithChatCount, ChatWithCategory } from "@lib/api/models"
import { CategoryRead } from "@lib/api/orchestrator"
import { Handle, Position } from "@xyflow/react"
import { ListIcon, NetworkIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ChatsList } from "./chats-list"

type ChatNodeData = {
  category: CategoryRead
  count: number
}

function ChatNode({ data }: { data: ChatNodeData }) {
  return (
    <div className="border-1 bg-white hover:bg-gray-100/50 scale-100 hover:scale-105 active:scale-95 min-w-16 min-h-4 px-5 py-3 flex items-center justify-center rounded-xl shadow-xl/5 transition-all">
      <div className="flex items-center gap-2">
        <span className="font-bold mr-1">{data.category.name}</span> <Badge variant="default">{data.count}</Badge>
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function generateTree(categoriesWithChatCount: CategoryWithChatCount[]): TreeNode<ChatNodeData> {
  const buildNode = (category: CategoryWithChatCount): TreeNode<ChatNodeData> | null => {
    const children = categoriesWithChatCount.filter(({ category: c }) => c.parent_id === category.category.id)
    return {
      id: category.category.id,
      type: "chatCategory",
      data: { category: category.category, count: category.count },
      children: children.map(child => buildNode(child)).filter(Boolean) as TreeNode<ChatNodeData>[],
    }
  }

  // Find root category (the one without a parent)
  const rootCategory = categoriesWithChatCount.find(cat => !cat.category.parent_id)
  if (!rootCategory) {
    throw new Error("No root category found")
  }

  return buildNode(rootCategory) as TreeNode<ChatNodeData>
}

export function ChatsView({
  categoriesWithChatCount,
  chatsByCategoryId,
  category,
  tab,
}: {
  categoriesWithChatCount: CategoryWithChatCount[]
  chatsByCategoryId: Record<string, ChatWithCategory[]>
  category: string | null
  tab: string | null
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(tab || "list")
  const [activeCategory, setActiveCategory] = useState(category || null)
  const tree = generateTree(categoriesWithChatCount)

  useEffect(() => {
    console.log("tab", tab)
    setActiveTab(tab || "tree")
  }, [tab])

  useEffect(() => {
    setActiveCategory(category || null)
  }, [category])

  const onNodeClick = (ev: React.MouseEvent, node: any) => {
    // @ts-ignore
    if (!node.id) return
    // @ts-ignore
    const categoryId = node.id
    setActiveTab("list")
    setActiveCategory(categoryId)
    router.push(`/orchestrator/chats?tab=list&category=${categoryId}`)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Tabs value={activeTab} className="" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tree" className="px-4 min-w-24 flex flex-row items-center">
            <NetworkIcon className="size-4 mr-2" />
            Tree
          </TabsTrigger>
          <TabsTrigger value="list" className="px-4 min-w-24 flex flex-row items-center">
            <ListIcon className="size-4 mr-2" />
            List
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="pt-6">
          <ChatsList
            chatsWithCategory={Object.values(chatsByCategoryId).flat()}
            categoriesWithChatCount={categoriesWithChatCount}
            category={activeCategory}
            onChangeTab={setActiveTab}
          />
        </TabsContent>
        <TabsContent value="tree" className="pt-6 px-28 py-8">
          <VerticalTree
            tree={tree}
            nodeTypes={{ chatCategory: ChatNode }}
            onNodeClick={onNodeClick}
            className="w-[70vw] h-[60vh]"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
