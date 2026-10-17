import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Misma estructura que PostCard para que no haya saltos de layout al llegar los datos.
function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0">
      <Skeleton className="aspect-16/9 rounded-none" />
      <CardHeader className="pt-5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-6 w-4/5" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function PostListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14" aria-busy="true">
      <span className="sr-only" role="status">
        Cargando posts…
      </span>
      <div aria-hidden className="flex flex-col">
        <section className="mb-10 flex flex-col items-center gap-6 sm:mb-14">
          <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-9 w-full max-w-md" />
        </section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* La página real pide 9 posts por página (3 filas en escritorio) */}
          {Array.from({ length: 9 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
