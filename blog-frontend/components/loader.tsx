"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { FadeArc } from "@/components/ui/fade-arc"
import { cn } from "@/lib/utils"

const SLOW_AFTER_MS = 6000

interface LoaderProps {
  /** Texto para lectores de pantalla. */
  label?: string
  className?: string
}

// Spinner a pantalla completa, centrado vertical y horizontalmente. Reservado para
// guards de sesión (require-auth); para cargar contenido usa un skeleton.
// Aparece con ~200 ms de retraso para evitar parpadeos en cargas rápidas. Si la espera se
// alarga, avisa y ofrece recargar para no dejar al usuario atascado.
export function Loader({ label = "Cargando…", className }: LoaderProps) {
  const [slow, setSlow] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background", className)}
      style={{ animation: "loader-delayed-in 0.15s ease-out 0.2s backwards" }}
    >
      <style>{`@keyframes loader-delayed-in { from { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { [data-loader-arc] { animation: none !important } }`}</style>
      <div className="flex flex-col items-center gap-4">
        <FadeArc data-loader-arc aria-hidden role={undefined} className="size-10 text-primary" />
        <span className="sr-only">{label}</span>
        {/* Altura reservada para que el spinner no se desplace al aparecer el aviso */}
        <div className="flex h-16 flex-col items-center gap-2 text-sm text-muted-foreground">
          {slow ? (
            <>
              <span>Sigue cargando…</span>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
