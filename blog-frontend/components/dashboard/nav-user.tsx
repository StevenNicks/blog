"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"

export function NavUser() {
  const { user, logout } = useAuth()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = React.useState(false)

  if (!user) return null

  // En el botón del sidebar, -mx-1 centra el avatar de 24px en el eje de los iconos de 16px; contraído el
  // botón mide 32px sin padding y ml-1 lo centra
  const identity = (avatarClassName?: string) => (
    <>
      <UserAvatar name={user.name} avatar={user.avatar} size="sm" className={avatarClassName} />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          <span className="capitalize">{user.role.name}</span> · {user.email}
        </span>
      </div>
    </>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {identity("-mx-1 group-data-[collapsible=icon]:ml-1")}
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">{identity()}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={loggingOut}
              onSelect={async (e) => {
                // Mantiene el menú abierto para mostrar el spinner mientras se cierra la sesión
                e.preventDefault()
                if (loggingOut) return
                setLoggingOut(true)
                try {
                  await logout()
                  router.push("/")
                } finally {
                  setLoggingOut(false)
                }
              }}
            >
              {loggingOut ? <Spinner data-icon="inline-start" /> : <LogOutIcon />}
              {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
