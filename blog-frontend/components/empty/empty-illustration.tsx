import { cn } from "@/lib/utils"

// Piezas comunes de las ilustraciones de los estados vacíos: una tarjeta destacada con anillo y
// resplandor, comentarios/fotos/artículos "fantasma" que se desvanecen hacia los lados y un
// desvanecido inferior. Cada Empty* dibuja su propio contenido con estas piezas.

/** Clases de la tarjeta destacada (centrada, con anillo del color primario). */
export const featuredCard =
  "absolute top-0 left-1/2 max-w-full -translate-x-1/2 rounded-xl border border-border bg-background p-3 shadow-md ring-1 ring-primary/40"

/** Clases de una tarjeta fantasma: borde y sombra tenues; la posición y la opacidad las pone quien la usa. */
export const ghostCard = "absolute rounded-xl border border-border/60 bg-background p-3 shadow-xs"

/** Capa que desvanece hacia los lados todo lo que contiene. */
export function IllustrationGhosts({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 mask-[linear-gradient(to_right,transparent,black_28%,black_72%,transparent)]">
      {children}
    </div>
  )
}

/** Resplandor suave tras la tarjeta destacada; `className` ajusta su tamaño. */
export function IllustrationGlow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute top-0 left-1/2 h-24 w-56 -translate-x-1/2 rounded-2xl bg-primary/15 blur-2xl",
        className
      )}
    />
  )
}

/** Desvanecido hacia el fondo en la parte inferior de la ilustración. */
export function IllustrationFade() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-background/0 to-background" />
  )
}
