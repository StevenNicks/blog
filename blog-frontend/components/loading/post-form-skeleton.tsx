import { Skeleton } from "@/components/ui/skeleton"

function FieldSkeleton({ inputClass = "h-9" }: { inputClass?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className={`w-full ${inputClass}`} />
    </div>
  )
}

// Misma estructura que PostForm (cabecera con acciones + columna principal 2/3 + lateral 1/3).
export function PostFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <FieldSkeleton />
          <FieldSkeleton inputClass="h-[360px]" />
          <FieldSkeleton inputClass="h-20" />
        </div>
        <div className="flex flex-col gap-6">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton inputClass="aspect-1200/630 h-auto" />
        </div>
      </div>
    </div>
  )
}
