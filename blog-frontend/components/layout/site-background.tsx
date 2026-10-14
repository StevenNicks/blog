import { DotGridBackground } from "@/components/layout/dot-grid-background"
import { GridBackground } from "@/components/layout/grid-background"
import { DotsBackground } from "@/components/layout/dots-background"
import { SpotlightBackground } from "@/components/layout/spotlight-background"
import type { BackgroundPattern } from "@/lib/types"

export function BackgroundPatternView({ pattern, contained }: { pattern: BackgroundPattern; contained?: boolean }) {
  if (pattern === "dot-grid") return <DotGridBackground contained={contained} />
  if (pattern === "grid") return <GridBackground contained={contained} />
  if (pattern === "dots") return <DotsBackground contained={contained} />
  if (pattern === "spotlight") return <SpotlightBackground contained={contained} />
  return null
}

// Fondo de las páginas de acceso (login, registro, recuperación de contraseña),
// Mi perfil y Ajustes
// según el ajuste elegido en el panel. El sitio público no lleva fondo.
export function SiteBackground({ pattern, contained }: { pattern: BackgroundPattern; contained?: boolean }) {
  return <BackgroundPatternView pattern={pattern} contained={contained} />
}
