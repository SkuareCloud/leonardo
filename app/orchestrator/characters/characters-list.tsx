"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CharacterRead } from "@lib/api/orchestrator/types.gen";
import { RefreshCcwIcon } from "lucide-react";
import { useState } from "react";
import { ActiveIndicator } from "@/app/avatars/avatars/active-indicator";

const characterColumns: ColumnDef<CharacterRead>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 150,
    cell: ({ row }) => {
      const character = row.original;
      return <span>{character.name}</span>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      return (
        <span>
          <Badge
            className={cn(
              !character.is_active && "bg-red-50 text-red-800",
              character.is_active && "bg-green-100 text-green-800"
            )}
          >
            <div className="inline-flex flex-row items-center uppercase text-xs">
              <ActiveIndicator active={character.is_active} />
              {character.is_active ? "Active" : "Inactive"}
            </div>
          </Badge>
        </span>
      );
    },
  },
  {
    accessorKey: "is_bot",
    header: "Type",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      return (
        <span>
          <Badge
            className={cn(
              !character.is_bot && "bg-blue-50 text-blue-800",
              character.is_bot && "bg-purple-100 text-purple-800"
            )}
          >
            {character.is_bot ? "Bot" : "Human"}
          </Badge>
        </span>
      );
    },
  },
  {
    accessorKey: "origin",
    header: "Origin",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      return <span>{character.origin || "Unknown"}</span>;
    },
  },
  {
    accessorKey: "timezone",
    header: "Timezone",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      return <span>{character.timezone || "Unknown"}</span>;
    },
  },
  {
    accessorKey: "telegram_id",
    header: "Telegram ID",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      return <span>{character.telegram_id || "Not set"}</span>;
    },
  },
  {
    accessorKey: "id",
    header: "ID",
    size: 200,
    cell: ({ row }) => {
      const character = row.original;
      return <span className="font-mono text-sm">{character.id}</span>;
    },
  },
];

export function CharactersList({
  characters: initialCharacters,
}: {
  characters: CharacterRead[];
}) {
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
          columns={characterColumns}
          data={initialCharacters}
          header={({ table }) => {
            return (
              <div>
                <Input
                  placeholder="Filter by name..."
                  value={
                    (table.getColumn("name")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
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
