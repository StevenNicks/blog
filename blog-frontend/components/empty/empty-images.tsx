import { UploadIcon } from "lucide-react"

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
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

// Marco de foto: sol y montañas
function PhotoFrame({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-4/3 overflow-hidden rounded-md bg-muted/70", className)}>
      <div className="absolute top-[18%] right-[18%] size-[16%] rounded-full bg-muted-foreground/25" />
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[55%] w-full text-muted-foreground/25"
        fill="currentColor"
      >
        <path d="M0 60 L0 38 L24 12 L46 40 L62 24 L100 52 L100 60 Z" />
      </svg>
    </div>
  )
}

function GalleryIllustration({ compact }: { compact?: boolean }) {
  return (
    // La altura debe alcanzar a la foto destacada (cuya altura sale de su proporción 4/3) o se sale del recuadro
    <div className={cn("relative", compact ? "h-32 w-72 max-w-full" : "h-40 w-96 max-w-full")} aria-hidden="true">
      <IllustrationGhosts>
        <div className={cn(ghostCard, "top-7 -left-2 scale-95 p-2 opacity-60", compact ? "w-28" : "w-36")}>
          <PhotoFrame />
        </div>
        <div className={cn(ghostCard, "top-7 -right-2 scale-95 p-2 opacity-60", compact ? "w-28" : "w-36")}>
          <PhotoFrame />
        </div>
      </IllustrationGhosts>

      <IllustrationGlow className={compact ? "h-20 w-32" : "h-28 w-40"} />
      <div className={cn(featuredCard, "p-2", compact ? "w-32" : "w-40")}>
        <PhotoFrame />
        <div className="mt-2 flex items-center gap-2 px-0.5 pb-0.5">
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-1.5 w-2/3 rounded bg-muted-foreground/30" />
            <div className="h-1.5 w-1/3 rounded bg-muted" />
          </div>
          <div className="h-4 w-8 rounded-full bg-primary/25" />
        </div>
      </div>

      <IllustrationFade />
    </div>
  )
}

interface EmptyImagesProps {
  /** Con `onUpload` se muestra el botón "Subir imágenes"; sin él, el vacío es solo informativo. */
  onUpload?: () => void
  uploading?: boolean
  /** Versión reducida para diálogos o paneles pequeños. */
  compact?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  className?: string
}

/** Biblioteca de imágenes sin ninguna imagen todavía. */
export function EmptyImages({
  onUpload,
  uploading = false,
  compact = false,
  title = "Aún no hay imágenes",
  description = "Sube tu primera imagen para usarla en tus posts. Admite JPG, PNG, WebP y GIF.",
  className,
}: EmptyImagesProps) {
  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <Empty className={cn("px-2 sm:px-6", compact ? "py-6" : "min-h-[40vh] py-12", className)}>
        <EmptyHeader className="w-full">
          <EmptyMedia className="w-full">
            <GalleryIllustration compact={compact} />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {onUpload ? (
          <EmptyContent>
            <Button onClick={onUpload} disabled={uploading}>
              {uploading ? <Spinner data-icon="inline-start" /> : <UploadIcon data-icon="inline-start" />}
              Subir imágenes
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </div>
  )
}
