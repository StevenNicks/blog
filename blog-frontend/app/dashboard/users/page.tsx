"use client"

import * as React from "react"
import { toast } from "sonner"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadError } from "@/components/loading/load-error"
import { LoadingGate } from "@/components/loading/loading-gate"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { EmptySearch } from "@/components/empty/empty-search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { formatDate } from "@/lib/format"
import { ApiError } from "@/lib/api/client"
import * as usersApi from "@/lib/api/users"
import * as rolesApi from "@/lib/api/roles"
import type { Role, User } from "@/lib/types"

function UsersTable() {
  const { fetcher, fetcherPaged, user: currentUser } = useAuth()
  const [users, setUsers] = React.useState<User[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  // loading: primera carga (skeleton). refreshing: recargas con datos ya visibles (spinner discreto)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pages, setPages] = React.useState(1)
  const [total, setTotal] = React.useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set())
  const loadedRef = React.useRef(false)
  const requestRef = React.useRef(0)

  const load = React.useCallback(async () => {
    const requestId = ++requestRef.current
    if (loadedRef.current) setRefreshing(true)
    else {
      setLoading(true)
      setLoadError(false)
    }
    try {
      const [{ data, meta }, roleList] = await Promise.all([
        usersApi.listUsers(fetcherPaged, { page, limit: 15, search: search || undefined }),
        rolesApi.listRoles(fetcher),
      ])
      if (requestId !== requestRef.current) return
      setUsers(data)
      setRoles(roleList)
      setPages(meta?.pages ?? 1)
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
  }, [fetcherPaged, fetcher, page, search])

  React.useEffect(() => {
    load()
  }, [load])

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

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await usersApi.deleteUser(fetcher, deleteTarget._id)
      toast.success("Usuario eliminado")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el usuario")
    } finally {
      setDeleting(false)
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
            <span>{total} usuario{total === 1 ? "" : "s"} registrados</span>
          )}
          {/* Ancho reservado para que el texto no salte al aparecer el spinner */}
          <span className="flex size-4 items-center justify-center">{refreshing ? <Spinner /> : null}</span>
        </p>
      </div>

      <InputGroup className="max-w-xs">
        <InputGroupInput
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

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
          onClear={() => {
            setPage(1)
            setSearch("")
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                // No puedes editarte a ti mismo; solo un admin gestiona a otros admins (la API protege al propietario)
                const isPending = pendingIds.has(user._id)
                const isLocked =
                  user._id === currentUser?._id ||
                  (user.role.name === "admin" && currentUser?.role.name !== "admin")
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" aria-busy={isPending}>
                      <Select
                        value={user.role._id}
                        onValueChange={(roleId) => handleRoleChange(user, roleId)}
                        disabled={isLocked || isPending}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {roles
                              .filter((role) => role.name !== "admin" || currentUser?.role.name === "admin")
                              .map((role) => (
                                <SelectItem key={role._id} value={role._id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {/* Ancho fijo reservado para que la fila no salte al aparecer el spinner */}
                      <span className="flex size-4 items-center justify-center">
                        {isPending ? <Spinner /> : null}
                      </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        disabled={isLocked || isPending}
                        onCheckedChange={(checked) => handleActiveChange(user, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" disabled={isLocked}>
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(user)}>
                            <Trash2Icon data-icon="inline-start" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      </LoadingGate>

      {pages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {page} de {pages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon data-icon="inline-start" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Siguiente
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Mantiene el diálogo abierto mientras se elimina
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
            >
              {deleting ? <Spinner data-icon="inline-start" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
