"use client";

import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CombinedAvatar } from "@lib/api/models";
import { ColumnDef } from "@tanstack/react-table";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { MarsIcon, RefreshCcwIcon, VenusIcon } from "lucide-react";
import { useState } from "react";
import { ActiveIndicator } from "./active-indicator";
import { Badge } from "@/components/ui/badge";
import { isProfileActive, getSocialNetworkStatus } from "@lib/profile-utils";
import Image from "next/image";
import TelegramIcon from "@/assets/telegram.svg";
import { AvatarModelWithProxy } from "@lib/api/avatars";
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
  name: string;
  city: string | undefined;
  geocode: string | undefined;
  gender: string;
  age: string | undefined;
  telegram: number | undefined;
  profileId: string;
  proxy: {
    ip_address?: string | null;
    fqdn?: string | null;
    status?: string;
  } | null;
  phone: string | undefined;
  socialNetworks: { [network: string]: boolean };
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
    accessorKey: "socialNetworks",
    header: "Social Networks",
    size: 200,
    sortingFn: (rowA, rowB) => {
      const statusA = getSocialNetworkStatus(rowA.original.original);
      const statusB = getSocialNetworkStatus(rowB.original.original);

      // Count active accounts
      const activeA = Object.values(statusA).filter(Boolean).length;
      const activeB = Object.values(statusB).filter(Boolean).length;

      // If both have active accounts, compare by count
      if (activeA > 0 && activeB > 0) {
        return activeB - activeA;
      }

      // If only one has active accounts, it comes first
      if (activeA > 0) return -1;
      if (activeB > 0) return 1;

      // If neither has active accounts, compare by total accounts
      const totalA = Object.keys(statusA).length;
      const totalB = Object.keys(statusB).length;

      return totalB - totalA;
    },
    cell: ({ row }) => {
      const profile = row.original;
      const socialStatus = getSocialNetworkStatus(profile.original);

      return (
        <div className="flex flex-row gap-2">
          {Object.entries(socialStatus).map(([network, isActive]) => (
            <div key={network} className="flex items-center gap-1">
              {network === "telegram" && (
                <div
                  className={cn("size-5", !isActive && "opacity-50 grayscale")}
                >
                  <Image
                    src={TelegramIcon}
                    alt="Telegram"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
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
          <Gender gender={profile.gender} />
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
          {`${profile.proxy?.ip_address || profile.proxy?.fqdn || ""}`}
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
      return <span>{profile.phone || ""}</span>;
    },
  },
];

export function AvatarsList({
  avatars: initialAvatars,
}: {
  avatars: AvatarModelWithProxy[];
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
          columns={profileColumns}
          data={initialAvatars.map((avatar) => ({
            original: avatar,
            name: avatar?.data.eliza_character?.name || "Unknown",
            city: avatar?.data.addresses?.home?.city,
            geocode:
              avatar?.data.addresses?.home?.iso_3166_1_alpha_2_code,
            gender: avatar?.data.gender || "Female",
            age: avatar?.data.date_of_birth,
            telegram: avatar?.data.social_network_accounts?.telegram
              ?.active
              ? avatar?.data.social_network_accounts?.telegram.api
                  ?.api_id
              : undefined,
            profileId: avatar?.id || "",
            proxy: avatar?.proxy || null,
            phone: avatar?.data.phone_number,
            isActive: isProfileActive(avatar) || false,
            socialNetworks: getSocialNetworkStatus(avatar),
          }))}
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
