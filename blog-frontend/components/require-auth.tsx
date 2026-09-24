"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ShieldAlertIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

interface RequireAuthProps {
  children: React.ReactNode
  /** Si se indica, el usuario necesita al menos uno de estos permisos (o ser admin). */
  anyPermission?: string[]
}

export function RequireAuth({ children, anyPermission }: RequireAuthProps) {
  const { status, hasAnyPermission } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [status, router, pathname])

  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  if (anyPermission && !hasAnyPermission(anyPermission)) {
    return (
      <Empty className="min-h-[50vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlertIcon />
          </EmptyMedia>
          <EmptyTitle>No tienes acceso a esta sección</EmptyTitle>
          <EmptyDescription>
            Tu rol actual no cuenta con los permisos necesarios. Contacta a un administrador si crees que
            esto es un error.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Volver al panel
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <>{children}</>
}
