"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react"

import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { createSelectColumn } from "@/components/data-table/data-table-select-column"
import { type DataTableFeatures } from "@/components/data-table/data-table-features"
import { formatDate } from "@/lib/format"
import type { Role, User } from "@/lib/types"

const columnHelper = createColumnHelper<DataTableFeatures, User>()

interface UserColumnsOptions {
  roles: Role[]
  /** Solo un admin puede asignar el rol admin. */
  canAssignAdmin: boolean
  /** Filas que el usuario actual no puede gestionar (él mismo, u otro admin si no es admin). */
  isLocked: (user: User) => boolean
  isPending: (user: User) => boolean
  onRoleChange: (user: User, roleId: string) => void
  onActiveChange: (user: User, isActive: boolean) => void
  onDelete: (user: User) => void
}

// Los ids de las columnas ordenables coinciden con los campos que acepta ?sort= en la API
export function getUserColumns({
  roles,
  canAssignAdmin,
  isLocked,
  isPending,
  onRoleChange,
  onActiveChange,
  onDelete,
}: UserColumnsOptions) {
  return columnHelper.columns([
    createSelectColumn<User>(),
    columnHelper.accessor("name", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usuario" />,
      // Si la columna Email está oculta (pantallas angostas), el email va bajo el nombre
      cell: ({ row, table }) => (
        <div className="flex min-w-28 items-center gap-2">
          <UserAvatar name={row.original.name} avatar={row.original.avatar} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            {table.getColumn("email")?.getIsVisible() ? null : (
              <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
            )}
          </div>
        </div>
      ),
      enableHiding: false,
      meta: { label: "Usuario", cellClassName: "max-w-56" },
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      meta: { label: "Email", hideBelow: "xl", cellClassName: "text-muted-foreground" },
    }),
    columnHelper.accessor((user) => user.role.name, {
      id: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
      cell: ({ row }) => {
        const user = row.original
        const pending = isPending(user)
        return (
          <div className="flex items-center gap-2" aria-busy={pending}>
            <Select
              value={user.role._id}
              onValueChange={(roleId) => onRoleChange(user, roleId)}
              disabled={isLocked(user) || pending}
            >
              <SelectTrigger className="w-28 sm:w-36" aria-label={`Rol de ${user.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roles
                    .filter((role) => role.name !== "admin" || canAssignAdmin)
                    .map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* Ancho fijo reservado para que la fila no salte al aparecer el spinner */}
            <span className="flex size-4 items-center justify-center">{pending ? <Spinner /> : null}</span>
          </div>
        )
      },
      // ?sort=role ordena por el nombre del rol (la API lo resuelve con una agregación)
      meta: { label: "Rol" },
    }),
    columnHelper.accessor("isActive", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Activo" />,
      cell: ({ row }) => {
        const user = row.original
        return (
          <Switch
            checked={user.isActive}
            disabled={isLocked(user) || isPending(user)}
            onCheckedChange={(checked) => onActiveChange(user, checked)}
            aria-label={`${user.name} activo`}
          />
        )
      },
      meta: { label: "Activo", hideBelow: "md" },
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <DataTableColumnHeader column={column} title="Registrado" />,
      cell: ({ getValue }) => formatDate(getValue()),
      sortDescFirst: true,
      meta: { label: "Registrado", hideBelow: "xl", cellClassName: "text-muted-foreground" },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" disabled={isLocked(user)} aria-label={`Acciones de ${user.name}`}>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                  <Trash2Icon data-icon="inline-start" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableHiding: false,
      meta: { headerClassName: "w-10" },
    }),
  ])
}
