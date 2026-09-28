import { cn } from "@/lib/utils"

// Fondo fijo a pantalla completa: cuadrícula de líneas finas con un punto en
// cada intersección. Usa `currentColor`, así que sigue el modo claro/oscuro
// como el resto de la app. Es decorativo (`aria-hidden`), queda detrás de todo
// (`-z-10`) y nunca intercepta eventos del puntero.
// `contained` lo posiciona dentro de su contenedor (para vistas previas).
const CELL = 80

// Desvanece la cuadrícula hacia los bordes y esquinas (opaca en el centro,
// invisible en el borde) en lugar de cortarla en seco en el borde del viewport.
const EDGE_FADE_MASK = "radial-gradient(ellipse 80% 80% at 50% 50%, black 35%, transparent 85%)"

export function DotGridBackground({ contained = false }: { contained?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none inset-0 overflow-hidden bg-background",
        contained ? "absolute" : "fixed -z-10"
      )}
    >
      <div
        className="absolute inset-0 text-foreground/10"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px),
            radial-gradient(circle, currentColor 2px, transparent 2px)
          `,
          backgroundSize: `${CELL}px ${CELL}px`,
          // Un radial-gradient se centra en su propia celda, no en la esquina:
          // se desplaza media celda para alinear el punto con las intersecciones
          // (+0.5px porque el trazo de 1px está centrado en el punto de la rejilla).
          backgroundPosition: `0 0, 0 0, ${-CELL / 2 + 0.5}px ${-CELL / 2 + 0.5}px`,
          maskImage: EDGE_FADE_MASK,
          WebkitMaskImage: EDGE_FADE_MASK,
        }}
      />
    </div>
  )
}
