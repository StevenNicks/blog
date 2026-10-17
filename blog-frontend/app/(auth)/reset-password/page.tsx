"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon, LockKeyholeIcon } from "lucide-react"
import { toast } from "sonner"

import { AuthCardSkeleton } from "@/components/loading/auth-card-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import { resetPasswordRequest } from "@/lib/api/auth"

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<AuthCardSkeleton />}>
      <ResetPasswordForm />
    </React.Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const token = useSearchParams().get("token") ?? ""
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const mismatch = confirm.length > 0 && confirm !== password

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }
    setLoading(true)
    try {
      await resetPasswordRequest({ token, password })
      toast.success("Contraseña actualizada")
      router.push("/login")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo restablecer la contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-xl/30">
      <CardHeader>
        <LockKeyholeIcon className="mb-2 size-5" aria-hidden />
        <CardTitle className="font-heading text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>
          {token
            ? "Elige una contraseña segura para tu cuenta."
            : "El enlace de recuperación no es válido."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <Button asChild>
            <Link href="/forgot-password">Solicitar un nuevo enlace</Link>
          </Button>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
                <PasswordStrength password={password} />
              </Field>
              <Field data-invalid={mismatch || !!error}>
                <FieldLabel htmlFor="confirm">Repetir contraseña</FieldLabel>
                <PasswordInput
                  id="confirm"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={mismatch || !!error}
                  placeholder="********"
                />
                {mismatch ? <FieldError>Las contraseñas no coinciden</FieldError> : null}
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner data-icon="inline-start" /> : null}
                  Restablecer contraseña
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden />
            Volver a iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
