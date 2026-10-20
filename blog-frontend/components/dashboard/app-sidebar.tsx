"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { NavMain, type NavMainItem } from "@/components/dashboard/nav-main"
import { COMMENTS_CHANGED_EVENT, listAllComments } from "@/lib/api/comments"
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
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface NavConfigItem {
  title: string
  url: string
  icon: LucideIcon
  permission?: string
  /** Solo marca activa la ruta exacta (no sus subrutas). */
  exact?: boolean
  /** El grupo de sub-ítems se muestra siempre desplegado (sin opción de colapsarlo). */
  alwaysOpen?: boolean
  items?: { title: string; url: string; permission?: string }[]
}

const content: NavConfigItem[] = [
  { title: "Resumen", url: "/dashboard", icon: LayoutDashboardIcon, exact: true },
  {
    title: "Posts",
    url: "/dashboard/posts",
    icon: FileTextIcon,
    permission: "posts:create",
    alwaysOpen: true,
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
  const { hasPermission, fetcherPaged } = useAuth()
  const { state: sidebarState, isMobile, setOpenMobile } = useSidebar()

  // En móvil el sidebar es un panel superpuesto: se cierra al elegir un destino, incluso si ya se está en él
  // (con un efecto sobre la ruta no se cerraría). Los clics del menú del usuario también burbujean hasta aquí.
  function closeOnLinkClick(event: React.MouseEvent) {
    if (isMobile && (event.target as HTMLElement).closest("a[href]")) setOpenMobile(false)
  }
  const canModerate = hasPermission("comments:moderate")
  const [pendingComments, setPendingComments] = React.useState(0)

  // Comentarios pendientes de moderar: se refresca al navegar y cada vez que se modera o elimina uno
  React.useEffect(() => {
    if (!canModerate) return
    let cancelled = false
    const refresh = () => {
      listAllComments(fetcherPaged, { status: "pending", limit: 1 })
        .then((res) => {
          if (!cancelled) setPendingComments(res.meta?.total ?? 0)
        })
        .catch(() => {})
    }
    refresh()
    window.addEventListener(COMMENTS_CHANGED_EVENT, refresh)
    return () => {
      cancelled = true
      window.removeEventListener(COMMENTS_CHANGED_EVENT, refresh)
    }
  }, [canModerate, fetcherPaged, pathname])

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
            alwaysOpen: item.alwaysOpen,
            badge: item.url === "/dashboard/comments" ? pendingComments : undefined,
          }
        }),
    [hasPermission, pathname, pendingComments]
  )

  const contentItems = toNavItems(content)
  const adminItems = toNavItems(admin)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader onClick={closeOnLinkClick}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Blog" className="group-data-[collapsible=icon]:bg-sidebar-accent">
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
        {/* El tooltip solo se muestra con la barra contraída (misma lógica que SidebarMenuButton) */}
        {hasPermission("posts:create") && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                className="w-full gap-2 overflow-hidden px-2 transition-[width,height] duration-200 ease-linear group-data-[collapsible=icon]:size-8 motion-reduce:transition-none"
              >
                <Link href="/dashboard/posts/new">
                  <PlusIcon />
                  <span className="max-w-20 whitespace-nowrap transition-[max-width,margin,opacity] [transition-duration:200ms,200ms,100ms] [transition-delay:0ms,0ms,100ms] ease-linear group-data-[collapsible=icon]:-ml-2 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:[transition-delay:0ms] motion-reduce:transition-none">
                    Nuevo post
                  </span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" hidden={sidebarState !== "collapsed" || isMobile}>
              Nuevo post
            </TooltipContent>
          </Tooltip>
        )}
      </SidebarHeader>
      <SidebarContent onClick={closeOnLinkClick}>
        <NavMain label="Contenido" items={contentItems} />
        {contentItems.length > 0 && adminItems.length > 0 && <SidebarSeparator className="mx-0" />}
        <NavMain label="Administración" items={adminItems} />
      </SidebarContent>
      <SidebarFooter onClick={closeOnLinkClick}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ver blog">
              <Link href="/">
                <GlobeIcon />
                <span>Ver blog</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0" />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
