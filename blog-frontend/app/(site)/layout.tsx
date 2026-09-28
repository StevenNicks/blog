import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteBackground } from "@/components/layout/site-background"
import { getBackgroundPattern } from "@/lib/api/settings"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const pattern = await getBackgroundPattern()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground pattern={pattern} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
