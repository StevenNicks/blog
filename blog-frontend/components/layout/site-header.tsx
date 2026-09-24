"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboardIcon, LogOutIcon, PenLineIcon, UserIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
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

  const canWrite = hasAnyPermission(["posts:create"])

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <Logo size={32} />
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

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {status === "loading" ? null : status === "unauthenticated" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/login" aria-label="Iniciar sesión">
                    <UserIcon />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Iniciar sesión</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2">
              {canWrite ? (
                <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/dashboard/posts/new">
                    <PenLineIcon data-icon="inline-start" />
                    Nuevo post
                  </Link>
                </Button>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <UserAvatar name={user?.name ?? ""} avatar={user?.avatar} />
                  </button>
                </DropdownMenuTrigger>
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
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
