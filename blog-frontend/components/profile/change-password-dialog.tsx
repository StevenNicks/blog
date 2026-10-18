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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import { changePasswordRequest } from "@/lib/api/auth"

export function ChangePasswordDialog({ trigger }: { trigger: React.ReactNode }) {
  const { fetcher } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const mismatch = confirm.length > 0 && newPassword !== confirm
  const sameAsCurrent = newPassword.length > 0 && newPassword === currentPassword
  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirm && !sameAsCurrent

  function handleOpenChange(next: boolean) {
    if (submitting) return
    setOpen(next)
    if (!next) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirm("")
      setError(null)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const { message } = await changePasswordRequest(fetcher, { currentPassword, newPassword })
      toast.success(message)
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Al cambiarla se cerrarán tus sesiones en otros dispositivos.
            </DialogDescription>
          </DialogHeader>

          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="current-password">Contraseña actual</FieldLabel>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={!!error}
              placeholder="********"
            />
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>

          <Field data-invalid={sameAsCurrent}>
            <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              minLength={8}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={sameAsCurrent}
              placeholder="********"
            />
            <PasswordStrength password={newPassword} />
            {sameAsCurrent ? <FieldError>Debe ser distinta de la actual</FieldError> : null}
          </Field>

          <Field data-invalid={mismatch}>
            <FieldLabel htmlFor="confirm-password">Repetir nueva contraseña</FieldLabel>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={mismatch}
              placeholder="********"
            />
            {mismatch ? <FieldError>Las contraseñas no coinciden</FieldError> : null}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Cambiar contraseña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
