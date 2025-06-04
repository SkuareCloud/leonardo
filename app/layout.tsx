import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem } from "@/components/breadcrumbs";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Shepherd",
};

const PATH_TO_BREADCRUMB: Record<string, BreadcrumbItem> = {
  "/": { title: "/", url: "/" },
  "/profiles": { title: "Profiles", url: "/profiles" },
  "/profiles/activation": {
    title: "Activation",
    url: "/profiles/activation",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("X-Pathname");
  console.log("Pathname:", pathname);
  const breadcrumbItems: BreadcrumbItem[] = [];
  if (pathname) {
    const pathSegments = pathname.split("/");
    let currentPath = "";
    for (const segment of pathSegments) {
      if (segment) {
        currentPath += `/${segment}`;
        const breadcrumbItem = PATH_TO_BREADCRUMB[currentPath];
        if (breadcrumbItem) {
          breadcrumbItems.push(breadcrumbItem);
        }
      }
    }
  }
  console.log("Breadcrumb items:", breadcrumbItems);

  return (
    <html lang="en">
      <body className="antialiased">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb items={breadcrumbItems} className="ml-6" />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-14 pt-4">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
