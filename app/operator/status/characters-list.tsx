"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCcwIcon, CircleStop } from "lucide-react";
import { useState } from "react";
import { ActiveIndicator } from "@/app/avatars/avatars/active-indicator";
import { ProfileWorkerView } from "@lib/api/operator/types.gen";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const characterColumns: ColumnDef<ProfileWorkerView>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 200,
    cell: ({ row }) => {
      const character = row.original;
      return <span className="font-mono text-sm">{character.id}</span>;
    },
  },
  {
    accessorKey: "state",
    header: "Status",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      const isActive = character.state === "working" || character.state === "idle";
      return (
        <span>
          <Badge
            className={cn(
              character.state === "stopped" && "bg-gray-100 text-gray-800",
              character.state === "working" && "bg-green-100 text-green-800",
              character.state === "idle" && "bg-yellow-100 text-yellow-800"
            )}
          >
            <div className="inline-flex flex-row items-center uppercase text-xs">
              <ActiveIndicator active={character.state === "working"} />
              {character.state}
            </div>
          </Badge>
        </span>
      );
    },
  },
  {
    accessorKey: "pending_actions",
    header: "Pending Actions",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      return (
        <span>
          <Badge
            className={cn(
              character.pending_actions === 0 && "bg-gray-100 text-gray-800",
              character.pending_actions > 0 && "bg-blue-100 text-blue-800"
            )}
          >
            {character.pending_actions}
          </Badge>
        </span>
      );
    },
  },
  {
    accessorKey: "current_scenario",
    header: "Current Scenario",
    size: 200,
    cell: ({ row }) => {
      const character = row.original;
      return <span>{character.current_scenario?.id || "None"}</span>;
    },
  },
  {
    accessorKey: "current_scenario_result",
    header: "Scenario Status",
    size: 150,
    cell: ({ row }) => {
      const character = row.original;
      const status = character.current_scenario_result?.status.status_code;
      if (!status) return <span>No result</span>;
      
      return (
        <span>
          <Badge
            className={cn(
              status === "failed" && "bg-red-50 text-red-800",
              status === "success" && "bg-green-100 text-green-800",
              status === "pending" && "bg-yellow-100 text-yellow-800",
              status === "finished" && "bg-blue-100 text-blue-800"
            )}
          >
            {status}
          </Badge>
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => {
      const character = row.original;
      const handleStop = async () => {
        try {
          const response = await fetch(`/api/operator/stop?profileId=${character.id}`, {
            method: "POST",
          });
          
          if (response.ok) {
            toast.success("Character stopped", {
              description: "The character has been successfully stopped.",
            });
          } else {
            const data = await response.json();
            throw new Error(data.error || "Failed to stop character");
          }
        } catch (error) {
          toast.error("Failed to stop character", {
            description: error instanceof Error ? error.message : "An unexpected error occurred",
          });
        }
      };

      if (character.state === "working" || character.state === "idle") {
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="cursor-pointer hover:bg-amber-200 uppercase"
                variant="destructive"
                size="xs"
              >
                <CircleStop className="mr-1 h-3 w-3" />
                Stop
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Stop Character</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to stop this character? This will stop all current actions and close all resources.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStop}>Stop Character</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      }
      return null;
    },
  },
];

export function CharactersList({
  characters: initialCharacters,
}: {
  characters: ProfileWorkerView[];
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
                  placeholder="Filter by ID..."
                  value={
                    (table.getColumn("id")?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table.getColumn("id")?.setFilterValue(event.target.value)
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