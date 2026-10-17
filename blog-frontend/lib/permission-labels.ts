import type { Permission } from "@/lib/types"

export type PermissionLevel = "yes" | "no" | "own" | "any" | "none"

/** Interruptor Sí/No respaldado por un único permiso. */
interface ToggleRow {
  kind: "toggle"
  label: string
  permission: Permission
}

/** Nivel de acceso: Sin acceso / Propio / Todos, respaldado por un permiso :own y/o :any. */
interface ScopeRow {
  kind: "scope"
  label: string
  own?: Permission
  any?: Permission
  /** Si este permiso está activo, la fila vale "Todos" aunque `any` no esté guardado. */
  impliedAnyBy?: Permission
}

export type PermissionRow = ToggleRow | ScopeRow

export interface PermissionArea {
  id: string
  label: string
  icon: "article" | "message" | "photo" | "shield"
  rows: PermissionRow[]
}

export const PERMISSION_AREAS: PermissionArea[] = [
  {
    id: "posts",
    label: "Publicaciones",
    icon: "article",
    rows: [
      { kind: "toggle", label: "Crear", permission: "posts:create" },
      { kind: "scope", label: "Editar", own: "posts:edit:own", any: "posts:edit:any" },
      { kind: "scope", label: "Eliminar", own: "posts:delete:own", any: "posts:delete:any" },
    ],
  },
  {
    id: "comments",
    label: "Comentarios",
    icon: "message",
    rows: [
      { kind: "toggle", label: "Crear", permission: "comments:create" },
      { kind: "scope", label: "Editar", own: "comments:edit:own" },
      {
        kind: "scope",
        label: "Eliminar",
        own: "comments:delete:own",
        any: "comments:delete:any",
        // En la API, quien modera puede eliminar cualquier comentario.
        impliedAnyBy: "comments:moderate",
      },
      { kind: "toggle", label: "Moderar", permission: "comments:moderate" },
    ],
  },
  {
    id: "images",
    label: "Imágenes",
    icon: "photo",
    rows: [
      { kind: "toggle", label: "Subir", permission: "images:upload" },
      { kind: "scope", label: "Eliminar", own: "images:delete:own", any: "images:delete:any" },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    icon: "shield",
    rows: [
      { kind: "toggle", label: "Gestionar usuarios", permission: "users:manage" },
      { kind: "toggle", label: "Gestionar roles", permission: "roles:manage" },
    ],
  },
]

export const LEVEL_LABEL: Record<PermissionLevel, string> = {
  yes: "Sí",
  no: "No",
  none: "Sin acceso",
  own: "Propio",
  any: "Todos",
}

/** Nivel de una fila. `any` incluye a `own`, así que gana si ambos están guardados. */
export function getRowLevel(row: PermissionRow, permissions: string[]): PermissionLevel {
  if (row.kind === "toggle") return permissions.includes(row.permission) ? "yes" : "no"
  if (row.impliedAnyBy && permissions.includes(row.impliedAnyBy)) return "any"
  if (row.any && permissions.includes(row.any)) return "any"
  if (row.own && permissions.includes(row.own)) return "own"
  return "none"
}
