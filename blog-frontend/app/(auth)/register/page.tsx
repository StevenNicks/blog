"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CircleCheckIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import { PasswordStrength } from "@/components/ui/password-strength"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const emailValid = EMAIL_PATTERN.test(email)
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
      await register(name, email, password)
      toast.success("Cuenta creada correctamente")
      router.push("/")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <UserPlusIcon className="mb-2 size-5" aria-hidden />
        <CardTitle className="font-heading text-2xl">Crear cuenta</CardTitle>
        <CardDescription>Ingresa tus datos para registrarte.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jhon Doe"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                minLength={8}
                required
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
                Crear cuenta
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
