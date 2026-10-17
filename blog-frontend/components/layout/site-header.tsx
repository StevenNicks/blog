"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboardIcon, LogOutIcon, PenLineIcon, UserIcon, UserRoundIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function SiteHeader() {
  const { user, status, logout, hasAnyPermission } = useAuth()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = React.useState(false)

  const canWrite = hasAnyPermission(["posts:create"])

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <Logo />
          Blog
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          {status === "authenticated" ? (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Panel
            </Link>
          ) : null}
        </nav>

        {/* Todos los controles miden 24px (1.5rem) de alto y son redondos.
            Los tooltips solo se muestran en escritorio (max-sm:hidden): en móvil no hay hover */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            // Reserva el espacio de los controles de sesión para evitar saltos de layout
            <Skeleton aria-hidden className="h-6 w-6 rounded-full sm:w-28" />
          ) : status === "unauthenticated" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="xs" className="rounded-full max-sm:size-6 max-sm:p-0!" asChild>
                  <Link href="/login">
                    <UserRoundIcon data-icon="inline-start" />
                    <span className="max-sm:sr-only">Iniciar sesión</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-sm:hidden">Inicia sesión para comentar y escribir</TooltipContent>
            </Tooltip>
          ) : (
            <>
              {canWrite ? (
                // Acción principal: el único botón relleno. En móvil queda solo el icono
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="xs" className="rounded-full max-sm:size-6 max-sm:p-0!" asChild>
                      <Link href="/dashboard/posts/new">
                        <PenLineIcon data-icon="inline-start" />
                        <span className="max-sm:sr-only">Nuevo post</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-sm:hidden">Escribir un nuevo post</TooltipContent>
                </Tooltip>
              ) : null}

              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="Menú de usuario"
                        className="rounded-full outline-none transition-shadow hover:ring-2 hover:ring-border focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:ring-2 aria-expanded:ring-border"
                      >
                        <UserAvatar name={user?.name ?? ""} avatar={user?.avatar} size="sm" />
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="max-sm:hidden">Tu cuenta</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboardIcon data-icon="inline-start" />
                    Panel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <UserIcon data-icon="inline-start" />
                    Mi perfil
                  </DropdownMenuItem>
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
                    {loggingOut ? <Spinner data-icon="inline-start" /> : <LogOutIcon data-icon="inline-start" />}
                    {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          <ThemeToggle size="icon-xs" />
        </div>
      </div>
    </header>
  )
}
