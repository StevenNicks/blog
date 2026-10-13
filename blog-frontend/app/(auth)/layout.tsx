import Link from "next/link"

import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SiteBackground } from "@/components/layout/site-background"
import { Logo } from "@/components/logo"
import { getBackgroundPattern } from "@/lib/api/settings"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const pattern = await getBackgroundPattern()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteBackground pattern={pattern} />
      <header className="flex items-center justify-between p-4 sm:p-6">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
          <Logo />
          Blog
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">{children}</main>
    </div>
  )
}
