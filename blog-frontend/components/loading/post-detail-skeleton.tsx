import { Skeleton } from "@/components/ui/skeleton"

// Misma estructura que la página de detalle del post.
export function PostDetailSkeleton() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14" aria-busy="true">
      <span className="sr-only" role="status">
        Cargando post…
      </span>
      <div aria-hidden>
        <div className="mb-6 flex items-center gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        <Skeleton className="h-9 w-full sm:h-10" />
        <Skeleton className="mt-3 h-9 w-2/3 sm:h-10" />

        <div className="mt-6 flex items-center gap-4 border-y border-border py-4">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="ml-auto h-4 w-24" />
        </div>

        <Skeleton className="mt-8 aspect-16/9 rounded-xl" />

        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </article>
  )
}
