"use client"

import { TreeNode } from "@/components/tree"
import { Badge } from "@/components/ui/badge"
import { CategoryWithChatCount } from "@lib/api/models"
import { CategoryRead, ChatView } from "@lib/api/orchestrator"
import { Handle, Position } from "@xyflow/react"
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

export function ChatsView({ chats, allCategories }: { chats: ChatView[]; allCategories: CategoryRead[] }) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <ChatsList chats={chats} allCategories={allCategories} />
    </div>
  )
}
