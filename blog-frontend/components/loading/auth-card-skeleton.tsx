import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Fallback de Suspense para las páginas de acceso: misma tarjeta que el formulario final.
export function AuthCardSkeleton() {
  return (
    <Card className="w-full max-w-sm shadow-xl/30" aria-busy="true">
      <span className="sr-only" role="status">
        Cargando…
      </span>
      <CardHeader>
        <Skeleton className="mb-2 size-5" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}
