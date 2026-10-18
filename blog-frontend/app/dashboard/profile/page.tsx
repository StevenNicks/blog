"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BadgeCheckIcon,
  CameraIcon,
  ChevronDownIcon,
  GlobeIcon,
  ImageIcon,
  KeyRoundIcon,
  MailIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import { RequireAuth } from "@/components/require-auth"
import { useAuth } from "@/components/providers/auth-provider"
import { UserAvatar } from "@/components/user-avatar"
import { assetUrl } from "@/lib/api/client"
import { ImagePickerDialog } from "@/components/images/image-picker-dialog"
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
    <div className="grid gap-2 border-t px-4 py-4 sm:px-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
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
  const [coverImage, setCoverImage] = React.useState<string | null>(user?.coverImage ?? null)
  const [submitting, setSubmitting] = React.useState(false)
  const [sendingVerification, setSendingVerification] = React.useState(false)

  if (!user) return null

  const dirty =
    name.trim() !== user.name || bio !== (user.bio ?? "") || avatar !== (user.avatar ?? null) ||
    coverImage !== (user.coverImage ?? null)

  function handleCancel() {
    setName(user!.name)
    setBio(user!.bio ?? "")
    setAvatar(user!.avatar ?? null)
    setCoverImage(user!.coverImage ?? null)
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
      await usersApi.updateUser(fetcher, user!._id, { name: name.trim(), bio, avatar, coverImage })
      await refreshUser()
      toast.success("Perfil actualizado")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo actualizar el perfil")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-6 lg:gap-1">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Mi perfil</h1>
          <p className="text-sm text-muted-foreground">Actualiza tu información pública.</p>
        </div>

        <Card className="gap-0 overflow-hidden p-0 shadow-xl/30">
          <div className="relative h-28 bg-primary sm:h-32">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assetUrl(coverImage)} alt="" className="size-full object-cover" />
            ) : null}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Tooltip>
                <ImagePickerDialog
                  onSelect={(image) => setCoverImage(image.url)}
                  trigger={
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        aria-label="Cambiar portada"
                      >
                        <CameraIcon />
                      </Button>
                    </TooltipTrigger>
                  }
                />
                <TooltipContent className="max-sm:hidden">Cambiar portada</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="px-4 pb-6 sm:px-6">
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
              <div className="flex shrink-0 items-center gap-2">
                {avatar || coverImage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label="Quitar foto"
                      >
                        <Trash2Icon data-icon="inline-start" />
                        <span className="max-sm:sr-only">Quitar foto</span>
                        <ChevronDownIcon data-icon="inline-end" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-auto min-w-(--radix-dropdown-menu-trigger-width) whitespace-nowrap">
                      <DropdownMenuItem disabled={!avatar} onSelect={() => setAvatar(null)}>
                        <UserIcon />
                        Foto de perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!coverImage} onSelect={() => setCoverImage(null)}>
                        <ImageIcon />
                        Foto de portada
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                <Button asChild variant="outline" size="sm" className="max-sm:w-7 max-sm:justify-center max-sm:px-0!">
                  <Link href="/" aria-label="Ver blog">
                    <GlobeIcon data-icon="inline-start" />
                    <span className="max-sm:sr-only">Ver blog</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1">
              <h2 className="order-1 min-w-0 font-heading text-xl font-semibold tracking-tight break-words">
                {user.name}
              </h2>
              <Badge
                variant="outline"
                className="order-3 gap-0 sm:order-2 divide-x divide-border px-0"
                aria-label={`${user.isActive ? "Activo" : "Inactivo"}, rol ${user.role.name}`}
              >
                <span className="flex items-center gap-1.5 pr-2 pl-2.5">
                  <span
                    className={
                      user.isActive
                        ? "size-1.5 rounded-full bg-emerald-500"
                        : "size-1.5 rounded-full bg-muted-foreground"
                    }
                  />
                  {user.isActive ? "Activo" : "Inactivo"}
                </span>
                <span className="flex items-center gap-1 pr-2.5 pl-2 font-medium capitalize">
                  <ShieldIcon className="size-3 text-muted-foreground" />
                  {user.role.name}
                </span>
              </Badge>
              <p className="order-2 flex items-start gap-1 text-sm text-muted-foreground sm:order-3 sm:basis-full sm:items-center">
                <span className="min-w-0 break-all">{user.email}</span>
                {user.emailVerifiedAt ? (
                  <BadgeCheckIcon className="size-4 shrink-0 text-primary max-sm:mt-0.5" aria-label="Correo verificado" />
                ) : null}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 divide-x divide-border">
              <div className="min-w-0 pr-3 sm:pr-4">
                <Stat label="Miembro desde" value={formatDate(user.createdAt, { month: "short" })} />
              </div>
              <div className="min-w-0 pl-3 sm:pl-4">
                <Stat
                  label="Último acceso"
                  value={user.lastLoginAt ? formatDate(user.lastLoginAt, { month: "short" }) : "—"}
                />
              </div>
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

            <FormRow label="Contraseña">
              <InputGroup>
                <InputGroupAddon>
                  <KeyRoundIcon />
                </InputGroupAddon>
                <InputGroupInput value="••••••••" readOnly disabled aria-label="Contraseña" />
              </InputGroup>
              <div>
                <ChangePasswordDialog
                  trigger={
                    <Button type="button" variant="link" size="xs" className="h-auto p-0 text-xs">
                      Cambiar contraseña
                    </Button>
                  }
                />
              </div>
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

            <div className="flex justify-end gap-2 border-t px-4 py-4 sm:px-6">
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
    </>
  )
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileForm />
    </RequireAuth>
  )
}
