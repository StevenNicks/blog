import Link from "next/link"
import { SearchIcon, XIcon } from "lucide-react"

import {
  featuredCard,
  ghostCard,
  IllustrationFade,
  IllustrationGhosts,
  IllustrationGlow,
} from "@/components/empty/empty-illustration"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

// Fila de resultado fantasma: cuadro y dos líneas
function ResultRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="size-6 shrink-0 rounded-md bg-muted" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-1.5 w-3/4 rounded bg-muted-foreground/20" />
        <div className="h-1.5 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}

function SearchIllustration({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("relative", compact ? "h-28 w-72 max-w-full" : "h-36 w-96 max-w-full")} aria-hidden="true">
      <IllustrationGhosts>
        <div className={cn(ghostCard, "top-7 -left-2 flex w-40 scale-95 flex-col gap-2.5 opacity-60")}>
          <ResultRow />
          <ResultRow />
        </div>
        <div className={cn(ghostCard, "top-7 -right-2 flex w-40 scale-95 flex-col gap-2.5 opacity-60")}>
          <ResultRow />
          <ResultRow />
        </div>
      </IllustrationGhosts>

      <IllustrationGlow className="h-16 w-60" />
      {/* Campo de búsqueda destacado y, debajo, el hueco donde irían los resultados */}
      <div className={cn(featuredCard, "w-60 p-2.5")}>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-2">
          <SearchIcon className="size-4 shrink-0 text-foreground" />
          <div className="h-2 w-24 rounded bg-muted-foreground/30" />
          <div className="ml-auto flex size-4 items-center justify-center rounded-full bg-muted-foreground/20">
            <XIcon className="size-2.5 text-foreground" strokeWidth={3} />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-dashed border-border px-2 py-2">
          <ResultRow className="flex-1 opacity-60" />
        </div>
      </div>

      <IllustrationFade />
    </div>
  )
}

interface EmptySearchProps {
  /** Texto buscado: si hay, la descripción habla de la búsqueda; si no, de los filtros. */
  query?: string
  /** Plural de lo que se buscaba ("posts", "usuarios"). Sin él, "resultados". */
  entity?: string
  /** Con `onClear` se muestra el botón para vaciar la búsqueda o los filtros. */
  onClear?: () => void
  /** Alternativa a `onClear` para componentes de servidor: el botón es un enlace a esta ruta. */
  clearHref?: string
  clearLabel?: string
  /** Versión reducida para diálogos o paneles pequeños. */
  compact?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
  /** Acciones extra junto a "Limpiar". */
  children?: React.ReactNode
}

/** Una búsqueda o filtro que no devolvió nada. Para "todavía no hay nada" usa el vacío propio del módulo. */
export function EmptySearch({
  query,
  entity,
  onClear,
  clearHref,
  clearLabel = "Limpiar búsqueda",
  compact = false,
  title,
  description,
  className,
  children,
}: EmptySearchProps) {
  const trimmed = query?.trim()

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <Empty className={cn("px-2 sm:px-6", compact ? "py-6" : "min-h-[40vh] py-12", className)}>
        <EmptyHeader className="w-full">
          <EmptyMedia className="w-full">
            <SearchIllustration compact={compact} />
          </EmptyMedia>
          <EmptyTitle>{title ?? (entity ? `No se encontraron ${entity}` : "Sin resultados")}</EmptyTitle>
          <EmptyDescription>
            {description ??
              (trimmed
                ? "Nada coincide con tu búsqueda. Revisa la ortografía o prueba con otros términos."
                : "Prueba con otros términos o cambia los filtros.")}
          </EmptyDescription>
        </EmptyHeader>
        {onClear || clearHref || children ? (
          <EmptyContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {onClear ? (
                <Button variant="outline" onClick={onClear}>
                  {clearLabel}
                </Button>
              ) : clearHref ? (
                <Button asChild variant="outline">
                  <Link href={clearHref}>{clearLabel}</Link>
                </Button>
              ) : null}
              {children}
            </div>
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  )
}
