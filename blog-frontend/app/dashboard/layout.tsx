import { RequireAuth } from "@/components/require-auth"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm font-medium text-muted-foreground">Panel de administración</span>
            </div>
            <ThemeToggle />
          </header>
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  )
}
