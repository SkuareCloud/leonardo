"use client"

import { ChevronRight } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@lib/utils"
import { NavItem } from "./app-sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function NavMain({ items, pathname, open }: { items: NavItem[]; pathname: string; open?: boolean }) {
  console.log({ pathname })
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => {
          const isActive = pathname && pathname.startsWith(item.url)
          return (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn("text-blue-600 flex flex-row", isActive && "text-blue-600 font-bold")}
                  >
                    {item.icon && <item.icon className="size-6" />}
                    {open && <span className="font-bold">{item.title}</span>}
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="flex flex-col gap-1.5 pt-2">
                    {item.items?.map(subItem => {
                      const isActive = pathname && pathname.startsWith(subItem.url)
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Tooltip>
                              <TooltipTrigger>
                                <a
                                  href={subItem.url}
                                  className={cn(
                                    "flex flex-row items-center gap-2 text-sm",
                                    isActive && "text-blue-600 font-bold",
                                  )}
                                >
                                  {subItem.icon && <subItem.icon className="size-5" />}
                                  {open && <span>{subItem.title}</span>}
                                </a>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">{subItem.title}</TooltipContent>
                            </Tooltip>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
