"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AvatarModelWithProxy } from "@lib/api/avatars/types.gen";
import { ScenarioWithResult } from "@lib/api/operator";
import { cn } from "@lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface ScenarioDataRow {
  scenarioId: string;
  profileId: string;
  profileName: string;
  status: string;
  startTime: string;
  endTime: string | null;
  error: string | null;
}

const columns: ColumnDef<ScenarioDataRow>[] = [
  {
    accessorKey: "scenarioId",
    header: "Scenario ID",
    size: 150,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {row.original.scenarioId.split("-")[0]}...
                  </span>
                  <span className="text-gray-500">
                    {row.original.scenarioId.split("-")[1]}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <span>{row.original.scenarioId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(row.original.scenarioId);
                      toast.success("ID copied to clipboard");
                      const tooltip = e.currentTarget.closest('[role="tooltip"]');
                      if (tooltip) {
                        tooltip.remove();
                      }
                    }}
                  >
                    <CopyIcon className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "profileName",
    header: "Profile Name",
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 20,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs",
            status === "success" && "bg-green-100 text-green-800",
            status === "failed" && "bg-red-100 text-red-800",
            status === "pending" && "bg-yellow-100 text-yellow-800",
            status === "finished" && "bg-blue-100 text-blue-800"
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "error",
    header: "Error",
    size: 50,
    cell: ({ row }) => {
      return row.original.error || "-";
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    size: 150,
    cell: ({ row }) => {
      return row.original.startTime
        ? new Date(row.original.startTime).toLocaleString()
        : "Not started";
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    size: 150,
    cell: ({ row }) => {
      return row.original.endTime
        ? new Date(row.original.endTime).toLocaleString()
        : "Not finished";
    },
  },
];

const Scenarios = ({
  scenarios,
  avatarsData,
}: {
  scenarios: { [key: string]: ScenarioWithResult };
  avatarsData: AvatarModelWithProxy[];
}) => {
  const data: ScenarioDataRow[] = Object.entries(scenarios).flatMap(
    ([scenarioId, scenarioWithResult]) => {
      const profileName =
        avatarsData.find(
          (avatar) => avatar.id === scenarioWithResult.scenario.profile.id
        )?.data.eliza_character?.name || "Unknown Profile";

      return {
        scenarioId,
        profileId: scenarioWithResult.scenario.profile.id || scenarioId,
        profileName,
        status: scenarioWithResult.result?.status.status_code || "pending",
        startTime: scenarioWithResult.result?.scenario_info.start_time || "",
        endTime: scenarioWithResult.result?.scenario_info.end_time || null,
        error: scenarioWithResult.result?.status.error || null,
      };
    }
  );

  return (
    <DataTable
      columns={columns}
      initialSortingState={[{ id: "startTime", desc: true }]}
      data={data}
      onClickRow={(row) => {
        window.location.href = `/operator/scenarios/${row.scenarioId}`;
      }}
      header={({ table }) => {
        return (
          <div>
            <Input
              placeholder="Filter by profile name..."
              value={
                (table.getColumn("profileName")?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn("profileName")
                  ?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        );
      }}
    />
  );
};

export default Scenarios;
