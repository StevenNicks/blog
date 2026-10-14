import { FadeArc } from "@/components/ui/fade-arc"
import { cn } from "@/lib/utils"

interface LoaderProps {
  /** Texto para lectores de pantalla. */
  label?: string
  className?: string
}

// Spinner a pantalla completa, centrado vertical y horizontalmente. Reservado para
// guards de sesión (require-auth); para cargar contenido usa un skeleton.
// Aparece con ~200 ms de retraso para evitar parpadeos en cargas rápidas.
export function Loader({ label = "Cargando…", className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background", className)}
      style={{ animation: "loader-delayed-in 0.15s ease-out 0.2s backwards" }}
    >
      <style>{`@keyframes loader-delayed-in { from { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { [data-loader-arc] { animation: none !important } }`}</style>
      <FadeArc data-loader-arc aria-hidden role={undefined} className="size-10 text-primary" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
