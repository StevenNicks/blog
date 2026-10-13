import { DotGridBackground } from "@/components/layout/dot-grid-background"
import { GridBackground } from "@/components/layout/grid-background"
import type { BackgroundPattern } from "@/lib/types"

export function BackgroundPatternView({ pattern, contained }: { pattern: BackgroundPattern; contained?: boolean }) {
  if (pattern === "dot-grid") return <DotGridBackground contained={contained} />
  if (pattern === "grid") return <GridBackground contained={contained} />
  return null
}

// Fondo de las páginas de acceso (login, registro, recuperación de contraseña)
// según el ajuste elegido en el panel. El sitio público no lleva fondo.
export function SiteBackground({ pattern }: { pattern: BackgroundPattern }) {
  return <BackgroundPatternView pattern={pattern} />
}
