"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ServiceClient } from "@lib/service-client";
import { cn } from "@/lib/utils";
import { CombinedAvatar } from "@lib/api/models";
import { AsyncWorkerState } from "@lib/api/operator";
import { ColumnDef } from "@tanstack/react-table";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import {
  MarsIcon,
  RefreshCcwIcon,
  VenusIcon,
  CircleStop,
  CirclePlay,
} from "lucide-react";
import { useState } from "react";
import { ActiveIndicator } from "./active-indicator";
import { Badge } from "@/components/ui/badge";
import { isProfileActive } from "@lib/profile-utils";
import { ActivateButton } from "@/components/activate-button";

export type ViewMode = "Grid" | "Table";

function Gender({ gender }: { gender: string }) {
  return (
    <span className="text-sm inline-flex flex-row items-center gap-2">
      {gender === "Female" ? (
        <VenusIcon className="size-3 ml-auto" />
      ) : (
        <MarsIcon className="size-3 ml-auto" />
      )}
      {gender}
    </span>
  );
}

export interface ProfileDataRow {
  original: CombinedAvatar;
  name?: string;
  city?: string;
  geocode?: string;
  gender?: string;
  age?: string;
  telegram?: number;
  status?: boolean;
  state?: AsyncWorkerState;
  profileId?: string;
  proxy?: object;
  phone?: string;
  isActive?: boolean;
}

export function Actions({ profile }: { profile: ProfileDataRow }) {
  const handleStopProfile = async () => {
    if (profile.profileId) {
      await fetch(`/api/operator/stop?profileId=${profile.profileId}`, {
        method: "POST",
      });
    }
  };

  const handleStartProfile = async () => {
    if (profile.profileId) {
      await fetch(`/api/operator/start?profileId=${profile.profileId}`, {
        method: "POST",
      });
    }
  };

  let startStopButton = null;
  if (profile.isActive) {
    startStopButton = profile.state ? (
      <Button
        className="cursor-pointer hover:bg-amber-200 uppercase"
        variant="destructive"
        size="xs"
        onClick={handleStopProfile}
      >
        <CircleStop />
        Stop
      </Button>
    ) : (
      <Button
        className="cursor-pointer hover:bg-green-50"
        variant="outline"
        size="xs"
        onClick={handleStartProfile}
      >
        <CirclePlay />
        Start
      </Button>
    );
  }

  let activateButton = null;
  if (!profile.isActive) {
    activateButton = <ActivateButton profile={profile.original} />;
  }

  return (
    <div className="flex flex-row space-x-3">
      {startStopButton}
      {activateButton}
    </div>
  );
}

