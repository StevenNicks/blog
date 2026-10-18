import { CheckIcon, HeartIcon, ReplyIcon } from "lucide-react"

import {
  featuredCard,
  ghostCard,
  IllustrationFade,
  IllustrationGhosts,
  IllustrationGlow,
} from "@/components/empty/empty-illustration"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

// Comentario "fantasma": solo la silueta de un comentario (avatar, nombre y texto)
function GhostComment({ className }: { className?: string }) {
  return (
    <div className={cn(ghostCard, "w-44", className)}>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="size-6 shrink-0 rounded-full bg-muted" />
        <div className="h-2 w-16 rounded bg-muted-foreground/20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 w-full rounded bg-muted" />
        <div className="h-1.5 w-4/5 rounded bg-muted" />
      </div>
    </div>
  )
}

// Pastilla de acción dentro del comentario destacado
function Pill({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex h-5 min-w-12 items-center justify-center gap-1 rounded-full bg-muted px-2", className)}>
      {children}
    </div>
  )
}

type Variant = "moderation" | "caughtUp" | "post"

function ConversationIllustration({ variant }: { variant: Variant }) {
  const compact = variant === "post"

  return (
    <div className={cn("relative", compact ? "h-28 w-72 max-w-full" : "h-36 w-96 max-w-full")} aria-hidden="true">
      {/* Comentarios de fondo que se desvanecen hacia los lados */}
      <IllustrationGhosts>
        <GhostComment className="top-6 -left-2 scale-95 opacity-60" />
        <GhostComment className="top-6 -right-2 scale-95 opacity-60" />
      </IllustrationGhosts>

      {/* Resplandor tras el comentario destacado */}
      <IllustrationGlow />

      {/* Comentario destacado */}
      <div className={cn(featuredCard, "w-56")}>
        <div className="mb-2.5 flex items-center gap-2">
          <div className="relative size-8 shrink-0 rounded-full bg-muted">
            {variant === "caughtUp" ? (
              <div className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                <CheckIcon className="size-2.5" strokeWidth={3} />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-20 rounded bg-muted-foreground/30" />
            <div className="h-1.5 w-10 rounded bg-muted" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full rounded bg-muted-foreground/20" />
          <div className="h-1.5 w-11/12 rounded bg-muted-foreground/20" />
          {!compact ? <div className="h-1.5 w-2/3 rounded bg-muted" /> : null}
        </div>
        {/* Pie: moderar, o reaccionar y responder dentro de un post */}
        <div className="mt-3 flex items-center gap-1.5">
          {variant === "post" ? (
            <>
              <Pill>
                <HeartIcon className="size-2.5 text-muted-foreground" />
              </Pill>
              <Pill>
                <ReplyIcon className="size-2.5 text-muted-foreground" />
              </Pill>
            </>
          ) : variant === "caughtUp" ? (
            <Pill className="bg-primary/20 px-2.5">
              <CheckIcon className="size-2.5 text-foreground" strokeWidth={3} />
              <div className="h-1 w-6 rounded bg-foreground/40" />
            </Pill>
          ) : (
            <>
              <Pill className="bg-primary/25">
                <div className="h-1 w-5 rounded bg-foreground/40" />
              </Pill>
              <Pill>
                <div className="h-1 w-4 rounded bg-muted-foreground/40" />
              </Pill>
              <Pill>
                <div className="h-1 w-4 rounded bg-muted-foreground/40" />
              </Pill>
            </>
          )}
        </div>
      </div>

      {/* Desvanecido inferior */}
      <IllustrationFade />
    </div>
  )
}

const COPY = {
  moderation: {
    title: "Aún no hay comentarios",
    description: "Cuando los lectores comenten tus posts, aparecerán aquí para moderarlos.",
  },
  caughtUp: {
    title: "Todo al día",
    description: "No hay comentarios pendientes de moderar.",
  },
  post: {
    title: "Sé el primero en comentar",
    description: "Aún no hay comentarios en este post.",
  },
} as const

interface EmptyCommentsProps {
  /**
   * `moderation`: el panel no tiene ningún comentario.
   * `caughtUp`: el filtro "pendientes" está vacío, es una buena noticia.
   * `post`: dentro de un post, compacto; el formulario de comentar queda justo encima.
   */
  variant?: Variant
  className?: string
}

/** Todavía no hay comentarios. Para un filtro por estado sin resultados usa EmptySearch. */
export function EmptyComments({ variant = "moderation", className }: EmptyCommentsProps) {
  const { title, description } = COPY[variant]
  const compact = variant === "post"

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <Empty className={cn("px-2 sm:px-6", compact ? "py-6" : "min-h-[40vh] py-12", className)}>
        <EmptyHeader className="w-full">
          <EmptyMedia className="w-full">
            <ConversationIllustration variant={variant} />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
