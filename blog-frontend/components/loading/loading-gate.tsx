"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { useDelayedLoading } from "@/hooks/use-delayed-loading"

const SLOW_AFTER_MS = 5000

interface LoadingGateProps {
  loading: boolean
  /** Skeleton con la forma del contenido final. */
  skeleton: React.ReactNode
  /** Si se indica, se ofrece "Reintentar" cuando la carga tarda demasiado. */
  onRetry?: () => void
  children: React.ReactNode
}

// Muestra el skeleton solo si la carga no es instantánea (sin parpadeos), lo marca como
// ocupado para lectores de pantalla y avisa si la espera se alarga.
export function LoadingGate({ loading, skeleton, onRetry, children }: LoadingGateProps) {
  const visible = useDelayedLoading(loading)
  const [slow, setSlow] = React.useState(false)

  React.useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    return () => {
      clearTimeout(timer)
      setSlow(false)
    }
  }, [loading])

  if (!loading && !visible) return <>{children}</>
  // Durante el retraso previo el skeleton ya está en el DOM pero invisible: el contenedor
  // conserva su altura y no hay salto de layout cuando aparece (ni cuando llegan los datos).
  if (!visible) {
    return (
      <div aria-busy="true" className="invisible">
        {skeleton}
      </div>
    )
  }

  return (
    <div aria-busy="true">
      {skeleton}
      {loading && slow ? (
        <div role="status" className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>Sigue cargando…</span>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
