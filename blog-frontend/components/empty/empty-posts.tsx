import Link from "next/link"
import { PlusIcon } from "lucide-react"

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

// Cubierta de artículo: imagen, título y texto
function ArticleBody({ lines = 3 }: { lines?: number }) {
  return (
    <>
      <div className="mb-2 h-10 rounded-md bg-muted" />
      <div className="mb-1.5 h-2 w-4/5 rounded bg-muted-foreground/30" />
      <div className="flex flex-col gap-1">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn("h-1.5 rounded bg-muted", i === lines - 1 ? "w-2/3 bg-muted/60" : "w-full")} />
        ))}
      </div>
    </>
  )
}

function PostsIllustration() {
  return (
    <div className="relative h-40 w-96 max-w-full" aria-hidden="true">
      <IllustrationGhosts>
        <div className={cn(ghostCard, "top-7 -left-2 w-40 scale-95 opacity-60")}>
          <ArticleBody />
        </div>
        <div className={cn(ghostCard, "top-7 -right-2 w-40 scale-95 opacity-60")}>
          <ArticleBody />
        </div>
      </IllustrationGhosts>

      <IllustrationGlow className="h-28 w-48" />
      <div className={cn(featuredCard, "w-48")}>
        <ArticleBody />
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="h-4 w-10 rounded-full bg-primary/25" />
          <div className="h-4 w-12 rounded-full bg-muted" />
        </div>
      </div>

      <IllustrationFade />
    </div>
  )
}

interface EmptyPostsProps {
  /**
   * `dashboard`: el autor aún no tiene posts y puede crear uno.
   * `public`: el lector no puede hacer nada; solo se le pide volver más tarde.
   */
  variant?: "dashboard" | "public"
  className?: string
}

/** Todavía no existe ningún post. Para una búsqueda o filtro sin resultados usa EmptySearch. */
export function EmptyPosts({ variant = "dashboard", className }: EmptyPostsProps) {
  const isDashboard = variant === "dashboard"

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <Empty className={cn("px-2 sm:px-6", "min-h-[40vh] py-12", className)}>
        <EmptyHeader className="w-full">
          <EmptyMedia className="w-full">
            <PostsIllustration />
          </EmptyMedia>
          <EmptyTitle>{isDashboard ? "Aún no hay posts" : "Aún no hay posts publicados"}</EmptyTitle>
          <EmptyDescription>
            {isDashboard
              ? "Crea tu primer post para empezar a publicar contenido."
              : "Vuelve pronto, estamos preparando contenido nuevo."}
          </EmptyDescription>
        </EmptyHeader>
        {isDashboard ? (
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard/posts/new">
                <PlusIcon data-icon="inline-start" />
                Nuevo post
              </Link>
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  )
}