const profileColumns: ColumnDef<ProfileDataRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "name",
    header: "Name",
    size: 150,
    cell: ({ row }) => {
      const profile = row.original;
      return <span>{profile.name}</span>;
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    size: 10,
    cell: ({ row }) => {
      const profile = row.original;
      return <Actions profile={profile} />;
    },
  },
  {
    accessorKey: "status",
    header: "Activation State",
    size: 100,
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <span>
          {
            <Badge
              className={cn(
                !profile.isActive && "bg-red-50 text-red-800",
                profile.isActive && "bg-green-100 text-green-800"
              )}
            >
              <div className="inline-flex flex-row items-center uppercase text-xs">
                <ActiveIndicator active={profile.isActive} />
                {profile.isActive ? "Active" : "Inactive"}
              </div>
            </Badge>
          }
        </span>
      );
    },
  },
  {
    accessorKey: "state",
    header: "State",
    size: 5,
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <span>
          {
            <Badge
              className={cn(
                !profile.state && "bg-gray-200 text-gray-700",
                profile.state === "idle" && "bg-amber-600",
                profile.state === "working" && "bg-green-100 text-green-800"
              )}
            >
              <div className="inline-flex flex-row items-center uppercase text-xs">
                {profile.state && (
                  <ActiveIndicator active={profile.state === "working"} />
                )}
                {profile.state || "inactive"}
              </div>
            </Badge>
          }
        </span>
      );
    },
  },
  {
    accessorFn: (row) => row.geocode + "," + row.city,
    header: "Location",
    cell: ({ row }) => {
      const profile = row.original;
      const geoCode = profile.geocode;
      const flag = geoCode && getUnicodeFlagIcon(geoCode);
      return (
        <span>
          {flag && <span className="size-2 mr-2">{flag}</span>}
          {profile.geocode}, {profile.city}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <span>
          <Gender gender={profile.gender || "Female"} />
        </span>
      );
    },
  },
  {
    accessorKey: "profileId",
    header: "Profile ID",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original;
      return <span className="w-[50ch]">{profile.profileId}</span>;
    },
  },
  {
    accessorKey: "proxy",
    header: "Proxy",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <span>
          {`${profile.proxy?.ip_address || profile.proxy?.fqdn}`}
          {profile.proxy?.status === "success" ? (
            <Label className="text-xs text-green-500">Active</Label>
          ) : (
            <Label className="text-xs text-red-500">Inactive</Label>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 60,
    cell: ({ row }) => {
      const profile = row.original;
      return <span>{`${profile.phone}`}</span>;
    },
  },
];

export function ProfilesList({
  profiles: initialProfiles,
  running: initialRunning = false,
  hideFilters = false,
  hideViewSelector = false,
}: {
  profiles: CombinedAvatar[];
  running: boolean;
  hideFilters?: boolean;
  hideViewSelector?: boolean;
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [running, setRunning] = useState(initialRunning);
  const [viewMode, setViewMode] = useState<ViewMode>("Table");
  const [activeProfile, setActiveProfile] = useState<CombinedAvatar | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const filteredProfiles = profiles
    .filter(
      (profile) =>
        !running ||
        (running && profile.profile_worker_view?.state === "working")
    )
    .sort((a, b) => {
      return a.profile_worker_view?.state === b.profile_worker_view?.state
        ? 0
        : a.profile_worker_view?.state
        ? -1
        : 1;
    });
  return (
    <div className="flex flex-row w-full">
      <div className="flex flex-col flex-1 w-full">
        <div className="flex flex-row w-full pr-16">
          {!hideFilters && (
            <div className="mb-12 flex flex-row items-center gap-6 h-4 w-full">
              <Button
                variant="link"
                className="bg-gray-100 p-1 rounded-full hover:bg-gray-200"
                onClick={async () => {
                  setIsRefreshing(!isRefreshing);
                  const profiles = await new ServiceClient().listAvatars({
                    running,
                  });
                  setProfiles(profiles);
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
              <Separator orientation="vertical" className="w-1" />
              <div className="flex items-center space-x-2">
                <Switch
                  id="running"
                  checked={running}
                  onCheckedChange={(checked) => setRunning(checked)}
                />
                <Label htmlFor="running">Running</Label>
              </div>
            </div>
          )}
          {!hideViewSelector && (
            <div className="flex-1 text-sm">
              <Select
                defaultValue={"Table" satisfies ViewMode}
                onValueChange={(value) => setViewMode(value as ViewMode)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"Table" satisfies ViewMode}>
                    Table
                  </SelectItem>
                  <SelectItem value={"Grid" satisfies ViewMode}>
                    Grid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {viewMode === "Grid" && (
          <div className="flex flex-col gap-4">
            {filteredProfiles.map((profile: CombinedAvatar) => {
              const profileName =
                profile.avatar?.data.eliza_character?.name || "Unknown";
              const geoCode =
                profile.avatar?.data.addresses?.home?.iso_3166_1_alpha_2_code;
              const flag = geoCode && getUnicodeFlagIcon(geoCode);
              const dateOfBirth = profile.avatar?.data.date_of_birth as string;
              const date = new Date(dateOfBirth);
              const today = new Date();
              const age = today.getFullYear() - date.getFullYear();
              const monthDiff = today.getMonth() - date.getMonth();
              const dayDiff = today.getDate() - date.getDate();
              const ageString =
                monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
                  ? `${age - 1} years old`
                  : `${age} years old`;

              return (
                <Card
                  key={profile.avatar?.id}
                  className="w-96 cursor-pointer hover:bg-gray-50 hover:scale-[102%] transition-all"
                  onClick={() => setActiveProfile(profile)}
                >
                  <CardHeader className="font-semibold">
                    <div className="flex items-center">
                      <ActiveIndicator
                        active={
                          profile.profile_worker_view?.state === "working"
                        }
                      />
                      {profileName}
                    </div>
                    <div className="flex flex-row text-sm h-3 items-center">
                      <Gender gender={profile.avatar.data.gender!} />
                      <Separator orientation="vertical" className="mx-2" />
                      <span className="">
                        {flag && <span className="size-2 mr-2">{flag}</span>}
                        {profile.avatar.data.addresses?.home?.city},{" "}
                        {profile.avatar.data.addresses?.home?.continent_code}
                      </span>
                      <Separator orientation="vertical" className="mx-2" />
                      <span className="">
                        {profile.avatar.data.date_of_birth && (
                          <span>{ageString}</span>
                        )}
                      </span>
                    </div>
                    <p className="font-normal text-sm text-muted-foreground">
                      {profile.avatar.id}
                    </p>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {viewMode === "Table" && (
          <div className="flex flex-col gap-4 max-w-[1280px]">
            <DataTable
              columns={profileColumns}
              initialSortingState={[{ id: "state", desc: false }]}
              onClickRow={(row) => {
                console.log(row);
              }}
              data={profiles.map((profile) => {
                return {
                  original: profile,
                  name: profile.avatar?.data.eliza_character?.name || "Unknown",
                  city: profile.avatar?.data.addresses?.home?.city,
                  geocode:
                    profile.avatar.data.addresses?.home
                      ?.iso_3166_1_alpha_2_code,
                  gender: profile.avatar.data.gender,
                  age: profile.avatar.data.date_of_birth,
                  telegram: profile.avatar.data.social_network_accounts
                    ?.telegram?.active
                    ? profile.avatar.data.social_network_accounts?.telegram.api
                        ?.api_id
                    : undefined,
                  profileId: profile.avatar.id,
                  proxy: profile.avatar.proxy,
                  phone: profile.avatar.data.phone_number,
                  isActive: isProfileActive(profile),
                  state: profile.profile_worker_view?.state,
                };
              })}
              header={({ table }) => {
                return (
                  <div>
                    <Input
                      placeholder="Filter by name..."
                      value={
                        (table.getColumn("name")?.getFilterValue() as string) ??
                        ""
                      }
                      onChange={(event) =>
                        table
                          .getColumn("name")
                          ?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
      {activeProfile && (
        <div className="h-full max-w-[360px] w-96 mt-16 border-l-1 p-12 border-gray-100">
          {JSON.stringify(activeProfile, null, 2)}
        </div>
      )}
    </div>
  );
}
