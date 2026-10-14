import { cookies } from "next/headers"

import { RequireAuth } from "@/components/require-auth"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // SidebarProvider guarda el estado en la cookie "sidebar_state"; se lee aquí para que el
  // servidor renderice el sidebar abierto o cerrado según la última elección (sin parpadeo)
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <RequireAuth>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5 data-vertical:self-center" />
              <DashboardBreadcrumb />
            </div>
            <ThemeToggle />
          </header>
          <div className="relative flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  )
}
