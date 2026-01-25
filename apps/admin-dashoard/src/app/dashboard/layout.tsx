"use client";

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="p-2 border-b flex items-center gap-2">
                    <SidebarTrigger />
                    <span className="font-semibold text-sm">Dashboard</span>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
