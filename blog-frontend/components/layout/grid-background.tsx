import { cn } from "@/lib/utils"

// Cuadrícula suave anclada a la parte superior del viewport, desvanecida hacia
// los bordes. Intensidad: subir/bajar la opacidad para ajustarla.
// `contained` la posiciona dentro de su contenedor (para vistas previas).
export function GridBackground({ contained = false }: { contained?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none inset-x-0 top-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_78%)] dark:opacity-[0.22]",
        contained ? "absolute h-full" : "fixed -z-10 h-svh"
      )}
    />
  )
}
