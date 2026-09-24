"use client"

import * as React from "react"
import { toast } from "sonner"
import { ImageIcon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { RoleBadge } from "@/components/status-badge"
import { ImagePickerDialog } from "@/components/images/image-picker-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/lib/format"
import { ApiError } from "@/lib/api/client"
import * as usersApi from "@/lib/api/users"

function ProfileForm() {
  const { user, fetcher, refreshUser } = useAuth()
  const [name, setName] = React.useState(user?.name ?? "")
  const [bio, setBio] = React.useState(user?.bio ?? "")
  const [avatar, setAvatar] = React.useState<string | null>(user?.avatar ?? null)
  const [submitting, setSubmitting] = React.useState(false)

  if (!user) return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await usersApi.updateUser(fetcher, user!._id, { name: name.trim(), bio, avatar })
      await refreshUser()
      toast.success("Perfil actualizado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Actualiza tu información pública.</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <UserAvatar name={user.name} avatar={avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge role={user.role.name} />
              <span className="text-xs text-muted-foreground">Miembro desde {formatDate(user.createdAt)}</span>
            </div>
          </div>
          <ImagePickerDialog
            onSelect={(image) => setAvatar(image.url)}
            trigger={
              <Button type="button" variant="outline" size="sm">
                <ImageIcon data-icon="inline-start" />
                Cambiar foto
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="bio">Biografía</FieldLabel>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Cuéntanos algo sobre ti (se mostrará al final de tus posts)"
                />
                <FieldDescription>{bio.length}/500 caracteres</FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={submitting} className="w-fit">
                  {submitting ? <Spinner data-icon="inline-start" /> : null}
                  Guardar cambios
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileForm />
    </RequireAuth>
  )
}
