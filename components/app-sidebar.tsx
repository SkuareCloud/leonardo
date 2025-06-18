"use client"

import {
  ActivityIcon,
  BrickWallIcon,
  Crosshair,
  HardHat,
  ImageIcon,
  LucideIcon,
  MessageCircleMore,
  MessagesSquare,
  PackageIcon,
  ScrollText,
  SpeechIcon,
  Users2Icon,
  VenetianMask,
  Waypoints
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { read_client_env } from "@lib/client-env"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Separator } from "./ui/separator"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  localOnly?: boolean
  items?: NavItem[]
}

const data = {
  navMain: [
    {
      title: "Avatars",
      url: "#",
      icon: Users2Icon,
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
      icon: HardHat,
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
      icon: SpeechIcon,
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
          title: "Mission Builder",
          url: "/orchestrator/mission-builder",
          icon: BrickWallIcon,
        },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: PackageIcon,
      items: [
        {
          title: "Media",
          url: "/inventory/media",
          icon: ImageIcon,
        },
      ],
    },
  ],
} as {
  navMain: NavItem[]
}

export function AppSidebar({ pathname, ...props }: React.ComponentProps<typeof Sidebar> & { pathname: string }) {
  const { open } = useSidebar()
  const clientPathname = usePathname()
  const effectivePathname = clientPathname || pathname

  const isLocal = read_client_env().isLocal
  const navItems = data.navMain.filter(item => !(!isLocal && item.localOnly))
  for (const item of navItems) {
    if (item.items) {
      item.items = item.items.filter(subItem => !(!isLocal && subItem.localOnly))
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
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/logo.png"
                width={32}
                height={32}
                className="relative bottom-0.5 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
                alt="Shepherd Logo"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-extrabold uppercase">Shepherd</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarHeader>
      </Link>
      <Separator className="mt-4 mb-5" />
      <SidebarContent>
        <NavMain items={navItems} pathname={effectivePathname} open={open} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
