import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PostPaginationProps {
  page: number
  pages: number
  basePath: string
  searchParams: Record<string, string | undefined>
}

function hrefFor(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value)
  }
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function PostPagination({ page, pages, basePath, searchParams }: PostPaginationProps) {
  if (pages <= 1) return null

  const pageNumbers = new Set<number>([1, pages, page, page - 1, page + 1].filter((n) => n >= 1 && n <= pages))
  const sorted = [...pageNumbers].sort((a, b) => a - b)

  const items: (number | "ellipsis")[] = []
  let prev = 0
  for (const n of sorted) {
    if (prev && n - prev > 1) items.push("ellipsis")
    items.push(n)
    prev = n
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Anterior"
            href={hrefFor(basePath, searchParams, Math.max(1, page - 1))}
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>

        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={hrefFor(basePath, searchParams, item)} isActive={item === page}>
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            text="Siguiente"
            href={hrefFor(basePath, searchParams, Math.min(pages, page + 1))}
            aria-disabled={page === pages}
            className={page === pages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
