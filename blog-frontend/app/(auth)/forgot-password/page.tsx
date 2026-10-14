"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, CircleCheckIcon, KeyRoundIcon, MailCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import { forgotPasswordRequest } from "@/lib/api/auth"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const emailValid = EMAIL_PATTERN.test(email)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPasswordRequest({ email })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar el correo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-xl/30">
      <CardHeader>
        {sent ? (
          <MailCheckIcon className="mb-2 size-5" aria-hidden />
        ) : (
          <KeyRoundIcon className="mb-2 size-5" aria-hidden />
        )}
        <CardTitle className="font-heading text-2xl">
          {sent ? "Revisa tu correo" : "Recuperar contraseña"}
        </CardTitle>
        <CardDescription>
          {sent
            ? "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña."
            : "Ingresa tu correo y te enviaremos un enlace para restablecerla."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              El enlace vence en 1 hora. Si no lo ves, revisa tu carpeta de spam.
            </p>
            <Button type="button" variant="outline" onClick={() => setSent(false)}>
              Usar otro correo
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    placeholder="example@email.com"
                    className="pr-10"
                  />
                  {emailValid ? (
                    <CircleCheckIcon
                      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-primary"
                      aria-hidden
                    />
                  ) : null}
                </div>
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? <Spinner data-icon="inline-start" /> : null}
                  Enviar enlace
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
