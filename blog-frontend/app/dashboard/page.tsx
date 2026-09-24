"use client"

import * as React from "react"
import Link from "next/link"
import { FileTextIcon, ImageIcon, PenLineIcon, UsersIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import * as postsApi from "@/lib/api/posts"
import * as usersApi from "@/lib/api/users"
import * as imagesApi from "@/lib/api/images"

interface StatDef {
  key: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  permission?: string
  load: () => Promise<number>
}

export default function DashboardHomePage() {
  const { user, hasPermission, fetcherPaged, fetcher } = useAuth()
  const [counts, setCounts] = React.useState<Record<string, number | null>>({})

  const stats: StatDef[] = React.useMemo(
    () => [
      {
        key: "posts",
        title: hasPermission("posts:edit:any") ? "Posts totales" : "Mis posts",
        icon: FileTextIcon,
        href: "/dashboard/posts",
        permission: "posts:create",
        load: async () => {
          const { meta } = await postsApi.listPosts(fetcherPaged, {
            limit: 1,
            author: hasPermission("posts:edit:any") ? undefined : user?._id,
          })
          return meta?.total ?? 0
        },
      },
      {
        key: "images",
        title: "Imágenes",
        icon: ImageIcon,
        href: "/dashboard/images",
        permission: "images:upload",
        load: async () => {
          const { meta } = await imagesApi.listImages(fetcherPaged, { limit: 1 })
          return meta?.total ?? 0
        },
      },
      {
        key: "users",
        title: "Usuarios",
        icon: UsersIcon,
        href: "/dashboard/users",
        permission: "users:manage",
        load: async () => {
          const { meta } = await usersApi.listUsers(fetcherPaged, { limit: 1 })
          return meta?.total ?? 0
        },
      },
    ],
    [fetcherPaged, hasPermission, user?._id]
  )

  const visibleStats = stats.filter((s) => !s.permission || hasPermission(s.permission))

  React.useEffect(() => {
    visibleStats.forEach((stat) => {
      stat
        .load()
        .then((value) => setCounts((prev) => ({ ...prev, [stat.key]: value })))
        .catch(() => setCounts((prev) => ({ ...prev, [stat.key]: null })))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canWrite = hasPermission("posts:create")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Hola, {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">Este es el resumen de tu blog.</p>
        </div>
        {canWrite ? (
          <Button asChild>
            <Link href="/dashboard/posts/new">
              <PenLineIcon data-icon="inline-start" />
              Nuevo post
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleStats.map((stat) => (
          <Link key={stat.key} href={stat.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {counts[stat.key] === undefined ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-heading text-3xl font-bold">{counts[stat.key] ?? "—"}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rol actual: {user?.role.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Permisos: {user?.role.permissions.length ? user.role.permissions.join(", ") : "todos (administrador)"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
