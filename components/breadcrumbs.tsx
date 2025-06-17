"use client"

import {
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    Breadcrumb as ShadcnBreadcrumb,
} from "./ui/breadcrumb"

export interface BreadcrumbItem {
  title: string
  url: string
}

export function Breadcrumbs({
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
            {index < items.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
          </div>
        ))}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  )
}
