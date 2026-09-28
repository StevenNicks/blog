"use client"

import { usePathname } from "next/navigation"

import { DotGridBackground } from "@/components/layout/dot-grid-background"
import { GridBackground } from "@/components/layout/grid-background"
import type { BackgroundPattern } from "@/lib/types"

export function BackgroundPatternView({ pattern, contained }: { pattern: BackgroundPattern; contained?: boolean }) {
  if (pattern === "dot-grid") return <DotGridBackground contained={contained} />
  if (pattern === "grid") return <GridBackground contained={contained} />
  return null
}

// Fondo del sitio público según el ajuste elegido en el panel. En la lectura
// de un post (/posts/<slug>) no se muestra para no competir con el texto.
export function SiteBackground({ pattern }: { pattern: BackgroundPattern }) {
  const pathname = usePathname()
  if (pathname.startsWith("/posts/")) return null
  return <BackgroundPatternView pattern={pattern} />
}
