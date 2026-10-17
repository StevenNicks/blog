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
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

function RolesGrid() {
  const { fetcher } = useAuth()
  const [roles, setRoles] = React.useState<Role[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleteTarget, setDeleteTarget] = React.useState<Role | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      setRoles(sortRolesByHierarchy(await rolesApi.listRoles(fetcher)))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los roles")
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await rolesApi.deleteRole(fetcher, deleteTarget._id)
      toast.success("Rol eliminado")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el rol")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Roles y permisos</h1>
          <p className="text-sm text-muted-foreground">Controla qué puede hacer cada tipo de usuario.</p>
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el rol &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              No podrás eliminarlo si algún usuario lo tiene asignado actualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
