"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CircleAlertIcon, CircleCheckIcon, MailCheckIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ApiError } from "@/lib/api/client"
import { verifyEmailRequest } from "@/lib/api/auth"

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<Spinner className="size-6" />}>
      <VerifyEmailCard />
    </React.Suspense>
  )
}

type Status = "loading" | "success" | "error"

function VerifyEmailCard() {
  const token = useSearchParams().get("token") ?? ""
  const { user, refreshUser } = useAuth()
  const [status, setStatus] = React.useState<Status>(token ? "loading" : "error")
  const [message, setMessage] = React.useState(token ? "" : "El enlace de verificación no es válido.")
  const started = React.useRef(false)

  React.useEffect(() => {
    // El token es de un solo uso: evita la doble ejecución del modo estricto
    if (!token || started.current) return
    started.current = true
    verifyEmailRequest({ token })
      .then(async () => {
        setStatus("success")
        await refreshUser().catch(() => {})
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err instanceof ApiError ? err.message : "No se pudo verificar el correo.")
      })
  }, [token, refreshUser])

  const Icon = status === "success" ? CircleCheckIcon : status === "error" ? CircleAlertIcon : MailCheckIcon

  return (
    <Card className="w-full max-w-sm shadow-xl/30">
      <CardHeader>
        <Icon className="mb-2 size-5" aria-hidden />
        <CardTitle className="font-heading text-2xl">
          {status === "success" ? "Correo verificado" : status === "error" ? "No se pudo verificar" : "Verificando…"}
        </CardTitle>
        <CardDescription>
          {status === "success"
            ? "Tu dirección de correo quedó confirmada."
            : status === "error"
              ? message
              : "Estamos confirmando tu dirección de correo."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {status === "loading" ? <Spinner className="size-5" /> : null}
        {status !== "loading" ? (
          <Button asChild>
            <Link href={user ? "/dashboard/profile" : "/login"}>
              {user ? "Ir a mi perfil" : "Iniciar sesión"}
            </Link>
          </Button>
        ) : null}
        {status === "error" && user ? (
          <p className="text-center text-xs text-muted-foreground">
            Puedes pedir un nuevo enlace desde tu perfil.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
