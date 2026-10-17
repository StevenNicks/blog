import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"

interface LoadErrorProps {
  title?: string
  description?: string
  onRetry: () => void
  className?: string
}

// Estado final de error para cualquier carga: mensaje + reintento, nunca un vacío engañoso.
export function LoadError({
  title = "No se pudo cargar",
  description = "Revisa tu conexión e inténtalo de nuevo.",
  onRetry,
  className,
}: LoadErrorProps) {
  return (
    <Empty role="alert" className={cn("min-h-[40vh]", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  )
}
