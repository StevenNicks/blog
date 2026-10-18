"use client"

import * as React from "react"
import { toast } from "sonner"
import { LockIcon, PenLineIcon, PlusIcon, ShieldIcon, Trash2Icon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { RoleFormDialog } from "@/components/roles/role-form-dialog"
import { Button } from "@/components/ui/button"
import { RolePermissionSummary } from "@/components/roles/role-permission-summary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadError } from "@/components/loading/load-error"
import { LoadingGate } from "@/components/loading/loading-gate"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { ApiError } from "@/lib/api/client"
import * as rolesApi from "@/lib/api/roles"
import type { Role } from "@/lib/types"

// Jerarquía de los roles del sistema, de mayor a menor acceso. Los roles personalizados
// van después, ordenados por cantidad de permisos.
const SYSTEM_ROLE_ORDER = ["admin", "editor", "author", "reader"]

function sortRolesByHierarchy(roles: Role[]) {
  const rank = (role: Role) => {
    const index = SYSTEM_ROLE_ORDER.indexOf(role.name)
    return index === -1 ? SYSTEM_ROLE_ORDER.length : index
  }
  return [...roles].sort((a, b) => rank(a) - rank(b) || b.permissions.length - a.permissions.length)
}

// Misma estructura que la tarjeta de rol (cabecera, 4 áreas con 3/4/2/2 filas, botones)
const SKELETON_AREA_ROWS = [3, 4, 2, 2]

function RoleCardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {SKELETON_AREA_ROWS.map((rows, i) => (
            <Skeleton key={i} style={{ height: 46 + rows * 22 }} className="w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  )
}

function RolesGrid() {
  const { fetcher } = useAuth()
  const [roles, setRoles] = React.useState<Role[]>([])
  // loading: primera carga (skeleton). refreshing: recargas con datos ya visibles (spinner discreto)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Role | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const loadedRef = React.useRef(false)

  const load = React.useCallback(async () => {
    if (loadedRef.current) setRefreshing(true)
    else {
      setLoading(true)
      setLoadError(false)
    }
    try {
      setRoles(sortRolesByHierarchy(await rolesApi.listRoles(fetcher)))
      loadedRef.current = true
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los roles")
      if (!loadedRef.current) setLoadError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [fetcher])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await rolesApi.deleteRole(fetcher, deleteTarget._id)
      toast.success("Rol eliminado")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el rol")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Roles y permisos</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Controla qué puede hacer cada tipo de usuario.</span>
            {/* Ancho reservado para que el texto no salte al aparecer el spinner */}
            <span className="flex size-4 items-center justify-center">{refreshing ? <Spinner /> : null}</span>
          </p>
        </div>
        <RoleFormDialog
          onSaved={load}
          trigger={
            <Button>
              <PlusIcon data-icon="inline-start" />
              Nuevo rol
            </Button>
          }
        />
      </div>

      <LoadingGate
        loading={loading}
        onRetry={load}
        skeleton={
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RoleCardSkeleton key={i} />
            ))}
          </div>
        }
      >
      {loadError ? (
        <LoadError title="No se pudieron cargar los roles" onRetry={load} />
      ) : (
        // <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {roles.map((role) => (
            <Card key={role._id}>
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 font-heading text-base capitalize">
                    <ShieldIcon className="size-4 text-muted-foreground" />
                    {role.name}
                    {role.isSystem ? <LockIcon className="size-3.5 text-muted-foreground" /> : null}
                  </CardTitle>
                  <p
                    className="mt-1 truncate text-sm text-muted-foreground"
                    title={role.description || undefined}
                  >
                    {role.description || "Sin descripción"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <RolePermissionSummary permissions={role.permissions} />
                <div className="flex gap-2">
                  <RoleFormDialog
                    role={role}
                    onSaved={load}
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1">
                        <PenLineIcon data-icon="inline-start" />
                        Editar
                      </Button>
                    }
                  />
                  {!role.isSystem ? (
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(role)}>
                      <Trash2Icon data-icon="inline-start" />
                      Eliminar
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </LoadingGate>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`¿Eliminar el rol "${deleteTarget?.name}"?`}
        description="No podrás eliminarlo si algún usuario lo tiene asignado actualmente."
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default function DashboardRolesPage() {
  return (
    <RequireAuth anyPermission={["roles:manage"]}>
      <RolesGrid />
    </RequireAuth>
  )
}
