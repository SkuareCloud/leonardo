import { AppBreadcrumbs } from "@/components/app-breadcrumbs"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { OperatorStoreProvider } from "@lib/store-provider"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
    title: "Shepherd",
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const requestHeaders = await headers()
    const pathname = requestHeaders.get("X-Pathname")

    return (
        <html lang="en">
            <body className="antialiased">
                <OperatorStoreProvider>
                    <SidebarProvider>
                        <AppSidebar pathname={pathname ?? ""} />
                        <SidebarInset>
                            <div className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                                <div className="flex items-center gap-2 px-4">
                                    <SidebarTrigger className="-ml-1" />
                                    <div className="ml-6">
                                        <AppBreadcrumbs pathname={pathname ?? ""} />
                                    </div>
                                </div>
                            </div>
                            <main className="bg-background flex flex-1 flex-col gap-4 p-8 pt-4">
                                {children}
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                    <Toaster position="top-right" />
                </OperatorStoreProvider>
            </body>
        </html>
    )
}
