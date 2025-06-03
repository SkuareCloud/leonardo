"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ChatRead, ChatType } from "@lib/api/orchestrator/types.gen";
import { RefreshCcwIcon } from "lucide-react";
import { useState } from "react";

const chatColumns: ColumnDef<ChatRead>[] = [
  {
    accessorKey: "title",
    header: "Title",
    size: 200,
    cell: ({ row }) => {
      const chat = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{chat.title || "Untitled"}</span>
          {chat.username && (
            <span className="text-sm text-gray-500">@{chat.username}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "chat_type",
    header: "Type",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original;
      const typeColors: Record<ChatType, { bg: string; text: string }> = {
        User: { bg: "bg-blue-50", text: "text-blue-800" },
        Group: { bg: "bg-green-50", text: "text-green-800" },
        Channel: { bg: "bg-purple-50", text: "text-purple-800" },
        Bot: { bg: "bg-amber-50", text: "text-amber-800" },
        Unknown: { bg: "bg-gray-50", text: "text-gray-800" },
      };
      const colors = typeColors[chat.chat_type || "Unknown"];
      return (
        <span>
          <Badge className={cn(colors.bg, colors.text)}>
            {chat.chat_type || "Unknown"}
          </Badge>
        </span>
      );
    },
  },
  {
    accessorKey: "platform",
    header: "Platform",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original;
      return <span>{chat.platform || "Unknown"}</span>;
    },
  },
  {
    accessorKey: "platform_participants_count",
    header: "Participants",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original;
      return (
        <div className="flex flex-col">
          <span>
            {chat.platform_participants_count?.toLocaleString() || "0"}
          </span>
          {chat.active_participants_count && (
            <span className="text-sm text-gray-500">
              {chat.active_participants_count.toLocaleString()} active
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "messages_count_last_month",
    header: "Activity",
    size: 150,
    cell: ({ row }) => {
      const chat = row.original;
      return (
        <div className="flex flex-col">
          <span>
            {chat.messages_count_last_month?.toLocaleString() || "0"} messages
          </span>
          <span>
            {chat.replies_count_last_month?.toLocaleString() || "0"} replies
          </span>
          <span>
            {chat.forwards_count_last_month?.toLocaleString() || "0"} forwards
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "median_views",
    header: "Engagement",
    size: 150,
    cell: ({ row }) => {
      const chat = row.original;
      return (
        <div className="flex flex-col">
          <span>{chat.median_views?.toLocaleString() || "0"} views/msg</span>
          <span>
            {chat.average_reactions?.toLocaleString() || "0"} reactions/msg
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 100,
    cell: ({ row }) => {
      const chat = row.original;
      return <span>{chat.category || "Uncategorized"}</span>;
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    size: 200,
    cell: ({ row }) => {
      const chat = row.original;
      return <span className="font-mono text-sm">{chat.id}</span>;
    },
  },
];

export function ChatsList({ chats: initialChats }: { chats: ChatRead[] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full pr-16">
        <div className="mb-12 flex flex-row items-center gap-6 h-4 w-full">
          <Button
            variant="link"
            className="bg-gray-100 p-1 rounded-full hover:bg-gray-200"
            onClick={async () => {
              setIsRefreshing(true);
              // TODO: Implement refresh functionality
              setIsRefreshing(false);
            }}
          >
            <RefreshCcwIcon
              className={cn(
                "size-3 text-gray-500",
                isRefreshing && "animate-[spin_1s_linear_reverse_infinite]"
              )}
            />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 max-w-[1280px]">
        <DataTable
          columns={chatColumns}
          data={initialChats}
          header={({ table }) => {
            return (
              <div>
                <Input
                  placeholder="Filter by title..."
                  value={
                    (table.getColumn("title")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("title")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
