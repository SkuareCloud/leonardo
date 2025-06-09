"use client";

import {
  ActivityIcon,
  Clapperboard,
  Crosshair,
  LucideIcon,
  MessageCircleMore,
  MessagesSquare,
  ScrollText,
  Users2Icon,
  VenetianMask,
  Waypoints,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { read_client_env } from "@lib/client-env";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  localOnly?: boolean;
  items?: NavItem[];
}

const data = {
  navMain: [
    {
      title: "Avatars",
      url: "#",
      isActive: true,
      items: [
        {
          title: "Avatars",
          url: "/avatars/avatars",
          icon: Users2Icon,
        },
        {
          title: "Proxies",
          url: "/avatars/proxies",
          icon: Waypoints,
        },
        {
          title: "Activation",
          url: "/profiles/activation",
          icon: ActivityIcon,
        },
      ],
    },
    {
      title: "WEB1",
      url: "#",
      isActive: true,
      localOnly: true,
      items: [
        {
          title: "WEB1 Accounts",
          url: "/profiles/web1",
          icon: Users2Icon,
        },
      ],
    },
    {
      title: "Operator",
      url: "#",
      isActive: true,
      items: [
        {
          title: "Scenarios",
          url: "/operator/scenarios",
          icon: ScrollText,
        },
        {
          title: "Status",
          url: "/operator/status",
          icon: MessageCircleMore,
        },
      ],
    },
    {
      title: "Orchestrator",
      url: "#",
      isActive: true,
      items: [
        {
          title: "Characters",
          url: "/orchestrator/characters",
          icon: VenetianMask,
        },
        {
          title: "Chats",
          url: "/orchestrator/chats",
          icon: MessagesSquare,
        },
        {
          title: "Missions",
          url: "/orchestrator/missions",
          icon: Crosshair,
        },
        {
          title: "Scenarios",
          url: "/orchestrator/scenarios",
          icon: Clapperboard,
        },
      ],
    },
  ],
} as {
  navMain: NavItem[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isLocal = read_client_env().isLocal;
  const navItems = data.navMain.filter((item) => !(isLocal && item.localOnly));
  for (const item of navItems) {
    if (item.items) {
      item.items = item.items.filter(
        (subItem) => !(isLocal && subItem.localOnly)
      );
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <Link href="/" className="cursor-pointer">
        <SidebarHeader>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"></div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Shepherd</span>
            </div>
          </SidebarMenuButton>
        </SidebarHeader>
      </Link>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
