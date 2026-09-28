import { FadeArc } from "@/components/ui/fade-arc"
import { cn } from "@/lib/utils"

interface LoaderProps {
  /** Texto para lectores de pantalla. */
  label?: string
  className?: string
}

// Spinner a pantalla completa, centrado vertical y horizontalmente. Cubre el
// contenido mientras un módulo carga.
export function Loader({ label = "Cargando…", className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background", className)}
    >
      <FadeArc aria-hidden role={undefined} className="size-10 text-primary" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
