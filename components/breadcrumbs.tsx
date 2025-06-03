"use client";

import { BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, Breadcrumb as ShadcnBreadcrumb } from "./ui/breadcrumb"

export interface BreadcrumbItem {
    title: string
    url: string
}

export function Breadcrumb({
    items = [],
    ...rest
}: React.ComponentProps<"div"> & {
    items: BreadcrumbItem[]
}) {
    return (
        <ShadcnBreadcrumb {...rest}>
            <BreadcrumbList>
                {items.map((item, index) => (
                    <div className="contents" key={index}>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={item.url} className={index === items.length - 1 ? "font-semibold" : ""}>
                                {item.title}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < items.length - 1 || index === items.length - 1 && (
                            <BreadcrumbSeparator className="hidden md:block" />
                        )}
                    </div>
                ))}
            </BreadcrumbList>
        </ShadcnBreadcrumb>
    )
}