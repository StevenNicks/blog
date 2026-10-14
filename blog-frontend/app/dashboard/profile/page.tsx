"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { BadgeCheckIcon, CameraIcon, GlobeIcon, MailIcon, Trash2Icon } from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { RoleBadge } from "@/components/status-badge"
import { ImagePickerDialog } from "@/components/images/image-picker-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/lib/format"
import { ApiError } from "@/lib/api/client"
import * as usersApi from "@/lib/api/users"
import { sendVerificationRequest } from "@/lib/api/auth"

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  )
}

function FormRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-2 border-t px-6 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <label htmlFor={htmlFor} className="pt-2 text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex min-w-0 flex-col gap-1.5">{children}</div>
    </div>
  )
}

function ProfileForm() {
  const { user, fetcher, refreshUser } = useAuth()
  const [name, setName] = React.useState(user?.name ?? "")
  const [bio, setBio] = React.useState(user?.bio ?? "")
  const [avatar, setAvatar] = React.useState<string | null>(user?.avatar ?? null)
  const [submitting, setSubmitting] = React.useState(false)
  const [sendingVerification, setSendingVerification] = React.useState(false)

  if (!user) return null

  const dirty =
    name.trim() !== user.name || bio !== (user.bio ?? "") || avatar !== (user.avatar ?? null)

  function handleCancel() {
    setName(user!.name)
    setBio(user!.bio ?? "")
    setAvatar(user!.avatar ?? null)
  }

  async function handleSendVerification() {
    setSendingVerification(true)
    try {
      const { message, delivered } = await sendVerificationRequest(fetcher)
      if (delivered) toast.success(message)
      else toast.warning(message)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo enviar el correo")
    } finally {
      setSendingVerification(false)
    }
  }

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Actualiza tu información pública.</p>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="h-28 bg-linear-to-br from-primary/30 via-primary/10 to-transparent sm:h-32" />

        <div className="px-6 pb-6">
          <div className="-mt-10 flex items-end justify-between gap-4">
            <div className="relative">
              <UserAvatar
                name={user.name}
                avatar={avatar}
                className="size-20 ring-4 ring-card [&_[data-slot=avatar-fallback]]:text-xl"
              />
              <ImagePickerDialog
                onSelect={(image) => setAvatar(image.url)}
                trigger={
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    aria-label="Cambiar foto"
                    className="absolute -right-1 -bottom-1 rounded-full ring-2 ring-card"
                  >
                    <CameraIcon />
                  </Button>
                }
              />
            </div>
            <div className="flex items-center gap-2">
              {avatar ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setAvatar(null)}>
                  <Trash2Icon data-icon="inline-start" />
                  Quitar foto
                </Button>
              ) : null}
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <GlobeIcon data-icon="inline-start" />
                  Ver blog
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight">{user.name}</h2>
            <Badge variant="outline" className="gap-1.5">
              <span
                className={
                  user.isActive
                    ? "size-1.5 rounded-full bg-emerald-500"
                    : "size-1.5 rounded-full bg-muted-foreground"
                }
              />
              {user.isActive ? "Activo" : "Inactivo"}
            </Badge>
            <RoleBadge role={user.role.name} />
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {user.email}
            {user.emailVerifiedAt ? (
              <BadgeCheckIcon className="size-4 text-primary" aria-label="Correo verificado" />
            ) : null}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <Stat label="Miembro desde" value={formatDate(user.createdAt, { month: "short" })} />
            <Stat
              label="Último acceso"
              value={user.lastLoginAt ? formatDate(user.lastLoginAt, { month: "short" }) : "—"}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <FormRow label="Nombre" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </FormRow>

          <FormRow label="Correo electrónico" htmlFor="email">
            <InputGroup>
              <InputGroupAddon>
                <MailIcon />
              </InputGroupAddon>
              <InputGroupInput id="email" value={user.email} readOnly disabled />
            </InputGroup>
            {user.emailVerifiedAt ? (
              <p className="flex items-center gap-1 text-xs font-medium text-primary">
                <BadgeCheckIcon className="size-3.5" />
                Verificado el {formatDate(user.emailVerifiedAt)}
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-xs text-muted-foreground">Correo sin verificar.</p>
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  className="h-auto p-0 text-xs"
                  disabled={sendingVerification}
                  onClick={handleSendVerification}
                >
                  {sendingVerification ? <Spinner data-icon="inline-start" /> : null}
                  Enviar correo de verificación
                </Button>
              </div>
            )}
          </FormRow>

          <FormRow label="Biografía" htmlFor="bio">
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Cuéntanos algo sobre ti (se mostrará al final de tus posts)"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/500 caracteres</p>
          </FormRow>

          <div className="flex justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={!dirty || submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!dirty || submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Guardar cambios
            </Button>
          </div>
        </form>
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
