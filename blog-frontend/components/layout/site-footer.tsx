export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Blog. Todos los derechos reservados.</p>
        <p>Hecho con Next.js y shadcn/ui.</p>
      </div>
    </footer>
  )
}
