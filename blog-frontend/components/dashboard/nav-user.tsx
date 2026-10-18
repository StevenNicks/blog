"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ChevronsUpDownIcon, CircleHelpIcon, LogOutIcon, MoonIcon, UserIcon } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"

export function NavUser() {
  const { user, logout } = useAuth()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  // resolvedTheme no existe en el servidor: hasta montar, el switch se muestra apagado para no desajustar la hidratación
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"
  const [loggingOut, setLoggingOut] = React.useState(false)

  if (!user) return null

  // Contraído, el avatar de 32px llena el botón y queda centrado sin ajustes
  const identity = (
    <>
      <UserAvatar name={user.name} avatar={user.avatar} size="default" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
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
              {identity}
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
              <div className="flex items-center gap-2 px-1 py-1.5">{identity}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              // El menú se mantiene abierto para ver el cambio; el switch es solo indicador, la fila entera alterna
              onSelect={(e) => {
                e.preventDefault()
                setTheme(isDark ? "light" : "dark")
              }}
            >
              <MoonIcon />
              Modo oscuro
              <Switch
                size="sm"
                checked={isDark}
                tabIndex={-1}
                aria-label="Modo oscuro"
                className="pointer-events-none ml-auto"
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon />
                  Mi perfil
                </Link>
              </DropdownMenuItem>
              {/* Pendiente: todavía no tiene destino ni acción */}
              <DropdownMenuItem>
                <CircleHelpIcon />
                Necesitas ayuda?
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
