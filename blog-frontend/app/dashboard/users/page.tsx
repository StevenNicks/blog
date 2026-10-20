"use client"

import * as React from "react"
import { toast } from "sonner"
import { SearchIcon, Trash2Icon, UserCheckIcon, UserXIcon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadError } from "@/components/loading/load-error"
import { LoadingGate } from "@/components/loading/loading-gate"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { EmptySearch } from "@/components/empty/empty-search"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSelectionBar } from "@/components/data-table/data-table-selection-bar"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { toastBulkResult } from "@/components/data-table/bulk-toast"
import { useDataTable } from "@/components/data-table/use-data-table"
import { ApiError } from "@/lib/api/client"
import * as usersApi from "@/lib/api/users"
import * as rolesApi from "@/lib/api/roles"
import type { Role, User } from "@/lib/types"

import { getUserColumns } from "./columns"

type DeleteTarget = { kind: "single"; user: User } | { kind: "bulk"; ids: string[] }

function UsersTable() {
  const { fetcher, fetcherPaged, user: currentUser } = useAuth()
  const [users, setUsers] = React.useState<User[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  // loading: primera carga (skeleton). refreshing: recargas con datos ya visibles (spinner discreto)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)
  const [search, setSearch] = React.useState("")
  // Id del rol o "all"; la API filtra con ?role=<id>
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [total, setTotal] = React.useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [bulkUpdating, setBulkUpdating] = React.useState<"activate" | "deactivate" | null>(null)
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set())
  const loadedRef = React.useRef(false)
  const requestRef = React.useRef(0)

  const isAdmin = currentUser?.role.name === "admin"
  // No puedes gestionarte a ti mismo; solo un admin gestiona a otros admins (la API protege al propietario)
  const isLocked = React.useCallback(
    (user: User) => user._id === currentUser?._id || (user.role.name === "admin" && !isAdmin),
    [currentUser?._id, isAdmin]
  )

  function setPending(id: string, on: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function handleRoleChange(user: User, roleId: string) {
    setPending(user._id, true)
    try {
      const updated = await usersApi.assignRole(fetcher, user._id, roleId)
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      toast.success("Rol actualizado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el rol")
    } finally {
      setPending(user._id, false)
    }
  }

  async function handleActiveChange(user: User, isActive: boolean) {
    setPending(user._id, true)
    try {
      const updated = await usersApi.setUserActive(fetcher, user._id, isActive)
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      toast.success(isActive ? "Usuario activado" : "Usuario desactivado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el usuario")
    } finally {
      setPending(user._id, false)
    }
  }

  // Las columnas leen funciones que cambian con cada render (pendientes, handlers): se recrean entonces
  const columns = getUserColumns({
    roles,
    canAssignAdmin: isAdmin,
    isLocked,
    isPending: (user) => pendingIds.has(user._id),
    onRoleChange: handleRoleChange,
    onActiveChange: handleActiveChange,
    onDelete: (user) => setDeleteTarget({ kind: "single", user }),
  })

  const { table, pagination, sortParam, selectedIds, resetPage, clearSelection } = useDataTable({
    data: users,
    columns,
    rowCount: total ?? 0,
    getRowId: (user) => user._id,
    // Las filas bloqueadas (tu cuenta, otros admins) no se pueden seleccionar para acciones en lote
    enableRowSelection: (row) => !isLocked(row.original),
    storageKey: "dashboard:users:columns",
  })

  const load = React.useCallback(async () => {
    const requestId = ++requestRef.current
    if (loadedRef.current) setRefreshing(true)
    else {
      setLoading(true)
      setLoadError(false)
    }
    try {
      const [{ data, meta }, roleList] = await Promise.all([
        usersApi.listUsers(fetcherPaged, {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          sort: sortParam,
          search: search || undefined,
          role: roleFilter === "all" ? undefined : roleFilter,
        }),
        rolesApi.listRoles(fetcher),
      ])
      if (requestId !== requestRef.current) return
      // Si se borró la última fila de la última página, se retrocede a la que ahora es la última
      if (meta && meta.pages > 0 && pagination.pageIndex + 1 > meta.pages) {
        table.setPageIndex(meta.pages - 1)
        return
      }
      setUsers(data)
      setRoles(roleList)
      setTotal(meta?.total ?? data.length)
      loadedRef.current = true
    } catch (err) {
      if (requestId !== requestRef.current) return
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios")
      if (!loadedRef.current) setLoadError(true)
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
    // table es estable entre renders; no se incluye para no recrear load en cada render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcherPaged, fetcher, pagination.pageIndex, pagination.pageSize, sortParam, search, roleFilter])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      if (deleteTarget.kind === "single") {
        await usersApi.deleteUser(fetcher, deleteTarget.user._id)
        toast.success("Usuario eliminado")
      } else {
        const result = await usersApi.bulkDeleteUsers(fetcher, deleteTarget.ids)
        toastBulkResult(result, (n) => `${n} usuario${n === 1 ? "" : "s"} eliminado${n === 1 ? "" : "s"}`)
      }
      setDeleteTarget(null)
      clearSelection()
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar")
    } finally {
      setDeleting(false)
    }
  }

  async function handleBulkActive(isActive: boolean) {
    if (bulkUpdating) return
    setBulkUpdating(isActive ? "activate" : "deactivate")
    try {
      const result = await usersApi.bulkSetUsersActive(fetcher, selectedIds, isActive)
      toastBulkResult(
        result,
        (n) => `${n} usuario${n === 1 ? "" : "s"} ${isActive ? "activado" : "desactivado"}${n === 1 ? "" : "s"}`
      )
      clearSelection()
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron actualizar los usuarios")
    } finally {
      setBulkUpdating(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          {total === null ? (
            <span aria-hidden className="inline-block h-5 w-32" />
          ) : (
            <span>
              {total} usuario{total === 1 ? "" : "s"} registrados
            </span>
          )}
          {/* Ancho reservado para que el texto no salte al aparecer el spinner */}
          <span className="flex size-4 items-center justify-center">{refreshing ? <Spinner /> : null}</span>
        </p>
      </div>

      {/* Móvil: buscador a todo el ancho; debajo, rol (estirado) y el ícono de columnas */}
      <div className="flex flex-wrap items-center gap-3">
        <InputGroup className="w-full sm:max-w-xs">
          <InputGroupInput
            placeholder="Buscar por nombre o email…"
            aria-label="Buscar usuarios"
            value={search}
            onChange={(e) => {
              resetPage()
              setSearch(e.target.value)
            }}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            resetPage()
            setRoleFilter(value)
          }}
        >
          <SelectTrigger className="flex-1 sm:w-48 sm:flex-none" aria-label="Filtrar por rol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Todos los roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role._id} value={role._id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <DataTableSelectionBar count={selectedIds.length} onClear={clearSelection}>
        <Button variant="outline" size="sm" disabled={!!bulkUpdating} onClick={() => handleBulkActive(true)}>
          {bulkUpdating === "activate" ? <Spinner data-icon="inline-start" /> : <UserCheckIcon data-icon="inline-start" />}
          Activar
        </Button>
        <Button variant="outline" size="sm" disabled={!!bulkUpdating} onClick={() => handleBulkActive(false)}>
          {bulkUpdating === "deactivate" ? <Spinner data-icon="inline-start" /> : <UserXIcon data-icon="inline-start" />}
          Desactivar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={!!bulkUpdating}
          onClick={() => setDeleteTarget({ kind: "bulk", ids: selectedIds })}
        >
          <Trash2Icon data-icon="inline-start" />
          Eliminar
        </Button>
      </DataTableSelectionBar>

      <LoadingGate
        loading={loading}
        onRetry={load}
        skeleton={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        }
      >
        {loadError ? (
          <LoadError title="No se pudieron cargar los usuarios" onRetry={load} />
        ) : users.length === 0 ? (
          <EmptySearch
            entity="usuarios"
            query={search}
            clearLabel={roleFilter !== "all" ? "Limpiar filtros" : undefined}
            onClear={() => {
              resetPage()
              setSearch("")
              setRoleFilter("all")
            }}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <DataTable table={table} />
            <DataTablePagination table={table} />
          </div>
        )}
      </LoadingGate>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemType="usuario"
        title={
          deleteTarget?.kind === "bulk"
            ? `¿Eliminar ${deleteTarget.ids.length} usuario${deleteTarget.ids.length === 1 ? "" : "s"}?`
            : undefined
        }
        itemName={deleteTarget?.kind === "single" ? deleteTarget.user.name : undefined}
        description={
          deleteTarget?.kind === "bulk"
            ? "Se eliminarán sus cuentas y sus comentarios, y perderán el acceso al panel. No se puede deshacer."
            : "Se eliminará su cuenta y perderá el acceso al panel. No se puede deshacer."
        }
        isPending={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default function DashboardUsersPage() {
  return (
    <RequireAuth anyPermission={["users:manage"]}>
      <UsersTable />
    </RequireAuth>
  )
}
