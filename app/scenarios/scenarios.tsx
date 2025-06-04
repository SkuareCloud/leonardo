"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScenarioWithResult } from "@lib/api/operator";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CombinedAvatar } from "@lib/api/models";
import { cn } from "@lib/utils";

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
  },
  {
    accessorKey: "profileName",
    header: "Profile Name",
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 50,
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
    size: 200,
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

  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => {
      return (
        <Link href={`/scenarios/${row.original.scenarioId}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      );
    },
  },
];

const Scenarios = ({
  scenarios,
  avatarsData,
}: {
  scenarios: { [key: string]: ScenarioWithResult };
  avatarsData: CombinedAvatar[];
}) => {
  const data: ScenarioDataRow[] = Object.entries(scenarios).flatMap(
    ([scenarioId, scenarioWithResult]) => {
      const profileName =
        avatarsData.find(
          (avatar) =>
            avatar.avatar?.id === scenarioWithResult.scenario.profile.id
        )?.avatar?.data.eliza_character?.name || "Unknown Profile";

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
        window.location.href = `/scenarios/${row.scenarioId}`;
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
