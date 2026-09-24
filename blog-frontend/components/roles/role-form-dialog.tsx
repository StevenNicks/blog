"use client"

import * as React from "react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import * as rolesApi from "@/lib/api/roles"
import { PERMISSIONS } from "@/lib/types"
import type { Role } from "@/lib/types"

const permissionGroups = [
  { label: "Posts", prefix: "posts:" },
  { label: "Comentarios", prefix: "comments:" },
  { label: "Usuarios", prefix: "users:" },
  { label: "Roles", prefix: "roles:" },
  { label: "Imágenes", prefix: "images:" },
]

interface RoleFormDialogProps {
  trigger: React.ReactNode
  role?: Role
  onSaved: () => void
}

export function RoleFormDialog({ trigger, role, onSaved }: RoleFormDialogProps) {
  const { fetcher } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(role?.name ?? "")
  const [description, setDescription] = React.useState(role?.description ?? "")
  const [permissions, setPermissions] = React.useState<string[]>(role?.permissions ?? [])
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setName(role?.name ?? "")
      setDescription(role?.description ?? "")
      setPermissions(role?.permissions ?? [])
    }
  }, [open, role])

  function togglePermission(permission: string, checked: boolean) {
    setPermissions((prev) => (checked ? [...prev, permission] : prev.filter((p) => p !== permission)))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("El nombre del rol es obligatorio")
      return
    }
    setSubmitting(true)
    try {
      if (role) {
        await rolesApi.updateRole(fetcher, role._id, { description, permissions })
      } else {
        await rolesApi.createRole(fetcher, { name: name.trim(), description, permissions })
      }
      toast.success(role ? "Rol actualizado" : "Rol creado")
      setOpen(false)
      onSaved()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo guardar el rol")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{role ? `Editar rol "${role.name}"` : "Nuevo rol"}</DialogTitle>
            <DialogDescription>
              Define qué puede hacer este rol dentro del blog seleccionando sus permisos.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="my-4 max-h-[60vh] overflow-y-auto pr-1">
            <Field>
              <FieldLabel htmlFor="role-name">Nombre</FieldLabel>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={role?.isSystem}
                required
              />
              {role?.isSystem ? <FieldDescription>Los roles del sistema no se pueden renombrar.</FieldDescription> : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="role-description">Descripción</FieldLabel>
              <Textarea
                id="role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </Field>

            {permissionGroups.map((group) => {
              const groupPermissions = PERMISSIONS.filter((p) => p.startsWith(group.prefix))
              return (
                <FieldSet key={group.prefix}>
                  <FieldLegend variant="label">{group.label}</FieldLegend>
                  <FieldGroup className="gap-2.5">
                    {groupPermissions.map((permission) => (
                      <Field key={permission} orientation="horizontal">
                        <Checkbox
                          id={permission}
                          checked={permissions.includes(permission)}
                          onCheckedChange={(checked) => togglePermission(permission, checked === true)}
                        />
                        <FieldLabel htmlFor={permission} className="font-normal">
                          {permission}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                </FieldSet>
              )
            })}
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              {role ? "Guardar cambios" : "Crear rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
