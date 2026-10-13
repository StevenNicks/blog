"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileTextIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Logo } from "@/components/logo"
import { NavMain, type NavMainItem } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface NavConfigItem {
  title: string
  url: string
  icon: LucideIcon
  permission?: string
  /** Solo marca activa la ruta exacta (no sus subrutas). */
  exact?: boolean
  items?: { title: string; url: string; permission?: string }[]
}

const content: NavConfigItem[] = [
  { title: "Resumen", url: "/dashboard", icon: LayoutDashboardIcon, exact: true },
  {
    title: "Posts",
    url: "/dashboard/posts",
    icon: FileTextIcon,
    permission: "posts:create",
    items: [
      { title: "Todos los posts", url: "/dashboard/posts" },
      { title: "Nuevo post", url: "/dashboard/posts/new" },
    ],
  },
  { title: "Comentarios", url: "/dashboard/comments", icon: MessageSquareIcon, permission: "comments:moderate" },
  { title: "Imágenes", url: "/dashboard/images", icon: ImageIcon, permission: "images:upload" },
]

const admin: NavConfigItem[] = [
  { title: "Usuarios", url: "/dashboard/users", icon: UsersIcon, permission: "users:manage" },
  { title: "Roles", url: "/dashboard/roles", icon: ShieldIcon, permission: "roles:manage" },
  // "settings:manage" no se asigna a ningún rol: solo lo ve el admin
  { title: "Ajustes", url: "/dashboard/settings", icon: SettingsIcon, permission: "settings:manage" },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { hasPermission } = useAuth()

  const toNavItems = React.useCallback(
    (config: NavConfigItem[]): NavMainItem[] =>
      config
        .filter((item) => !item.permission || hasPermission(item.permission))
        .map((item) => {
          const subItems = item.items
            ?.filter((sub) => !sub.permission || hasPermission(sub.permission))
            .map((sub) => ({ ...sub, isActive: pathname === sub.url }))
          return {
            title: item.title,
            url: item.url,
            icon: item.icon,
            isActive: item.exact ? pathname === item.url : pathname.startsWith(item.url),
            items: subItems,
          }
        }),
    [hasPermission, pathname]
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Blog">
              <Link href="/dashboard">
                {/* size-6! anula el [&_svg]:size-4 que el botón aplica a sus iconos; con la barra
                    contraída el botón mide 32px sin padding, ml-1 centra el logo de 24px */}
                <Logo className="size-6! group-data-[collapsible=icon]:ml-1" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading font-semibold">Blog</span>
                  <span className="truncate text-xs text-muted-foreground">Panel de administración</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Contenido" items={toNavItems(content)} />
        <NavMain label="Administración" items={toNavItems(admin)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
