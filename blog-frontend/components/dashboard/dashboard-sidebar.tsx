"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MessageSquareIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { Logo } from "@/components/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

const navItems: NavItem[] = [
  { title: "Panel", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Posts", href: "/dashboard/posts", icon: FileTextIcon, permission: "posts:create" },
  { title: "Comentarios", href: "/dashboard/comments", icon: MessageSquareIcon, permission: "comments:moderate" },
  { title: "Imágenes", href: "/dashboard/images", icon: ImageIcon, permission: "images:upload" },
  { title: "Usuarios", href: "/dashboard/users", icon: UsersIcon, permission: "users:manage" },
  { title: "Roles", href: "/dashboard/roles", icon: ShieldIcon, permission: "roles:manage" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, hasPermission, logout } = useAuth()
  const router = useRouter()

  const visibleItems = navItems.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 font-heading text-base font-semibold">
          <Logo size={28} className="shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Blog Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ver blog">
              <Link href="/">
                <GlobeIcon />
                <span>Ver blog</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user?.name}>
                  <UserAvatar name={user?.name ?? ""} avatar={user?.avatar} size="sm" />
                  <div className="flex min-w-0 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.role.name}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  <UserIcon data-icon="inline-start" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={async () => {
                    await logout()
                    router.push("/")
                  }}
                >
                  <LogOutIcon data-icon="inline-start" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
