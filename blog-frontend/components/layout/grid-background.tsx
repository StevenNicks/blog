import { cn } from "@/lib/utils"

// Cuadrícula suave (Aceternity "Grid Background"): líneas finas de 40px con un
// velo que las desvanece hacia el centro de la pantalla. Usa los tokens del
// tema, así que sigue el modo claro/oscuro. `contained` la posiciona dentro de
// su contenedor (para vistas previas).
export function GridBackground({ contained = false }: { contained?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none inset-0 overflow-hidden bg-background",
        contained ? "absolute" : "fixed -z-10"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 text-foreground/10 [background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]"
        )}
      />
      {/* Velo radial: el centro queda limpio y las líneas aparecen hacia los bordes */}
      <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </div>
  )
}
