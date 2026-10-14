import { cn } from "@/lib/utils"

// Puntos (Aceternity "Dot Background"): trama de puntos cada 20px con un velo
// que la desvanece hacia el centro. Sigue el modo claro/oscuro con los tokens.
// `contained` lo posiciona dentro de su contenedor (para vistas previas).
export function DotsBackground({ contained = false }: { contained?: boolean }) {
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
          "absolute inset-0 text-foreground/25 [background-size:20px_20px]",
          "[background-image:radial-gradient(currentColor_1px,transparent_1px)]"
        )}
      />
      <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
    </div>
  )
}
