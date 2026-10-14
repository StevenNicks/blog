import { Spotlight } from "@/components/ui/spotlight"
import { cn } from "@/lib/utils"

// Foco de luz (Aceternity "Spotlight") sobre una cuadrícula tenue. El foco usa
// `currentColor`, así que es claro en modo oscuro y oscuro en modo claro.
// `contained` lo posiciona dentro de su contenedor (para vistas previas).
export function SpotlightBackground({ contained = false }: { contained?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none inset-0 overflow-hidden bg-background text-foreground",
        contained ? "absolute" : "fixed -z-10"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 text-foreground/[0.06] [background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]"
        )}
      />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="currentColor" />
    </div>
  )
}
