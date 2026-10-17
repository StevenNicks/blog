"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CircleCheckIcon, LogInIcon } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { AuthCardSkeleton } from "@/components/loading/auth-card-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"

const REMEMBERED_EMAIL_KEY = "blog:remembered-email"
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function LoginPage() {
  return (
    <React.Suspense fallback={<AuthCardSkeleton />}>
      <LoginForm />
    </React.Suspense>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [remember, setRemember] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // "Recordarme" guarda solo el correo en este navegador.
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY)
      if (saved) {
        setEmail(saved)
        setRemember(true)
      }
    } catch {}
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      try {
        if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      } catch {}
      toast.success("Sesión iniciada")
      router.push(searchParams.get("next") || "/")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const emailValid = EMAIL_PATTERN.test(email)

  return (
    <Card className="w-full max-w-sm shadow-xl/30">
      <CardHeader>
        <LogInIcon className="mb-2 size-5" aria-hidden />
        <CardTitle className="font-heading text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>Ingresa tus datos para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
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
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
                placeholder="********"
              />
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember" className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                />
                Recordarme
              </label>
              <Link
                href="/forgot-password"
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Field>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner data-icon="inline-start" /> : null}
                Iniciar sesión
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
