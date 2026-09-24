"use client"

import * as React from "react"
import { toast } from "sonner"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon, UsersIcon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pages, setPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [{ data, meta }, roleList] = await Promise.all([
        usersApi.listUsers(fetcherPaged, { page, limit: 15, search: search || undefined }),
        rolesApi.listRoles(fetcher),
      ])
      setUsers(data)
      setRoles(roleList)
      setPages(meta?.pages ?? 1)
      setTotal(meta?.total ?? data.length)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }, [fetcherPaged, fetcher, page, search])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleRoleChange(user: User, roleId: string) {
    try {
      const updated = await usersApi.assignRole(fetcher, user._id, roleId)
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      toast.success("Rol actualizado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el rol")
    }
  }

  async function handleActiveChange(user: User, isActive: boolean) {
    try {
      const updated = await usersApi.setUserActive(fetcher, user._id, isActive)
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)))
      toast.success(isActive ? "Usuario activado" : "Usuario desactivado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el usuario")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await usersApi.deleteUser(fetcher, deleteTarget._id)
      toast.success("Usuario eliminado")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo eliminar el usuario")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">{total} usuario{total === 1 ? "" : "s"} registrados</p>
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

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Empty className="min-h-[40vh]">
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No se encontraron usuarios</EmptyTitle>
          <EmptyDescription>Prueba con otro término de búsqueda.</EmptyDescription>
        </Empty>
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
                const isSelf = user._id === currentUser?._id
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
                      <Select
                        value={user.role._id}
                        onValueChange={(roleId) => handleRoleChange(user, roleId)}
                        disabled={isSelf}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        disabled={isSelf}
                        onCheckedChange={(checked) => handleActiveChange(user, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" disabled={isSelf}>
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
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
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
