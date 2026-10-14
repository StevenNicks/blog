import { BackgroundSync } from "@/components/layout/background-sync"
import { SiteBackground } from "@/components/layout/site-background"
import { getBackgroundPattern } from "@/lib/api/settings"

// El patrón de fondo elegido en Ajustes cubre toda el área de contenido.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const pattern = await getBackgroundPattern()

  return (
    <>
      <BackgroundSync />
      <SiteBackground pattern={pattern} contained />
      <div className="relative">{children}</div>
    </>
  )
}
