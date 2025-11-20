"use client"

import { usePathname } from "next/navigation"
import { BreadcrumbItem, Breadcrumbs } from "./breadcrumbs"

const PATH_TO_BREADCRUMB: Record<string, BreadcrumbItem> = {
    "/": { title: "/", url: "/" },
    "/profiles": { title: "Avatars", url: "/profiles" },
    "/profiles/proxy": { title: "Proxy", url: "/profiles/proxy" },
    // "/profiles/activation": {
    //     title: "Activation",
    //     url: "/profiles/activation",
    // },
    "/operator/scenarios": {
        title: "Scenarios",
        url: "/operator/scenarios",
    },
    "/operator/scenarios/[id]": {
        title: "Scenario",
        url: "/operator/scenarios/[id]",
    },
    "/orchestrator": {
        title: "Orchestrator",
        url: "/orchestrator",
    },
    "/orchestrator/chats": {
        title: "Chats",
        url: "/orchestrator/chats",
    },
    "/orchestrator/scenarios": {
        title: "Scenarios",
        url: "/orchestrator/scenarios",
    },
    "/orchestrator/missions": {
        title: "Missions",
        url: "/orchestrator/missions",
    },
    "/orchestrator/mission-builder": {
        title: "Mission Builder",
        url: "/orchestrator/mission-builder",
    },
}

export function AppBreadcrumbs({ pathname }: { pathname: string }) {
    const clientPathname = usePathname()
    const effectivePathname = clientPathname || pathname

    const breadcrumbItems: BreadcrumbItem[] = []
    if (effectivePathname) {
        const pathSegments = effectivePathname.split("/")
        let currentPath = ""
        for (const segment of pathSegments) {
            if (segment) {
                currentPath += `/${segment}`
                const breadcrumbItem = PATH_TO_BREADCRUMB[currentPath]
                if (breadcrumbItem) {
                    breadcrumbItems.push(breadcrumbItem)
                } else {
                    breadcrumbItems.push({ title: segment, url: currentPath })
                }
            }
        }
    }

    return <Breadcrumbs items={breadcrumbItems} className="ml-6" />
}
